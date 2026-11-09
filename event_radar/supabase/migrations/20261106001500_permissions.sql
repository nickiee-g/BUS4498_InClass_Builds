-- Stage 15: permissions and boundaries (what the agent may do on its own).
-- One row per switch or limit a moderator may change on the website, with who changed it and why.
-- The agent reads every row before it decides. Every permission starts with the value the plan gives it;
-- a moderator turns one on or off for a reason, and the reason is kept with the switch.
-- Only signed-in moderators can read or change these rows. Visitors (and so the text of a post) can't.

create table if not exists public.agent_permissions (
  key text primary key,                        -- such as publish_on_its_own
  label text not null,                         -- what the website shows, such as "Publish on its own"
  kind text not null check (kind in ('switch', 'number')),
  value text not null,                         -- 'on' or 'off' for a switch; a number, as text, for a limit
  reason text not null default '',             -- why it is set this way, in one sentence
  changed_by text not null default '',         -- the moderator who last changed it
  updated_at timestamptz not null default now(),
  sort integer not null default 0
);

-- Upgrade the earlier Week 11 table in place. Preserve moderator choices while converting
-- boolean/number JSON values to the text values this version of the agent reads.
do $$
declare value_type text;
begin
  select data_type into value_type
    from information_schema.columns
    where table_schema = 'public' and table_name = 'agent_permissions' and column_name = 'value';
  if value_type = 'jsonb' then
    alter table public.agent_permissions alter column value type text using
      case
        when kind = 'switch' and value::text in ('true', '"on"') then 'on'
        when kind = 'switch' then 'off'
        else trim(both '"' from value::text)
      end;
  end if;
end $$;

-- Keep the established controls and their reasons, but use the current contract's keys.
update public.agent_permissions set key = 'publish_on_its_own' where key = 'publish_on_own'
  and not exists (select 1 from public.agent_permissions where key = 'publish_on_its_own');
update public.agent_permissions set key = 'daily_limit' where key = 'posts_per_day'
  and not exists (select 1 from public.agent_permissions where key = 'daily_limit');
update public.agent_permissions set label = 'Publish on its own' where key = 'publish_on_its_own';
update public.agent_permissions set label = 'Posts per day' where key = 'daily_limit';

-- Existing sort values are unique. Move them out of the way before setting the Stage 15 order.
update public.agent_permissions set sort = sort + 1000;
update public.agent_permissions set sort = case key
  when 'publish_on_its_own' then 1
  when 'paused' then 2
  when 'daily_limit' then 3
  when 'days_ahead' then 4
  when 'new_club_wait_days' then 5
  when 'max_post_length' then 6
  else sort
end;

alter table public.agent_permissions enable row level security;
alter table public.agent_permissions drop constraint if exists agent_permissions_value_valid;
alter table public.agent_permissions add constraint agent_permissions_value_valid check (
  (kind = 'switch' and value in ('on', 'off')) or
  (kind = 'number' and value ~ '^[0-9]+$')
);

drop policy if exists "Moderators can read permissions" on public.agent_permissions;
create policy "Moderators can read permissions"
  on public.agent_permissions for select
  to authenticated
  using (true);

drop policy if exists "Moderators can change permissions" on public.agent_permissions;
drop policy if exists "Moderators can change agent permission values" on public.agent_permissions;
create policy "Moderators can change permissions"
  on public.agent_permissions for update
  to authenticated
  using (key <> 'max_post_length')
  with check (key <> 'max_post_length');

-- Nothing for anon. (Some projects hand every new table to visitors by default, so take that back first.)
revoke all on public.agent_permissions from public, anon, authenticated;
grant select on public.agent_permissions to authenticated;
grant update (value, reason, changed_by, updated_at) on public.agent_permissions to authenticated;
grant select, insert, update, delete on public.agent_permissions to service_role;

-- The switches and limits from runtime/permissions-plan.md. A row that already exists is left alone,
-- so running this file again never resets a moderator's choice.
insert into public.agent_permissions (key, label, kind, value, reason, sort) values
  ('publish_on_its_own', 'Publish on its own', 'switch', 'on', 'A post that passes every rule goes straight to the website. Off: every post waits for a moderator.', 1),
  ('paused', 'Paused', 'switch', 'off', 'The off switch. On: the agent answers "paused" and does nothing, with no AI call.', 2),
  ('daily_limit', 'Posts per day', 'number', '100', 'The spending limit: after this many posts in 24 hours, the agent refuses new ones until tomorrow.', 3),
  ('days_ahead', 'Days ahead', 'number', '60', 'An event further away than this waits for a moderator (rule R8).', 4),
  ('new_club_wait_days', 'New-club wait (days)', 'number', '30', 'Posts from a club added to the list within this many days wait for a moderator. 0 turns it off.', 5),
  ('max_post_length', 'Post length (characters)', 'number', '2000', 'Fixed builder limit. Change only in code.', 6)
on conflict (key) do nothing;

-- Signed-in edits must include a reason and must identify the signed-in user's email.
create or replace function public.validate_agent_permission_edit()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null then
    if length(trim(new.reason)) = 0 then
      raise exception 'A reason is required to change a permission.';
    end if;
    if coalesce(new.changed_by, '') <> coalesce(auth.jwt() ->> 'email', '') then
      raise exception 'changed_by must be the signed-in moderator email.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists validate_agent_permission_edit on public.agent_permissions;
create trigger validate_agent_permission_edit before update on public.agent_permissions
  for each row execute function public.validate_agent_permission_edit();
revoke all on function public.validate_agent_permission_edit() from public, anon, authenticated;

-- Never delete a post, even through an older moderator policy or a service-role query.
drop policy if exists "Moderators can clear the board" on public.events;
drop policy if exists "Moderators can clear events" on public.events;
revoke delete on public.events from public, anon, authenticated, service_role;

-- When each club joined the list, for the new-club wait. Clubs already on the list keep the day they were
-- created; the six starter clubs count from the start of the quarter.
alter table public.clubs add column if not exists added_on date not null default current_date;
update public.clubs set added_on = (created_at at time zone 'America/Los_Angeles')::date
  where added_on = current_date and created_at < now() - interval '1 hour';
update public.clubs set added_on = '2026-09-22'
  where name in ('Board Game Guild', 'Mustang Pitch Society', 'Women in Finance Circle', 'Sustainability Crew', 'Accounting Society', 'Cal Poly Ski & Snowboard Club');

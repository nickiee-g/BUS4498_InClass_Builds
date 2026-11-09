-- Week 11: moderator-controlled agent permissions and hard deletion boundary.
create table if not exists public.agent_permissions (
  key text primary key,
  label text not null,
  kind text not null check (kind in ('switch', 'number')),
  value jsonb not null,
  reason text not null default '',
  changed_by text not null default '',
  updated_at timestamptz not null default now(),
  sort integer not null unique
);

alter table public.agent_permissions enable row level security;
revoke all on public.agent_permissions from anon, authenticated;

drop policy if exists "Moderators can read agent permissions" on public.agent_permissions;
create policy "Moderators can read agent permissions" on public.agent_permissions
  for select to authenticated using (true);
drop policy if exists "Moderators can change agent permission values" on public.agent_permissions;
create policy "Moderators can change agent permission values" on public.agent_permissions
  for update to authenticated using (true) with check (true);
grant select on public.agent_permissions to authenticated;
grant update (value, reason, changed_by, updated_at) on public.agent_permissions to authenticated;
grant select, insert, update, delete on public.agent_permissions to service_role;

insert into public.agent_permissions (key, label, kind, value, reason, sort) values
  ('paused', 'Paused', 'switch', 'false'::jsonb, 'The agent is available.', 0),
  ('publish_on_own', 'Publish on its own', 'switch', 'true'::jsonb, 'Posts that pass every rule may publish automatically.', 1),
  ('posts_per_day', 'Posts per day', 'number', '100'::jsonb, 'After this many posts in 24 hours, the agent refuses new posts.', 2),
  ('days_ahead', 'Days ahead', 'number', '60'::jsonb, 'Events further out wait for a moderator (rule R8).', 3),
  ('new_club_wait_days', 'New-club wait (days)', 'number', '30'::jsonb, 'A newly listed club waits for this many days.', 4),
  ('max_post_length', 'Post length (characters)', 'number', '2000'::jsonb, 'Fixed builder limit. Change only in code.', 5)
on conflict (key) do nothing;

-- Post length is a code-owned setting: a signed-in moderator cannot change it through the table API.
create or replace function public.keep_agent_builder_limits_fixed()
returns trigger language plpgsql as $$
begin
  if auth.role() = 'authenticated' and old.key = 'max_post_length' and new.value is distinct from old.value then
    raise exception 'Post length is fixed by the builders.';
  end if;
  return new;
end;
$$;
drop trigger if exists agent_permissions_fixed_limits on public.agent_permissions;
create trigger agent_permissions_fixed_limits before update on public.agent_permissions
  for each row execute function public.keep_agent_builder_limits_fixed();
revoke all on function public.keep_agent_builder_limits_fixed() from public, anon, authenticated;

-- The plan says posts are never deleted. Remove the old moderator clear-board grant and policy.
drop policy if exists "Moderators can clear the board" on public.events;
drop policy if exists "Moderators can clear events" on public.events;
revoke delete on public.events from public, anon, authenticated, service_role;

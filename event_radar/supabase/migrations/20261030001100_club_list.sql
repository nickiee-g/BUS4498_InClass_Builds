-- Stage 11: editable club knowledge and notes about what the agent checked.
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  nicknames text not null default '',
  usual_place_code text not null default '',
  usual_place_detail text not null default '',
  active boolean not null default true,
  note text not null default ''
);

alter table public.clubs enable row level security;
revoke all on public.clubs from anon, authenticated;
grant select (id, name, nicknames, active) on public.clubs to anon, authenticated;
grant all on public.clubs to service_role;

drop policy if exists "Active clubs are visible to everyone" on public.clubs;
create policy "Active clubs are visible to everyone"
  on public.clubs for select
  to anon, authenticated
  using (active);

insert into public.clubs (name, nicknames, usual_place_code, usual_place_detail)
values
  ('Board Game Guild', 'BGG, board game club', 'UU', 'Room 220'),
  ('Mustang Pitch Society', '', '', ''),
  ('Women in Finance Circle', '', '', ''),
  ('Sustainability Crew', '', '', ''),
  ('Accounting Society', '', '', ''),
  ('Cal Poly Ski & Snowboard Club', '', '', '')
on conflict (name) do nothing;

alter table public.events
  add column if not exists agent_notes text[] not null default '{}';

drop policy if exists "Moderators can clear events" on public.events;
create policy "Moderators can clear events"
  on public.events for delete
  to authenticated
  using (true);
grant delete on public.events to authenticated;

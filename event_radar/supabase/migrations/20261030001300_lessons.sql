create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lesson text not null check (char_length(lesson) between 5 and 300),
  active boolean not null default true,
  created_by text not null default '',
  from_post uuid
);

alter table public.lessons enable row level security;
revoke all on public.lessons from anon, authenticated;

create policy "Moderators can read lessons" on public.lessons
  for select to authenticated using (true);
create policy "Moderators can add lessons" on public.lessons
  for insert to authenticated with check (true);
create policy "Moderators can switch lessons" on public.lessons
  for update to authenticated using (true) with check (true);

grant select on public.lessons to authenticated;
grant insert (lesson, created_by, from_post) on public.lessons to authenticated;
grant update (active) on public.lessons to authenticated;
grant all on public.lessons to service_role;

alter table public.events
  add column if not exists lessons_used text[] not null default '{}';

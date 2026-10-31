-- Stage 12: let a moderator retire a replaced post and link pending updates.
alter table public.events
  drop constraint if exists events_status_check;

alter table public.events
  add constraint events_status_check
  check (status = any (array['published', 'waiting', 'rejected', 'archived', 'replaced']::text[]));

alter table public.events
  add column if not exists replaced_by uuid,
  add column if not exists updates_id uuid;

drop policy if exists "Moderators can review waiting events" on public.events;
create policy "Moderators can review waiting events"
  on public.events for update
  to authenticated
  using (status in ('published', 'waiting'))
  with check (status in ('published', 'waiting', 'rejected', 'replaced'));

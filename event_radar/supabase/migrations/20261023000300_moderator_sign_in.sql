-- Moderator sessions can review every event, but can edit only review fields.
grant select on table public.events to authenticated;

revoke update on table public.events from authenticated;
grant update (status, status_reason, reviewed_at, reviewed_by)
  on table public.events to authenticated;

drop policy if exists "Moderators can read all events" on public.events;
drop policy if exists "Moderators can review waiting events" on public.events;

create policy "Moderators can read all events"
  on public.events
  for select
  to authenticated
  using (true);

create policy "Moderators can review waiting events"
  on public.events
  for update
  to authenticated
  using (status = 'waiting')
  with check (status in ('published', 'waiting', 'rejected'));

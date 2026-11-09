-- Remove the live delete policy used by this project and revoke DELETE from every API role.
drop policy if exists "Moderators can clear events" on public.events;
drop policy if exists "Moderators can clear the board" on public.events;
revoke delete on public.events from public, anon, authenticated, service_role;

-- Stage 14: connect GroupMe messages to the event agent.
alter table public.events
  add column if not exists source text not null default '',
  add column if not exists source_id text not null default '',
  add column if not exists source_name text not null default '';

create unique index if not exists events_one_per_message
  on public.events (source, source_id)
  where source_id <> '';

create table if not exists public.channel_cursor (
  source text primary key,
  last_id text not null default '',
  read_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.channel_cursor enable row level security;
revoke all on public.channel_cursor from anon, authenticated;
grant all on public.channel_cursor to service_role;

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net;

do $$
declare
  existing_job record;
begin
  for existing_job in select jobid from cron.job where jobname = 'read-chat-channel' loop
    perform cron.unschedule(existing_job.jobid);
  end loop;
end
$$;

select cron.schedule(
  'read-chat-channel',
  '* * * * *',
  $job$
    select net.http_post(
      url := 'https://wgohwjnbkhzimedvtmtu.supabase.co/functions/v1/read-channel',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', 'sb_publishable_vvHCH2Zb8s4jnoTzJuX04g_tLZuSU0y'
      ),
      body := '{}'::jsonb
    );
  $job$
);

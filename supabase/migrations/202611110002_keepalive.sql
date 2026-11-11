-- Read-only ping target for the external cron-job.org schedule.
-- It does not access or expose user data.
create or replace function public.keepalive()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select true;
$$;

revoke all on function public.keepalive() from public, anon, authenticated;
grant execute on function public.keepalive() to anon;

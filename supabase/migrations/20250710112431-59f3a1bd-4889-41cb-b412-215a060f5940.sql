-- Create cron job to reset recurring tasks daily at 14:00 UTC
select
  cron.schedule(
    'reset-recurring-tasks-daily',
    '0 14 * * *', -- At 14:00 UTC every day
    $$
    select
      net.http_post(
          url:= current_setting('app.settings.supabase_url') || '/functions/v1/reset-recurring-tasks',
          headers:= format('{"Content-Type": "application/json", "Authorization": "Bearer %s"}', current_setting('app.settings.service_role_key'))::jsonb,
          body:='{"source": "cron"}'::jsonb
      ) as request_id;
    $$
  );
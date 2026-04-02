
-- Schedule the daily digest to run every morning at 8 AM
-- This should be run manually in the SQL editor after deploying the function

SELECT cron.schedule(
  'daily-digest-morning',
  '0 8 * * *', -- Every day at 8:00 AM UTC
  $$
  SELECT
    net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-daily-digest',
        headers := format('{"Content-Type": "application/json", "Authorization": "Bearer %s"}', current_setting('app.settings.service_role_key'))::jsonb,
        body := '{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);

-- To check if the cron job was created successfully:
-- SELECT * FROM cron.job;

-- To unschedule the job if needed:
-- SELECT cron.unschedule('daily-digest-morning');

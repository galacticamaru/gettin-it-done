
-- Schedule the daily digest to run every morning at 8 AM
-- This should be run manually in the SQL editor after deploying the function

SELECT cron.schedule(
  'daily-digest-morning',
  '0 8 * * *', -- Every day at 8:00 AM UTC
  $$
  SELECT
    net.http_post(
        url := 'https://gdopicetwkrzihvwikwu.supabase.co/functions/v1/send-daily-digest',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkb3BpY2V0d2tyemlodndpa3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDA1NjcsImV4cCI6MjA2Mzg3NjU2N30.9L5UKJV8XGXi24_zURPz1blEj5qzwg3-Di3Z7L0me-0"}'::jsonb,
        body := '{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);

-- To check if the cron job was created successfully:
-- SELECT * FROM cron.job;

-- To unschedule the job if needed:
-- SELECT cron.unschedule('daily-digest-morning');

-- Create cron job to reset recurring tasks daily at 14:00 UTC
select
  cron.schedule(
    'reset-recurring-tasks-daily',
    '0 14 * * *', -- At 14:00 UTC every day
    $$
    select
      net.http_post(
          url:='https://gdopicetwkrzihvwikwu.supabase.co/functions/v1/reset-recurring-tasks',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkb3BpY2V0d2tyemlodndpa3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDA1NjcsImV4cCI6MjA2Mzg3NjU2N30.9L5UKJV8XGXi24_zURPz1blEj5qzwg3-Di3Z7L0me-0"}'::jsonb,
          body:='{"source": "cron"}'::jsonb
      ) as request_id;
    $$
  );
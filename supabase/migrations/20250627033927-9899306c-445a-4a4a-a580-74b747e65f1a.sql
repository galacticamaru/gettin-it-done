
-- Enable required extensions for cron jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add OneSignal subscription ID tracking to user preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS onesignal_subscription_id text;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_onesignal_id 
ON public.user_preferences(onesignal_subscription_id) 
WHERE onesignal_subscription_id IS NOT NULL;

-- Schedule the daily digest to run every morning at 8 AM UTC
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

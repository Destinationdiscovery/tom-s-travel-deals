-- Allow admin to delete subscribers
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.subscribers;
CREATE POLICY "Admins can delete subscribers"
ON public.subscribers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Schedule biweekly auto-publish: runs daily at 14:00 UTC and the edge function decides whether to send
SELECT cron.unschedule('compass-auto-publish') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'compass-auto-publish'
);

SELECT cron.schedule(
  'compass-auto-publish',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url := 'https://iomrjljlydboniioohkv.supabase.co/functions/v1/auto-publish-compass',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
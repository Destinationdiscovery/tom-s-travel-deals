DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='daily-payment-reminders') THEN PERFORM cron.unschedule('daily-payment-reminders'); END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='compass-auto-publish') THEN PERFORM cron.unschedule('compass-auto-publish'); END IF;
END $$;
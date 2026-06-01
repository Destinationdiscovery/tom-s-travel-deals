ALTER TABLE public.compass_editions
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS mailerlite_campaign_id text;
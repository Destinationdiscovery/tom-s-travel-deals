
-- Status enum for editions
DO $$ BEGIN
  CREATE TYPE public.compass_edition_status AS ENUM ('generating', 'draft', 'ready', 'sent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.subscriber_status AS ENUM ('active', 'unsubscribed', 'bounced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- compass_editions
CREATE TABLE IF NOT EXISTS public.compass_editions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_number serial UNIQUE,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  status public.compass_edition_status NOT NULL DEFAULT 'generating',
  subject_line text,
  subject_line_options text[] DEFAULT '{}',
  destination text,
  destination_data jsonb DEFAULT '{}'::jsonb,
  itinerary_data jsonb DEFAULT '{}'::jsonb,
  safety_data jsonb DEFAULT '{}'::jsonb,
  currency_data jsonb DEFAULT '{}'::jsonb,
  best_time_data jsonb DEFAULT '{}'::jsonb,
  flight_deals_data jsonb DEFAULT '{}'::jsonb,
  hotel_data jsonb DEFAULT '{}'::jsonb,
  travel_intel_data jsonb DEFAULT '{}'::jsonb,
  full_html text,
  full_text text,
  generation_metadata jsonb DEFAULT '{}'::jsonb,
  perplexity_citations jsonb DEFAULT '[]'::jsonb,
  subscriber_count integer DEFAULT 0,
  run_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.compass_editions TO authenticated;
GRANT ALL ON public.compass_editions TO service_role;
GRANT USAGE, SELECT ON SEQUENCE compass_editions_edition_number_seq TO authenticated, service_role;

ALTER TABLE public.compass_editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage compass editions"
  ON public.compass_editions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER compass_editions_updated_at
  BEFORE UPDATE ON public.compass_editions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- compass_destinations_log
CREATE TABLE IF NOT EXISTS public.compass_destinations_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  used_in_edition integer,
  used_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.compass_destinations_log TO authenticated;
GRANT ALL ON public.compass_destinations_log TO service_role;

ALTER TABLE public.compass_destinations_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage destinations log"
  ON public.compass_destinations_log FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS compass_destinations_log_used_at_idx
  ON public.compass_destinations_log(used_at DESC);

-- Extend subscribers
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS status public.subscriber_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Admin access to subscribers (writes still go through service role from subscribe edge fn)
DROP POLICY IF EXISTS "Admin can read subscribers" ON public.subscribers;
CREATE POLICY "Admin can read subscribers"
  ON public.subscribers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin can update subscribers" ON public.subscribers;
CREATE POLICY "Admin can update subscribers"
  ON public.subscribers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin can insert subscribers" ON public.subscribers;
CREATE POLICY "Admin can insert subscribers"
  ON public.subscribers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin can delete subscribers" ON public.subscribers;
CREATE POLICY "Admin can delete subscribers"
  ON public.subscribers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO authenticated;

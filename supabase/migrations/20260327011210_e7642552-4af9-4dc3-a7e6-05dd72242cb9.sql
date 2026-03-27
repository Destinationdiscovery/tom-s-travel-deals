
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  first_page text NOT NULL,
  page_count integer DEFAULT 1,
  started_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  duration_seconds integer DEFAULT 0,
  is_bounce boolean DEFAULT true
);

CREATE INDEX idx_sessions_started_at ON public.sessions(started_at);
CREATE INDEX idx_sessions_session_id ON public.sessions(session_id);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read sessions"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

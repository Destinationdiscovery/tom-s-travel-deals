
-- Create agent_quick_links table
CREATE TABLE public.agent_quick_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  icon_name text DEFAULT 'ExternalLink',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_quick_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage quick links" ON public.agent_quick_links
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create agent_notes table
CREATE TABLE public.agent_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  color text DEFAULT 'default',
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage notes" ON public.agent_notes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Pre-seed quick links with current hardcoded ones
INSERT INTO public.agent_quick_links (label, url, icon_name, sort_order) VALUES
  ('Open Outlook Web', 'https://outlook.office.com/mail', 'Mail', 1),
  ('Sirev Booking', 'https://tob.sax.softvoyage.com/', 'ExternalLink', 2),
  ('Expedia TAAP', 'https://www.expediataap.ca/', 'ExternalLink', 3);

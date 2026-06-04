GRANT SELECT ON public.compass_editions TO anon, authenticated;

CREATE POLICY "Anyone can read sent compass editions"
  ON public.compass_editions
  FOR SELECT
  TO anon, authenticated
  USING (status = 'sent');
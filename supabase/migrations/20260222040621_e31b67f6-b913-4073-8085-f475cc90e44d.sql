CREATE TABLE IF NOT EXISTS quote_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  line_items jsonb DEFAULT '[]',
  inclusions text[] DEFAULT '{}',
  currency text DEFAULT 'CAD',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage templates" ON quote_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
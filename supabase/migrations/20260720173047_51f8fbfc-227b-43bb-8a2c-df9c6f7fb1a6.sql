
-- 1) comments: restrict INSERT policy to authenticated role
DROP POLICY IF EXISTS "Users can insert own comments" ON public.comments;
CREATE POLICY "Users can insert own comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2) compass_editions: drop public SELECT; expose safe fields via SECURITY DEFINER RPC
DROP POLICY IF EXISTS "Public can view sent editions" ON public.compass_editions;
DROP POLICY IF EXISTS "Anyone can view sent editions" ON public.compass_editions;
DROP POLICY IF EXISTS "Public read sent editions" ON public.compass_editions;
DROP POLICY IF EXISTS "Public can read sent editions" ON public.compass_editions;

CREATE OR REPLACE FUNCTION public.get_latest_sent_compass_edition()
RETURNS TABLE (
  id uuid,
  edition_number integer,
  subject_line text,
  destination text,
  issue_date date,
  full_html text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, edition_number, subject_line, destination, issue_date, full_html
  FROM public.compass_editions
  WHERE status = 'sent'
  ORDER BY issue_date DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_latest_sent_compass_edition() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_latest_sent_compass_edition() TO anon, authenticated;

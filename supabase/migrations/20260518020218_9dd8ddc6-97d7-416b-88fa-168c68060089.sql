DROP POLICY IF EXISTS "Public can view quotes by share_token" ON public.client_quotes;

CREATE OR REPLACE FUNCTION public.get_quote_by_share_token(_token text)
RETURNS SETOF public.client_quotes
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.client_quotes
  WHERE share_token = _token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_quote_by_share_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quote_by_share_token(text) TO anon, authenticated;
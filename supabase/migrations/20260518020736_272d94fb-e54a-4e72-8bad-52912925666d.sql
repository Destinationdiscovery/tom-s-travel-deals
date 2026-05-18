DROP FUNCTION IF EXISTS public.get_quote_by_share_token(text);

CREATE OR REPLACE FUNCTION public.get_quote_by_share_token(_token text)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  client_name text,
  resort_name text,
  resort_review_slug text,
  destination text,
  check_in date,
  check_out date,
  num_travellers integer,
  flight_details jsonb,
  line_items jsonb,
  total_price numeric,
  currency text,
  notes text,
  status quote_status,
  include_review boolean,
  review_data jsonb,
  attachment_urls text[],
  room_type text,
  inclusions text[],
  summary text,
  valid_until date,
  quote_markdown text,
  share_token text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, created_at, updated_at, client_name, resort_name, resort_review_slug,
    destination, check_in, check_out, num_travellers, flight_details, line_items,
    total_price, currency, notes, status, include_review, review_data,
    attachment_urls, room_type, inclusions, summary, valid_until, quote_markdown,
    share_token
  FROM public.client_quotes
  WHERE share_token = _token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_quote_by_share_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quote_by_share_token(text) TO anon, authenticated;
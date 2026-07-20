
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

CREATE OR REPLACE FUNCTION public.increment_trip_share(_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.trips SET share_count = share_count + 1
  WHERE public_slug = _slug AND is_published AND NOT hidden_by_admin;
$$;

DROP FUNCTION IF EXISTS public.list_public_trips(integer, integer, text);

CREATE OR REPLACE FUNCTION public.list_public_trips(_limit integer DEFAULT 24, _offset integer DEFAULT 0, _destination text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, public_slug text, trip_name text, destination text, start_date date, end_date date, trip_type text, cover_image_url text, author_display_name text, published_at timestamp with time zone, view_count integer, share_count integer, hotel_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT t.id, t.public_slug, t.trip_name, t.destination, t.start_date, t.end_date,
         t.trip_type, t.cover_image_url, t.author_display_name, t.published_at, t.view_count, t.share_count,
         (SELECT count(*) FROM public.trip_hotels h WHERE h.trip_id = t.id) AS hotel_count
  FROM public.trips t
  WHERE t.is_published
    AND t.list_in_gallery
    AND NOT t.hidden_by_admin
    AND (_destination IS NULL OR t.destination ILIKE '%' || _destination || '%')
  ORDER BY t.published_at DESC NULLS LAST
  LIMIT _limit OFFSET _offset;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_trip(_slug text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object(
    'trip', jsonb_build_object(
      'id', t.id,
      'slug', t.slug,
      'public_slug', t.public_slug,
      'trip_name', t.trip_name,
      'destination', t.destination,
      'start_date', t.start_date,
      'end_date', t.end_date,
      'trip_type', t.trip_type,
      'status', t.status,
      'author_display_name', t.author_display_name,
      'cover_image_url', t.cover_image_url,
      'published_at', t.published_at,
      'view_count', t.view_count,
      'share_count', t.share_count
    ),
    'hotels', COALESCE((
      SELECT jsonb_agg(
        to_jsonb(h.*) || jsonb_build_object(
          'personal_review', (SELECT to_jsonb(r.*) FROM public.trip_hotel_reviews r WHERE r.trip_hotel_id = h.id)
        )
        ORDER BY h.sort_order, h.created_at
      )
      FROM public.trip_hotels h WHERE h.trip_id = t.id
    ), '[]'::jsonb),
    'itinerary', COALESCE((
      SELECT jsonb_agg(to_jsonb(d.*) ORDER BY d.day_number)
      FROM public.trip_itinerary_days d WHERE d.trip_id = t.id
    ), '[]'::jsonb),
    'legs', COALESCE((
      SELECT jsonb_agg(to_jsonb(l.*) ORDER BY l.leg_number)
      FROM public.trip_legs l WHERE l.trip_id = t.id
    ), '[]'::jsonb),
    'transit', COALESCE((
      SELECT jsonb_agg(to_jsonb(tr.*))
      FROM public.trip_transit tr WHERE tr.trip_id = t.id
    ), '[]'::jsonb),
    'packing', COALESCE((
      SELECT jsonb_agg(to_jsonb(p.*) ORDER BY p.sort_order, p.created_at)
      FROM public.trip_packing_items p WHERE p.trip_id = t.id
    ), '[]'::jsonb),
    'gear', COALESCE((
      SELECT jsonb_agg(to_jsonb(g.*) ORDER BY g.created_at)
      FROM public.trip_gear_items g WHERE g.trip_id = t.id
    ), '[]'::jsonb),
    'logistics', (SELECT to_jsonb(l.*) FROM public.trip_logistics l WHERE l.trip_id = t.id)
  )
  FROM public.trips t
  WHERE t.public_slug = _slug
    AND t.is_published
    AND NOT t.hidden_by_admin
  LIMIT 1;
$function$;

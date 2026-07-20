import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_maps';

interface Body {
  from: string;
  to: string;
  mode?: 'DRIVE' | 'WALK' | 'BICYCLE' | 'TRANSIT';
  trip_id?: string;
  from_leg_id?: string;
  to_leg_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (!claims?.claims) return json({ error: 'Unauthorized' }, 401);

    const body = (await req.json()) as Body;
    if (!body?.from || !body?.to) return json({ error: 'from and to required' }, 400);
    const mode = body.mode ?? 'DRIVE';

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      return json({ error: 'Google Maps connector not configured' }, 500);
    }

    const res = await fetch(`${GATEWAY_URL}/routes/directions/v2:computeRoutes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_MAPS_API_KEY,
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.legs.startLocation,routes.legs.endLocation',
      },
      body: JSON.stringify({
        origin: { address: body.from },
        destination: { address: body.to },
        travelMode: mode,
        routingPreference: mode === 'DRIVE' ? 'TRAFFIC_AWARE' : undefined,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error('Routes API error', res.status, t);
      return json({ error: 'Route lookup failed', details: t }, res.status);
    }
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) return json({ error: 'No route found' }, 404);

    const distance_meters = route.distanceMeters ?? null;
    const duration_seconds = route.duration ? parseInt(String(route.duration).replace('s', ''), 10) : null;

    // Persist if trip context provided
    if (body.trip_id && body.from_leg_id && body.to_leg_id) {
      const service = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      await service.from('trip_transit').upsert(
        {
          trip_id: body.trip_id,
          from_leg_id: body.from_leg_id,
          to_leg_id: body.to_leg_id,
          mode,
          distance_meters,
          duration_seconds,
          from_address: body.from,
          to_address: body.to,
          options: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'from_leg_id,to_leg_id,mode' },
      );
    }

    return json({ distance_meters, duration_seconds, mode });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

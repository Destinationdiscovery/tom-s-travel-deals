import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

/** Server gate. Every function below calls this first, same as the rest of the dashboard. */
async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || data !== true) throw new Error("Forbidden");
}

/** The Google Maps connection is linked in Lovable. The key name depends on how many connections exist. */
function mapsKeys(): { lovableKey: string; connectionKey: string } | null {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey =
    process.env["GOOGLE_MAPS_API_KEY"] ??
    process.env["GOOGLE_MAPS_API_KEY_1"] ??
    process.env["GOOGLE_MAPS_API_KEY_2"];
  if (!lovableKey || !connectionKey) return null;
  return { lovableKey, connectionKey };
}

const NOT_CONNECTED = "Google Maps is not connected to this project yet. Link the Google Maps Platform connection in Lovable.";

export type ProspectResult = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviews: number | null;
  mapsUrl: string | null;
  types: string[];
};

export const getProspectorStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    return { mapsConnected: mapsKeys() !== null };
  });

const GeoInput = z.object({ location: z.string().trim().min(2).max(120) });

export const geocodeLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GeoInput.parse(input))
  .handler(async ({ data, context }): Promise<{ lat: number; lng: number }> => {
    await assertAdmin(context as Ctx);
    const keys = mapsKeys();
    if (!keys) throw new Error(NOT_CONNECTED);

    const res = await fetch(`${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(data.location)}`, {
      headers: { Authorization: `Bearer ${keys.lovableKey}`, "X-Connection-Api-Key": keys.connectionKey },
    });
    if (!res.ok) throw new Error(`Could not look up that location [${res.status}]`);
    const body = (await res.json()) as {
      status: string;
      results: Array<{ geometry: { location: { lat: number; lng: number } } }>;
    };
    const first = body.results?.[0];
    if (body.status !== "OK" || !first) throw new Error(`Could not find the location: ${data.location}`);
    return first.geometry.location;
  });

const SearchInput = z.object({
  query: z.string().trim().min(2).max(120),
  radiusKm: z.number().min(1).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  pageToken: z.string().trim().max(4000).optional(),
});

/** Place types that point at a shop, venue or business that is not a league or club. */
const SHOP_TYPES = new Set([
  "lodging",
  "hotel",
  "restaurant",
  "bar",
  "cafe",
  "food",
  "store",
  "sporting_goods_store",
  "clothing_store",
  "shopping_mall",
  "department_store",
  "supermarket",
  "grocery_or_supermarket",
  "convenience_store",
  "gas_station",
  "bank",
  "atm",
  "transit_station",
  "bus_station",
  "subway_station",
  "tourist_attraction",
  "park",
]);

/** A place that carries any of these is kept even if it also looks like a shop (a rink with a pro shop). */
const CLUB_TYPES = new Set([
  "sports_club",
  "sports_complex",
  "sports_activity_location",
  "stadium",
  "arena",
  "ice_skating_rink",
  "athletic_field",
  "association_or_organization",
  "non_profit_organization",
  "community_center",
  "school",
  "university",
  "gym",
]);

export const searchProspects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SearchInput.parse(input))
  .handler(async ({ data, context }): Promise<{ results: ProspectResult[]; nextPageToken: string | null }> => {
    await assertAdmin(context as Ctx);
    const keys = mapsKeys();
    if (!keys) throw new Error(NOT_CONNECTED);

    const body: Record<string, unknown> = {
      textQuery: data.query,
      locationBias: {
        circle: {
          center: { latitude: data.lat, longitude: data.lng },
          // Google Places caps the bias circle at 50,000 metres.
          radius: Math.min(data.radiusKm * 1000, 50000),
        },
      },
      pageSize: 20,
    };
    if (data.pageToken) body["pageToken"] = data.pageToken;

    const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keys.lovableKey}`,
        "X-Connection-Api-Key": keys.connectionKey,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "nextPageToken,places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri,places.types",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Places search failed [${res.status}]: ${txt.slice(0, 200)}`);
    }
    const payload = (await res.json()) as {
      nextPageToken?: string;
      places?: Array<{
        id: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        nationalPhoneNumber?: string;
        internationalPhoneNumber?: string;
        websiteUri?: string;
        rating?: number;
        userRatingCount?: number;
        googleMapsUri?: string;
        types?: string[];
      }>;
    };

    const results: ProspectResult[] = (payload.places ?? [])
      .filter((p) => {
        const types = p.types ?? [];
        if (types.some((t) => CLUB_TYPES.has(t))) return true;
        return !types.some((t) => SHOP_TYPES.has(t));
      })
      .map((p) => ({
        id: p.id,
        name: p.displayName?.text ?? "Unknown",
        address: p.formattedAddress ?? "",
        phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? null,
        website: p.websiteUri ?? null,
        rating: p.rating ?? null,
        reviews: p.userRatingCount ?? null,
        mapsUrl: p.googleMapsUri ?? null,
        types: p.types ?? [],
      }));

    return { results, nextPageToken: payload.nextPageToken ?? null };
  });

/* -------------------- Email finder: reads each lead's own website -------------------- */

const EnrichInput = z.object({
  items: z
    .array(z.object({ google_place_id: z.string().min(1), website: z.string().nullable() }))
    .min(1)
    .max(12),
});

export type EnrichedEmail = {
  google_place_id: string;
  email: string | null;
  source: string | null;
  sourceUrl: string | null;
  status: "found" | "not_found" | "error";
};

/**
 * Looks for an email address written on the lead's website or Facebook page, and saves it on the lead.
 * It only returns an address that appears on a real page. It never guesses one.
 */
export const enrichProspectEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => EnrichInput.parse(input))
  .handler(async ({ data, context }): Promise<EnrichedEmail[]> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { enrichWebsite } = await import("./lead-enrich.server");

    const out: EnrichedEmail[] = new Array(data.items.length);
    let next = 0;
    async function worker() {
      while (true) {
        const idx = next++;
        if (idx >= data.items.length) return;
        const item = data.items[idx];
        if (!item) return;
        const r = await enrichWebsite(item.website);
        out[idx] = {
          google_place_id: item.google_place_id,
          email: r.email,
          source: r.source,
          sourceUrl: r.sourceUrl,
          status: r.status,
        };
      }
    }
    await Promise.all(Array.from({ length: Math.min(4, data.items.length) }, worker));

    const now = new Date().toISOString();
    for (const r of out) {
      if (!r || !r.email) continue;
      await ctx.supabase
        .from("prospects")
        .update({ email: r.email, email_source: r.source, email_source_url: r.sourceUrl, updated_at: now })
        .eq("google_place_id", r.google_place_id);
    }
    return out.filter(Boolean);
  });

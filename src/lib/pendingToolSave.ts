import { supabase } from "@/integrations/supabase/client";

const KEY = "rtg:pending-tool-save";

export type ToolType =
  | "gear"
  | "itinerary"
  | "best-time"
  | "safety"
  | "travel-intel"
  | "currency"
  | "flights"
  | "destinations";

export interface PendingSave {
  toolType: ToolType;
  payload: any;
  destination?: string;
  label?: string;
  savedAt: number;
}

export function stashPendingSave(data: Omit<PendingSave, "savedAt">) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {}
}

export function readPendingSave(): PendingSave | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingSave) : null;
  } catch {
    return null;
  }
}

export function clearPendingSave() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

/** Writes the payload into the matching trip child table for a trip id (optionally scoped to a leg). */
export async function applyPayloadToTrip(tripId: string, toolType: ToolType, payload: any, legId?: string | null) {
  const sb = supabase as any;
  const leg = legId ?? null;
  switch (toolType) {
    case "gear": {
      const items = (payload?.items ?? []) as any[];
      if (!items.length) return;
      await sb.from("trip_gear_items").insert(items.map((p) => ({ trip_id: tripId, leg_id: leg, product: p })));
      return;
    }
    case "itinerary": {
      const days = (payload?.days ?? []) as any[];
      if (!days.length) return;
      const conflict = leg ? "leg_id,day_number" : "trip_id,day_number";
      await sb.from("trip_itinerary_days").upsert(
        days.map((d, i) => ({ trip_id: tripId, leg_id: leg, day_number: d?.day ?? i + 1, content: d })),
        { onConflict: conflict }
      );
      return;
    }
    case "best-time":
      await upsertLogistics(sb, tripId, leg, { best_time: payload, best_time_confirmed: true });
      return;
    case "safety":
      await upsertLogistics(sb, tripId, leg, { safety: payload, safety_checked: true });
      return;
    case "travel-intel":
      await upsertLogistics(sb, tripId, leg, { visa: payload, visa_checked: true });
      return;
    case "currency":
      await upsertLogistics(sb, tripId, leg, { currency: payload, currency_checked: true });
      return;
    case "flights":
      await upsertLogistics(sb, tripId, leg, { flights: payload });
      return;
    case "destinations": {
      const hotel = payload?.hotel ?? payload;
      if (!hotel) return;
      await sb.from("trip_hotels").insert({
        trip_id: tripId,
        leg_id: leg,
        slug: hotel.slug ?? null,
        property_name: hotel.propertyName ?? hotel.property_name ?? "Saved property",
        location: hotel.location ?? null,
        overall_rating: hotel.overallRating ?? hotel.overall_rating ?? null,
        ratings: hotel.ratings ?? {},
        best_for: hotel.bestFor ?? hotel.best_for ?? [],
        pros: hotel.pros ?? [],
        cons: hotel.cons ?? [],
        summary: hotel.summary ?? null,
      });
      return;
    }
  }
}

async function upsertLogistics(sb: any, tripId: string, legId: string | null, patch: Record<string, any>) {
  const base = sb.from("trip_logistics").select("id").eq("trip_id", tripId);
  const { data: existing } = legId
    ? await base.eq("leg_id", legId).maybeSingle()
    : await base.is("leg_id", null).maybeSingle();
  if (existing?.id) {
    await sb.from("trip_logistics").update(patch).eq("id", existing.id);
  } else {
    await sb.from("trip_logistics").insert({ trip_id: tripId, leg_id: legId, ...patch });
  }
}

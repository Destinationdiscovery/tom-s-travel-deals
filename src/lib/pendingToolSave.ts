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

/** Writes the payload into the matching trip child table for a trip id. */
export async function applyPayloadToTrip(tripId: string, toolType: ToolType, payload: any) {
  const sb = supabase as any;
  switch (toolType) {
    case "gear": {
      const items = (payload?.items ?? []) as any[];
      if (!items.length) return;
      await sb.from("trip_gear_items").insert(items.map((p) => ({ trip_id: tripId, product: p })));
      return;
    }
    case "itinerary": {
      const days = (payload?.days ?? []) as any[];
      if (!days.length) return;
      await sb.from("trip_itinerary_days").upsert(
        days.map((d, i) => ({ trip_id: tripId, day_number: d?.day ?? i + 1, content: d })),
        { onConflict: "trip_id,day_number" }
      );
      return;
    }
    case "best-time":
      await sb
        .from("trip_logistics")
        .upsert({ trip_id: tripId, best_time: payload, best_time_confirmed: true }, { onConflict: "trip_id" });
      return;
    case "safety":
      await sb
        .from("trip_logistics")
        .upsert({ trip_id: tripId, safety: payload, safety_checked: true }, { onConflict: "trip_id" });
      return;
    case "travel-intel":
      await sb
        .from("trip_logistics")
        .upsert({ trip_id: tripId, visa: payload, visa_checked: true }, { onConflict: "trip_id" });
      return;
    case "currency":
      await sb
        .from("trip_logistics")
        .upsert({ trip_id: tripId, currency: payload, currency_checked: true }, { onConflict: "trip_id" });
      return;
    case "flights":
      await sb
        .from("trip_logistics")
        .upsert({ trip_id: tripId, flights: payload }, { onConflict: "trip_id" });
      return;
    case "destinations": {
      const hotel = payload?.hotel ?? payload;
      if (!hotel) return;
      await sb.from("trip_hotels").insert({
        trip_id: tripId,
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

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || data !== true) throw new Error("Forbidden");
}

export type Prospect = {
  id: string;
  google_place_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  email_source: string | null;
  email_source_url: string | null;
  website: string | null;
  maps_url: string | null;
  rating: number | null;
  reviews: number | null;
  query: string | null;
  city: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  last_seen_at: string;
  follow_up_at: string | null;
  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  assigned_to: string | null;
  last_contacted_at: string | null;
  do_not_contact: boolean;
  do_not_contact_at: string | null;
  do_not_contact_reason: string | null;
};

export type ProspectSearchRow = {
  id: string;
  created_at: string;
  query: string;
  city: string;
  radius_km: number;
  total_results: number;
  with_email_count: number;
  grid_points: number;
};

const RowInput = z.object({
  google_place_id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
  reviews: z.number().nullable().optional(),
  maps_url: z.string().nullable().optional(),
});

const ID_CHUNK = 150;

/**
 * Saves what a search found. A business already saved keeps its status, notes, email and the
 * search phrase it was first found under. Only its Google details and "last seen" date refresh.
 */
export const saveProspects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        query: z.string().trim().min(1).max(120),
        city: z.string().trim().min(1).max(120),
        rows: z.array(RowInput).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ seenBefore: Record<string, string>; newCount: number }> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const sb = ctx.supabase;
    if (!data.rows.length) return { seenBefore: {}, newCount: 0 };

    const ids = data.rows.map((r) => r.google_place_id);
    const existing = new Map<string, string>();
    for (let i = 0; i < ids.length; i += ID_CHUNK) {
      const { data: rows, error } = await sb
        .from("prospects")
        .select("google_place_id, created_at")
        .in("google_place_id", ids.slice(i, i + ID_CHUNK));
      if (error) throw new Error("Could not check saved leads.");
      for (const r of (rows ?? []) as Array<{ google_place_id: string; created_at: string }>) {
        existing.set(r.google_place_id, r.created_at);
      }
    }

    const now = new Date().toISOString();
    const base = (r: z.infer<typeof RowInput>) => ({
      google_place_id: r.google_place_id,
      name: r.name,
      address: r.address ?? null,
      phone: r.phone ?? null,
      website: r.website ?? null,
      rating: r.rating ?? null,
      reviews: r.reviews ?? null,
      maps_url: r.maps_url ?? null,
      last_seen_at: now,
      updated_at: now,
    });

    const fresh = data.rows
      .filter((r) => !existing.has(r.google_place_id))
      .map((r) => ({ ...base(r), query: data.query, city: data.city }));
    const known = data.rows.filter((r) => existing.has(r.google_place_id)).map(base);

    for (let i = 0; i < fresh.length; i += 200) {
      const { error } = await sb.from("prospects").insert(fresh.slice(i, i + 200));
      if (error) {
        console.error("[saveProspects insert]", error);
        throw new Error("Could not save the new leads.");
      }
    }
    for (let i = 0; i < known.length; i += 200) {
      const { error } = await sb.from("prospects").upsert(known.slice(i, i + 200), { onConflict: "google_place_id" });
      if (error) {
        console.error("[saveProspects upsert]", error);
        throw new Error("Could not refresh the saved leads.");
      }
    }

    return { seenBefore: Object.fromEntries(existing), newCount: fresh.length };
  });

/** Saved leads for one search phrase and city. */
export const listProspects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ query: z.string().trim().min(1), city: z.string().trim().min(1) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<Prospect[]> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { data: rows, error } = await ctx.supabase
      .from("prospects")
      .select("*")
      .eq("query", data.query)
      .eq("city", data.city)
      .order("name", { ascending: true })
      .limit(2000);
    if (error) throw new Error("Could not load saved leads.");
    return (rows ?? []) as Prospect[];
  });

/** The saved record for each Google place id, so a fresh search shows existing status, notes and emails. */
export const listProspectsByPlaceIds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ ids: z.array(z.string().min(1)).max(2000) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<Prospect[]> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const out: Prospect[] = [];
    for (let i = 0; i < data.ids.length; i += ID_CHUNK) {
      const { data: rows, error } = await ctx.supabase
        .from("prospects")
        .select("*")
        .in("google_place_id", data.ids.slice(i, i + ID_CHUNK));
      if (error) throw new Error("Could not load saved leads.");
      out.push(...((rows ?? []) as Prospect[]));
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  });

/** Every lead ever saved, newest activity first. */
export const listAllProspects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Prospect[]> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { data: rows, error } = await ctx.supabase
      .from("prospects")
      .select("*")
      .order("last_seen_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error("Could not load saved leads.");
    return (rows ?? []) as Prospect[];
  });

export const updateProspect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "contacted", "replied", "won", "not_interested"]).optional(),
        notes: z.string().max(4000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.status !== undefined) patch["status"] = data.status;
    if (data.notes !== undefined) patch["notes"] = data.notes && data.notes.trim() ? data.notes.trim() : null;
    const { error } = await ctx.supabase.from("prospects").update(patch).eq("id", data.id);
    if (error) {
      console.error("[updateProspect]", error);
      throw new Error("Could not save the change.");
    }
    if (data.status !== undefined) {
      const labels: Record<string, string> = {
        new: "New",
        contacted: "Contacted",
        replied: "Replied",
        won: "Won",
        not_interested: "Not interested",
      };
      let name = "Team member";
      try {
        const { data: profile } = await ctx.supabase.from("profiles").select("full_name").eq("id", ctx.userId).maybeSingle();
        const full = (profile as { full_name?: string | null } | null)?.full_name;
        if (full && full.trim()) name = full.trim();
      } catch {
        /* keep the default name */
      }
      await ctx.supabase.from("prospect_activity").insert({
        prospect_id: data.id,
        type: "status",
        content: `Status changed to ${labels[data.status] ?? data.status}.`,
        created_by_name: name,
      });
    }
    return { ok: true };
  });

/* -------------------- search history -------------------- */

export const getLatestProspectSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ query: z.string().trim().min(1), city: z.string().trim().min(1) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<ProspectSearchRow | null> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { data: rows, error } = await ctx.supabase
      .from("prospect_searches")
      .select("*")
      .eq("query", data.query)
      .eq("city", data.city)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw new Error("Could not check search history.");
    return ((rows ?? [])[0] ?? null) as ProspectSearchRow | null;
  });

export const listProspectSearches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProspectSearchRow[]> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { data, error } = await ctx.supabase
      .from("prospect_searches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Could not load search history.");
    return (data ?? []) as ProspectSearchRow[];
  });

export const recordProspectSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        query: z.string().trim().min(1).max(120),
        city: z.string().trim().min(1).max(120),
        radius_km: z.number().int().min(1).max(100),
        total_results: z.number().int().min(0),
        grid_points: z.number().int().min(1).max(25),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { error } = await ctx.supabase.from("prospect_searches").insert({ ...data, with_email_count: 0 });
    if (error) {
      console.error("[recordProspectSearch]", error);
      throw new Error("Could not record the search.");
    }
    return { ok: true };
  });

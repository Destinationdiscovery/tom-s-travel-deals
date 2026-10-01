import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Prospect } from "./prospector-store.functions";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || data !== true) throw new Error("Forbidden");
}

export type ProspectActivity = {
  id: string;
  prospect_id: string;
  type: string;
  content: string | null;
  created_by_name: string | null;
  created_at: string;
};

export type OutreachTemplate = {
  id: string;
  name: string;
  audience: "club" | "league" | "follow_up";
  subject: string;
  body: string;
  sort_order: number;
};

export type OutreachSettings = {
  sender_name: string;
  mailing_address: string;
  site_url: string;
  signature: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  won: "Won",
  not_interested: "Not interested",
};

/** Today's date in Brantford, so "due today" does not flip over at 8pm. */
function torontoToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());
}

async function actorName(ctx: Ctx): Promise<string> {
  try {
    const { data } = await ctx.supabase.from("profiles").select("full_name").eq("id", ctx.userId).maybeSingle();
    const name = (data as { full_name?: string | null } | null)?.full_name;
    return name && name.trim() ? name.trim() : "Team member";
  } catch {
    return "Team member";
  }
}

const DateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optText = (max: number) => z.string().trim().max(max).nullable().optional();
const StatusEnum = z.enum(["new", "contacted", "replied", "won", "not_interested"]);

/* -------------------- lead details -------------------- */

export const updateProspectDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        contact_name: optText(120),
        contact_role: optText(120),
        contact_email: z.union([z.string().trim().email().max(255), z.literal("")]).nullable().optional(),
        contact_phone: optText(60),
        follow_up_at: DateStr.nullable().optional(),
        assigned_to: optText(60),
        do_not_contact: z.boolean().optional(),
        do_not_contact_reason: optText(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<Prospect> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const sb = ctx.supabase;
    const now = new Date().toISOString();

    const { data: current } = await sb.from("prospects").select("email, contact_email").eq("id", data.id).maybeSingle();
    if (!current) throw new Error("Lead not found.");

    const patch: Record<string, unknown> = { updated_at: now };
    const setText = (key: string, value: string | null | undefined) => {
      if (value !== undefined) patch[key] = value && value.trim() ? value.trim() : null;
    };
    setText("contact_name", data.contact_name);
    setText("contact_role", data.contact_role);
    setText("contact_phone", data.contact_phone);
    setText("assigned_to", data.assigned_to);
    if (data.contact_email !== undefined) patch["contact_email"] = data.contact_email ? data.contact_email.trim().toLowerCase() : null;
    if (data.follow_up_at !== undefined) patch["follow_up_at"] = data.follow_up_at;

    // Addresses that unsubscribed stay blocked, however a lead is edited.
    const addresses = [
      (patch["contact_email"] as string | null | undefined) ?? (current as { contact_email: string | null }).contact_email,
      (current as { email: string | null }).email,
    ]
      .filter((v): v is string => !!v)
      .map((v) => v.toLowerCase());
    let suppressed = false;
    if (addresses.length) {
      const { data: hits } = await sb.from("email_suppressions").select("email").in("email", addresses);
      suppressed = ((hits ?? []) as unknown[]).length > 0;
    }

    let note: string | null = null;
    if (data.do_not_contact === false && suppressed) {
      throw new Error("This address unsubscribed, so it stays on the do not contact list.");
    }
    if (data.do_not_contact !== undefined) {
      patch["do_not_contact"] = data.do_not_contact;
      patch["do_not_contact_at"] = data.do_not_contact ? now : null;
      patch["do_not_contact_reason"] = data.do_not_contact ? (data.do_not_contact_reason?.trim() || "manual") : null;
      note = data.do_not_contact ? "Marked do not contact." : "Removed the do not contact mark.";
    } else if (suppressed) {
      patch["do_not_contact"] = true;
      patch["do_not_contact_at"] = now;
      patch["do_not_contact_reason"] = "unsubscribed";
    }

    const { data: updated, error } = await sb.from("prospects").update(patch).eq("id", data.id).select("*").single();
    if (error || !updated) {
      console.error("[updateProspectDetails]", error);
      throw new Error("Could not save the changes.");
    }
    if (note) {
      await sb.from("prospect_activity").insert({ prospect_id: data.id, type: "note", content: note, created_by_name: await actorName(ctx) });
    }
    return updated as Prospect;
  });

/** Sets status, follow-up date or assignee on many leads at once. */
export const bulkUpdateProspects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1).max(500),
        status: StatusEnum.optional(),
        follow_up_at: DateStr.nullable().optional(),
        assigned_to: optText(60),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ updated: number }> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { updated_at: now };
    if (data.status !== undefined) patch["status"] = data.status;
    if (data.follow_up_at !== undefined) patch["follow_up_at"] = data.follow_up_at;
    if (data.assigned_to !== undefined) patch["assigned_to"] = data.assigned_to && data.assigned_to.trim() ? data.assigned_to.trim() : null;
    if (Object.keys(patch).length === 1) throw new Error("Choose something to change first.");

    const { data: rows, error } = await ctx.supabase.from("prospects").update(patch).in("id", data.ids).select("id");
    if (error) {
      console.error("[bulkUpdateProspects]", error);
      throw new Error("Could not update those leads.");
    }
    const ids = ((rows ?? []) as Array<{ id: string }>).map((r) => r.id);
    if (data.status !== undefined && ids.length) {
      const name = await actorName(ctx);
      await ctx.supabase.from("prospect_activity").insert(
        ids.map((id) => ({
          prospect_id: id,
          type: "status",
          content: `Status changed to ${STATUS_LABEL[data.status as string] ?? data.status}.`,
          created_by_name: name,
        })),
      );
    }
    return { updated: ids.length };
  });

/* -------------------- activity log -------------------- */

export const listProspectActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ prospect_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<ProspectActivity[]> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { data: rows, error } = await ctx.supabase
      .from("prospect_activity")
      .select("*")
      .eq("prospect_id", data.prospect_id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Could not load the activity.");
    return (rows ?? []) as ProspectActivity[];
  });

/** Adds a call, email, meeting or note. Calls, emails and meetings also stamp the last contact date. */
export const addProspectActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        prospect_id: z.string().uuid(),
        type: z.enum(["call", "email", "meeting", "note"]),
        content: z.string().trim().min(1).max(2000),
        follow_up_at: DateStr.nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<Prospect> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const sb = ctx.supabase;
    const now = new Date().toISOString();

    const { data: current } = await sb.from("prospects").select("status").eq("id", data.prospect_id).maybeSingle();
    if (!current) throw new Error("Lead not found.");

    const { error: logError } = await sb.from("prospect_activity").insert({
      prospect_id: data.prospect_id,
      type: data.type,
      content: data.content,
      created_by_name: await actorName(ctx),
    });
    if (logError) {
      console.error("[addProspectActivity]", logError);
      throw new Error("Could not save that entry.");
    }

    const patch: Record<string, unknown> = { updated_at: now };
    if (data.type !== "note") {
      patch["last_contacted_at"] = now;
      if ((current as { status: string }).status === "new") patch["status"] = "contacted";
    }
    if (data.follow_up_at !== undefined) patch["follow_up_at"] = data.follow_up_at;

    const { data: updated, error } = await sb.from("prospects").update(patch).eq("id", data.prospect_id).select("*").single();
    if (error || !updated) throw new Error("Saved the entry, but could not refresh the lead.");
    return updated as Prospect;
  });

/** Leads whose follow-up date is today or earlier, not counting won, not interested or do not contact. */
export const getFollowUpCount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ due: number }> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { count, error } = await ctx.supabase
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .lte("follow_up_at", torontoToday())
      .eq("do_not_contact", false)
      .not("status", "in", "(won,not_interested)");
    if (error) return { due: 0 };
    return { due: count ?? 0 };
  });

/* -------------------- email templates -------------------- */

export const listOutreachTemplates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OutreachTemplate[]> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { data, error } = await ctx.supabase
      .from("outreach_templates")
      .select("id, name, audience, subject, body, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error("Could not load the templates.");
    return (data ?? []) as OutreachTemplate[];
  });

export const saveOutreachTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(120),
        audience: z.enum(["club", "league", "follow_up"]),
        subject: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(6000),
        sort_order: z.number().int().min(0).max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<OutreachTemplate> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const row = {
      name: data.name,
      audience: data.audience,
      subject: data.subject,
      body: data.body,
      ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
      updated_at: new Date().toISOString(),
    };
    const query = data.id
      ? ctx.supabase.from("outreach_templates").update(row).eq("id", data.id)
      : ctx.supabase.from("outreach_templates").insert(row);
    const { data: saved, error } = await query.select("id, name, audience, subject, body, sort_order").single();
    if (error || !saved) {
      console.error("[saveOutreachTemplate]", error);
      throw new Error("Could not save the template.");
    }
    return saved as OutreachTemplate;
  });

export const deleteOutreachTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { error } = await ctx.supabase.from("outreach_templates").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete the template.");
    return { ok: true };
  });

/* -------------------- email settings -------------------- */

const SETTING_KEYS = ["sender_name", "mailing_address", "site_url", "signature"] as const;

export const getOutreachSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OutreachSettings> => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const { data } = await ctx.supabase.from("outreach_settings").select("key, value");
    const map = new Map<string, string>(((data ?? []) as Array<{ key: string; value: string }>).map((r) => [r.key, r.value]));
    return {
      sender_name: map.get("sender_name") || "Aventura Sports Media",
      mailing_address: map.get("mailing_address") ?? "",
      site_url: map.get("site_url") ?? "",
      signature: map.get("signature") ?? "",
    };
  });

export const saveOutreachSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        sender_name: z.string().trim().min(1).max(120),
        mailing_address: z.string().trim().max(300),
        site_url: z
          .string()
          .trim()
          .max(200)
          .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "The website address must start with https://"),
        signature: z.string().trim().max(400),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;
    await assertAdmin(ctx);
    const now = new Date().toISOString();
    const rows = SETTING_KEYS.map((key) => ({
      key,
      value: key === "site_url" ? data.site_url.replace(/\/+$/, "") : data[key],
      updated_at: now,
    }));
    const { error } = await ctx.supabase.from("outreach_settings").upsert(rows, { onConflict: "key" });
    if (error) {
      console.error("[saveOutreachSettings]", error);
      throw new Error("Could not save the settings.");
    }
    return { ok: true };
  });

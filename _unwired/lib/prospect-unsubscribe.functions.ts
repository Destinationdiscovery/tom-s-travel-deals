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

/** Makes the one-click opt-out link that goes at the bottom of an outreach email. Admin only. */
export const buildProspectUnsubscribeLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        prospectId: z.string().uuid(),
        email: z.string().trim().email().max(255),
        base: z.string().trim().url().max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    await assertAdmin(context as Ctx);
    const base = data.base.replace(/\/+$/, "");
    if (!/^https:\/\//i.test(base)) throw new Error("The website address must start with https://");
    const { signProspectUnsubscribe } = await import("./prospect-unsubscribe.server");
    const email = data.email.trim().toLowerCase();
    const token = await signProspectUnsubscribe(email, data.prospectId);
    const params = new URLSearchParams({ e: email, t: token, id: data.prospectId });
    return { url: `${base}/unsubscribe?${params.toString()}` };
  });

/**
 * Public opt-out. The signature in the link is what authorises the change, so a bad link never
 * touches any record. Marks every lead that uses the address as do not contact, and adds the
 * address to the permanent blocked list.
 */
export const processProspectUnsubscribe = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        prospectId: z.string().uuid(),
        token: z.string().min(16).max(128),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; reason: "invalid_link" }> => {
    const { verifyProspectUnsubscribe } = await import("./prospect-unsubscribe.server");
    const valid = await verifyProspectUnsubscribe(data.email, data.prospectId, data.token).catch(() => false);
    if (!valid) return { ok: false, reason: "invalid_link" };

    const email = data.email.trim().toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sb: any = supabaseAdmin;
    const now = new Date().toISOString();

    await sb.from("email_suppressions").upsert({ email, reason: "unsubscribed" }, { onConflict: "email" });

    const ids = new Set<string>([data.prospectId]);
    for (const column of ["email", "contact_email"]) {
      const { data: rows } = await sb.from("prospects").select("id").eq(column, email);
      for (const r of (rows ?? []) as Array<{ id: string }>) ids.add(r.id);
    }

    const { data: updated } = await sb
      .from("prospects")
      .update({ do_not_contact: true, do_not_contact_at: now, do_not_contact_reason: "unsubscribed", updated_at: now })
      .in("id", [...ids])
      .select("id");

    const touched = ((updated ?? []) as Array<{ id: string }>).map((r) => r.id);
    if (touched.length) {
      await sb.from("prospect_activity").insert(
        touched.map((id) => ({
          prospect_id: id,
          type: "opt_out",
          content: "Unsubscribed using the link in an email.",
          created_by_name: "Recipient",
        })),
      );
    }
    return { ok: true };
  });

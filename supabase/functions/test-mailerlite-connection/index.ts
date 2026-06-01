import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ML_BASE = "https://connect.mailerlite.com/api";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const ML_TOKEN = Deno.env.get("MAILERLITE_API_TOKEN");
    const ML_GROUP = Deno.env.get("MAILERLITE_GROUP_ID");
    if (!ML_TOKEN || !ML_GROUP) throw new Error("MailerLite secrets missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Admin check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    const mlGet = async (path: string) => {
      const r = await fetch(`${ML_BASE}${path}`, {
        headers: { Authorization: `Bearer ${ML_TOKEN}`, Accept: "application/json" },
      });
      const text = await r.text();
      let json: any = {}; try { json = text ? JSON.parse(text) : {}; } catch {}
      return { ok: r.ok, status: r.status, body: json, raw: text };
    };

    const [group, groupSubs, account, domains] = await Promise.all([
      mlGet(`/groups/${ML_GROUP}`),
      mlGet(`/groups/${ML_GROUP}/subscribers?limit=50`),
      mlGet(`/account`),
      mlGet(`/domains`),
    ]);

    // Also list Supabase subscribers for comparison
    const { data: dbSubs } = await supabase
      .from("subscribers").select("email,status").eq("status", "active");

    const groupSubList = (groupSubs.body?.data ?? []).map((s: any) => ({
      email: s.email, status: s.status,
    }));
    const dbEmails = (dbSubs ?? []).map((s: any) => s.email.toLowerCase());
    const mlEmails = groupSubList.map((s: any) => (s.email ?? "").toLowerCase());
    const missingFromMl = dbEmails.filter((e: string) => !mlEmails.includes(e));

    return new Response(JSON.stringify({
      group: {
        ok: group.ok, status: group.status,
        name: group.body?.data?.name,
        total: group.body?.data?.total ?? group.body?.data?.active_count,
        id: ML_GROUP,
      },
      group_subscribers: { ok: groupSubs.ok, status: groupSubs.status, list: groupSubList },
      account: { ok: account.ok, status: account.status, name: account.body?.data?.account?.name, email: account.body?.data?.account?.email },
      domains: { ok: domains.ok, status: domains.status, list: (domains.body?.data ?? []).map((d: any) => ({ name: d.name, verified: d.dkim_verified_at != null || d.tracking_verified_at != null, dkim: d.dkim_verified_at, spf: d.spf_verified_at })) },
      db_subscribers: { count: dbEmails.length, emails: dbEmails },
      missing_from_mailerlite: missingFromMl,
    }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("test-mailerlite-connection error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

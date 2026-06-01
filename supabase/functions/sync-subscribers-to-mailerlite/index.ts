import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { data: subs, error } = await supabase
      .from("subscribers").select("email, source_slug").eq("status", "active");
    if (error) throw error;

    let synced = 0;
    const failures: { email: string; error: string }[] = [];

    for (const s of subs ?? []) {
      try {
        const r = await fetch("https://connect.mailerlite.com/api/subscribers", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ML_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: s.email,
            groups: [ML_GROUP],
            status: "active",
            fields: { source: s.source_slug ?? "backfill" },
          }),
        });
        const text = await r.text();
        if (!r.ok) { failures.push({ email: s.email, error: `${r.status}: ${text.slice(0,200)}` }); }
        else synced++;
      } catch (e: any) {
        failures.push({ email: s.email, error: e?.message ?? "unknown" });
      }
    }

    return new Response(JSON.stringify({
      total: subs?.length ?? 0, synced, failed: failures.length, failures,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("sync-subscribers-to-mailerlite error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

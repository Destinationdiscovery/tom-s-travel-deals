import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const RESEND = Deno.env.get("RESEND_API_KEY");
    if (!RESEND) throw new Error("RESEND_API_KEY missing");

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

    const { edition_id, email } = await req.json();
    if (!edition_id || !email) {
      return new Response(JSON.stringify({ error: "edition_id and email required" }), { status: 400, headers: corsHeaders });
    }

    const { data: edition, error: edErr } = await supabase
      .from("compass_editions").select("*").eq("id", edition_id).single();
    if (edErr || !edition) throw new Error(edErr?.message ?? "Edition not found");
    if (!edition.full_html) throw new Error("Edition has no HTML");

    const subject = edition.subject_line || edition.subject_line_options?.[0] || `Compass Edition #${edition.edition_number}`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "ReviewThenGo Compass <onboarding@resend.dev>",
        to: [email],
        subject: `[TEST] ${subject}`,
        html: edition.full_html,
      }),
    });
    const text = await r.text();
    if (!r.ok) throw new Error(`Resend ${r.status}: ${text}`);

    return new Response(JSON.stringify({ success: true, sent_to: email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-edition-test error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

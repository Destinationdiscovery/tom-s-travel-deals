import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ML_BASE = "https://connect.mailerlite.com/api";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ML_TOKEN = Deno.env.get("MAILERLITE_API_TOKEN");
    const ML_GROUP = Deno.env.get("MAILERLITE_GROUP_ID");
    if (!ML_TOKEN || !ML_GROUP) {
      return new Response(JSON.stringify({ error: "MailerLite secrets missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin via JWT OR allow service-role (cron/internal)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const token = authHeader.replace("Bearer ", "");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (token !== SERVICE_KEY) {
      const { data: userData } = await supabase.auth.getUser(token);
      if (!userData?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      const { data: roleRow } = await supabase
        .from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
      if (!roleRow) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { edition_id } = await req.json();
    if (!edition_id) return new Response(JSON.stringify({ error: "edition_id required" }), { status: 400, headers: corsHeaders });

    const { data: edition, error: edErr } = await supabase
      .from("compass_editions").select("*").eq("id", edition_id).single();
    if (edErr || !edition) throw new Error(edErr?.message ?? "Edition not found");
    if (!edition.full_html) throw new Error("Edition has no HTML to send");

    const subject = edition.subject_line || edition.subject_line_options?.[0] || `Compass Edition #${edition.edition_number}`;
    const fromEmail = Deno.env.get("MAILERLITE_FROM_EMAIL") || "hello@reviewthengo.com";
    const fromName = Deno.env.get("MAILERLITE_FROM_NAME") || "ReviewThenGo Compass";

    const mlFetch = async (path: string, init?: RequestInit) => {
      const r = await fetch(`${ML_BASE}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${ML_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(init?.headers ?? {}),
        },
      });
      const text = await r.text();
      let json: any = {}; try { json = text ? JSON.parse(text) : {}; } catch {}
      if (!r.ok) throw new Error(`MailerLite ${path} ${r.status}: ${text}`);
      return json;
    };

    // 1. Create campaign
    const campaign = await mlFetch("/campaigns", {
      method: "POST",
      body: JSON.stringify({
        name: `Compass #${edition.edition_number} - ${new Date().toISOString().slice(0,10)}`,
        type: "regular",
        emails: [{
          subject,
          from_name: fromName,
          from: fromEmail,
          content: edition.full_html,
        }],
        groups: [ML_GROUP],
      }),
    });

    const campaignId = campaign?.data?.id;
    if (!campaignId) throw new Error("MailerLite did not return campaign id");

    // 2. Schedule instant delivery
    await mlFetch(`/campaigns/${campaignId}/schedule`, {
      method: "POST",
      body: JSON.stringify({ delivery: "instant" }),
    });

    // 3. Subscriber count
    const { count } = await supabase.from("subscribers").select("*", { count: "exact", head: true }).eq("status", "active");

    // 4. Update edition row
    const now = new Date().toISOString();
    await supabase.from("compass_editions").update({
      status: "sent",
      sent_at: now,
      published_at: now,
      mailerlite_campaign_id: String(campaignId),
      subscriber_count: count ?? 0,
    }).eq("id", edition_id);

    return new Response(JSON.stringify({ success: true, campaign_id: campaignId, subscriber_count: count ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("publish-compass-edition error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

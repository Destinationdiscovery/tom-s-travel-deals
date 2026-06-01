import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find the last sent edition
    const { data: lastSent } = await supabase
      .from("compass_editions")
      .select("sent_at")
      .eq("status", "sent")
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastSent?.sent_at) {
      const days = (Date.now() - new Date(lastSent.sent_at).getTime()) / 86400000;
      if (days < 14) {
        return new Response(JSON.stringify({ skipped: true, reason: `only ${days.toFixed(1)} days since last send` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Find the next ready edition
    const { data: nextEd } = await supabase
      .from("compass_editions")
      .select("id, edition_number")
      .eq("status", "ready")
      .order("edition_number", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!nextEd) {
      return new Response(JSON.stringify({ skipped: true, reason: "no ready edition" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Invoke publish-compass-edition with service role
    const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/publish-compass-edition`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ edition_id: nextEd.id }),
    });
    const out = await r.json();
    return new Response(JSON.stringify({ published: nextEd.edition_number, result: out }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("auto-publish-compass error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Handle web vitals reporting
    if (action === "vitals") {
      const { metric_name, value, page } = body;
      if (metric_name && value !== undefined && page) {
        await supabase.from("web_vitals").insert({ metric_name, value, page });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle affiliate click tracking
    if (action === "affiliate_click") {
      const { platform, page, position } = body;
      const user_agent = req.headers.get("user-agent") || null;
      if (platform && page) {
        await supabase.from("affiliate_clicks").insert({ platform, page, position, user_agent });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle reaction
    if (action === "react") {
      const { slug, reaction, session_id } = body;
      if (slug && reaction && session_id) {
        await supabase.from("review_reactions").upsert(
          { slug, reaction, session_id },
          { onConflict: "slug,session_id" }
        );
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: track view
    const { slug } = body;
    if (!slug || typeof slug !== "string") {
      return new Response(JSON.stringify({ error: "Invalid slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabase
      .from("review_views")
      .select("view_count")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("review_views")
        .update({ view_count: existing.view_count + 1, last_viewed_at: new Date().toISOString() })
        .eq("slug", slug);
    } else {
      await supabase
        .from("review_views")
        .insert({ slug, view_count: 1 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

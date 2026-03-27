import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BOT_PATTERNS = /bot|crawl|spider|slurp|mediapartners|adsbot|ahref|semrush|bytespider|gptbot|claudebot|perplexity|yandex|baidu|duckduck|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot/i;
const EXCLUDED_PREFIXES = ["gear-admin", "dashboard"];

function isBot(ua: string | null): boolean {
  return !!ua && BOT_PATTERNS.test(ua);
}

function isExcludedSlug(slug: string): boolean {
  return EXCLUDED_PREFIXES.some((p) => slug.startsWith(p));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const userAgent = req.headers.get("user-agent") || null;

    // Bot check — silently succeed without recording
    if (isBot(userAgent)) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Handle web vitals reporting
    if (action === "vitals") {
      const { metric_name, value, page } = body;
      if (metric_name && value !== undefined && page && !isExcludedSlug(page.replace(/^\//, ""))) {
        await supabase.from("web_vitals").insert({ metric_name, value, page });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle affiliate click tracking
    if (action === "affiliate_click") {
      const { platform, page, position } = body;
      if (platform && page) {
        await supabase.from("affiliate_clicks").insert({ platform, page, position, user_agent: userAgent });
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

    // Handle session tracking
    if (action === "session") {
      const { session_id, page, duration } = body;
      if (!session_id || !page) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if session exists
      const { data: existing } = await supabase
        .from("sessions")
        .select("id, page_count, duration_seconds")
        .eq("session_id", session_id)
        .maybeSingle();

      if (existing) {
        const newPageCount = (existing.page_count || 1) + 1;
        const newDuration = Math.max(existing.duration_seconds || 0, duration || 0);
        await supabase
          .from("sessions")
          .update({
            page_count: newPageCount,
            duration_seconds: newDuration,
            last_activity_at: new Date().toISOString(),
            is_bounce: newPageCount <= 1,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("sessions").insert({
          session_id,
          first_page: page,
          page_count: 1,
          duration_seconds: duration || 0,
          is_bounce: true,
        });
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

    // Skip excluded slugs
    if (isExcludedSlug(slug)) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert per-event row for granular time filtering
    await supabase.from("page_view_events").insert({ slug });

    // Update aggregate view count
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "x-cache",
};

const TOOL_NAME = "flights";
const PROMPT_VERSION = "v1";
const TTL_MS = 60 * 60 * 1000; // 1 hour
const normalizeKey = (s: string) => `${PROMPT_VERSION}:${s.trim().toLowerCase().replace(/\s+/g, " ")}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const cacheKey = normalizeKey(query);
    const { data: cached } = await supabase
      .from("tool_search_cache")
      .select("id, result_data, hit_count")
      .eq("tool_name", TOOL_NAME).eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString()).maybeSingle();
    if (cached) {
      supabase.from("tool_search_cache").update({ hit_count: (cached.hit_count || 0) + 1 }).eq("id", cached.id).then(() => {});
      supabase.from("tool_search_events").insert({ tool_name: TOOL_NAME, query, cache_hit: true }).then(() => {});
      return new Response(JSON.stringify(cached.result_data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not set");

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: `Find the best upcoming flight deals for: "${query}". Return a JSON object with this exact structure:
{
  "route": "Origin to Destination",
  "summary": "One sentence about the route and deals",
  "deals": [
    {
      "airline": "Airline name",
      "price": "$XXX",
      "dates": "Approximate travel dates or flexibility note",
      "class": "Economy/Business/etc",
      "stops": "Nonstop or 1 stop",
      "notes": "Brief deal detail"
    }
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "bestMonth": "Best month to book for cheapest fares",
  "averagePrice": "$XXX typical round-trip"
}
Return 5 deals. Only return the JSON object, no other text.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Perplexity error:", response.status, errText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    const result = match ? JSON.parse(match[0]) : {};

    await supabase.from("tool_search_cache").upsert({
      tool_name: TOOL_NAME, cache_key: cacheKey, query, result_data: result,
      expires_at: new Date(Date.now() + TTL_MS).toISOString(), hit_count: 0,
    }, { onConflict: "tool_name,cache_key" });

    supabase.from("tool_search_events").insert({ tool_name: TOOL_NAME, query, cache_hit: false }).then(() => {});

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

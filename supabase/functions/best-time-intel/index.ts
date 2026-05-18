import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "x-cache",
};

const TOOL_NAME = "best_time";
const PROMPT_VERSION = "v1";
const TTL_DAYS = 7;

function normalizeKey(input: string) {
  return `${PROMPT_VERSION}:${input.trim().toLowerCase().replace(/\s+/g, " ")}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination } = await req.json();
    if (!destination) throw new Error("Missing destination");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const cacheKey = normalizeKey(destination);

    // Cache check
    const { data: cached } = await supabase
      .from("tool_search_cache")
      .select("id, result_data, hit_count")
      .eq("tool_name", TOOL_NAME)
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      supabase
        .from("tool_search_cache")
        .update({ hit_count: (cached.hit_count || 0) + 1 })
        .eq("id", cached.id)
        .then(() => {});
      supabase.from("tool_search_events").insert({ tool_name: TOOL_NAME, query: destination, cache_hit: true }).then(() => {});
      return new Response(JSON.stringify(cached.result_data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Best time to visit ${destination}. Return a JSON object with these exact fields:
{
  "destination": "Full destination name",
  "verdict": "One sentence summary of best time to visit",
  "bestMonths": ["March", "April", "May"],
  "seasons": [
    { "name": "Spring", "months": "Mar-May", "tempC": "15-22", "tempF": "59-72", "rainfall": "Low", "crowds": "Moderate", "flightPrices": "Medium", "verdict": "Best overall value" },
    { "name": "Summer", "months": "Jun-Aug", "tempC": "25-35", "tempF": "77-95", "rainfall": "Low", "crowds": "High", "flightPrices": "High", "verdict": "Peak season" },
    { "name": "Fall", "months": "Sep-Nov", "tempC": "12-20", "tempF": "54-68", "rainfall": "Medium", "crowds": "Low", "flightPrices": "Low", "verdict": "Shoulder season deals" },
    { "name": "Winter", "months": "Dec-Feb", "tempC": "2-8", "tempF": "36-46", "rainfall": "Medium", "crowds": "Medium", "flightPrices": "Medium", "verdict": "Holiday crowds" }
  ],
  "events": [{ "name": "Event name", "month": "Month", "description": "Brief description" }],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "avoidMonths": ["Month"],
  "avoidReason": "Why to avoid those months"
}
Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a travel expert. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      if (response.status === 429) throw new Error("Rate limit exceeded. Try again shortly.");
      if (response.status === 402) throw new Error("AI credits exhausted.");
      throw new Error("AI service error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else throw new Error("Failed to parse AI response");
    }

    const payload = { ...result, citations: [] };

    // Write cache
    const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("tool_search_cache").upsert(
      {
        tool_name: TOOL_NAME,
        cache_key: cacheKey,
        query: destination,
        result_data: payload,
        expires_at: expiresAt,
        hit_count: 0,
      },
      { onConflict: "tool_name,cache_key" }
    );

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (e) {
    console.error("best-time-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

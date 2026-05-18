import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "x-cache",
};

const TOOL_NAME = "travel_search";
const PROMPT_VERSION = "v1";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const normalizeKey = (s: string) => `${PROMPT_VERSION}:${s.trim().toLowerCase().replace(/\s+/g, " ")}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Query must be at least 3 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const cacheKey = normalizeKey(query);
    const { data: cached } = await supabase
      .from("tool_search_cache")
      .select("id, result_data, hit_count")
      .eq("tool_name", TOOL_NAME).eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString()).maybeSingle();
    if (cached) {
      supabase.from("tool_search_cache").update({ hit_count: (cached.hit_count || 0) + 1 }).eq("id", cached.id).then(() => {});
      return new Response(JSON.stringify(cached.result_data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!apiKey) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    const systemPrompt = `You are a travel search assistant. Given a user query about travel destinations, hotels, resorts, or experiences, return a JSON object with:

1. A "results" array of 8-10 REAL, currently operating properties that match the query. Each result must have:
- "name": string, the exact real name of the property
- "location": string, city/area, country
- "type": string, hotel, resort, villa, boutique hotel, etc.
- "rating": number, approximate rating out of 5 (e.g. 4.5)
- "description": string, 1-2 sentence summary of what makes it special
- "bestFor": string[], 2-4 tags like "Couples", "Families", "Luxury", "Budget", "Adults Only", "All-Inclusive", "Beach", "Adventure"
- "priceRange": string, one of "$", "$$", "$$$", "$$$$"

2. An OPTIONAL "activities" array of 6-8 REAL things to do / experiences / attractions. ONLY include this array when the query implies the user wants experiences, sightseeing, exploration, or "things to do", for example queries like "hidden gems in Rome", "best things to do in Tokyo", or "what to see in Barcelona". Do NOT include activities for queries that are clearly about accommodation only, like "adults only resorts in Punta Cana" or "luxury hotels in Maldives". Each activity must have:
- "name": string, the real name of the activity, tour, or attraction
- "location": string, neighborhood or area
- "category": string, e.g. "Food & Drink", "Sightseeing", "Adventure", "Culture", "Nightlife", "Nature", "Shopping"
- "rating": number, approximate rating out of 5
- "description": string, 1-2 sentence summary
- "bestFor": string[], 2-4 tags like "Couples", "Foodies", "History Buffs", "Families", "Solo Travelers"
- "priceRange": string, one of "$", "$$", "$$$", "$$$$"

IMPORTANT:
- Only include REAL properties and activities that currently exist and operate
- Return exactly the JSON structure requested, nothing else
- Do not include markdown formatting or code blocks
- CRITICAL: "results" MUST always be a JSON array (use [] if no properties match). "activities" MUST always be a JSON array (use [] if not applicable). Never nest activities inside the results object.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const citations = data.citations || [];

    if (!content) {
      throw new Error("No content in Perplexity response");
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    // Repair common JSON issues: unquoted keys
    jsonStr = jsonStr.replace(/(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to find a JSON object in the string
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        let repaired = objectMatch[0].replace(/(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        parsed = JSON.parse(repaired);
      } else {
        throw new Error("Could not parse search results");
      }
    }

    let results = [];
    let activities = [];

    if (Array.isArray(parsed.results)) {
      results = parsed.results;
    } else if (Array.isArray(parsed)) {
      results = parsed;
    }

    if (Array.isArray(parsed.activities)) {
      activities = parsed.activities;
    }

    // Handle case where Perplexity nests activities inside results object
    if (!Array.isArray(parsed.results) && parsed.results?.activities) {
      const nested = parsed.results.activities;
      if (Array.isArray(nested)) {
        activities = [...activities, ...nested];
      }
    }

    const payload = { results, activities, citations };
    await supabase.from("tool_search_cache").upsert({
      tool_name: TOOL_NAME, cache_key: cacheKey, query, result_data: payload,
      expires_at: new Date(Date.now() + TTL_MS).toISOString(), hit_count: 0,
    }, { onConflict: "tool_name,cache_key" });

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("Travel search error:", error);
    return new Response(JSON.stringify({ error: error.message || "Search failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

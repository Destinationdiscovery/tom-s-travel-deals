import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "x-cache",
};

const TOOL_NAME = "safety";
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

    const prompt = `Safety information for travelers visiting ${destination}. Return a JSON object with these exact fields:
{
  "destination": "Full destination name",
  "safetyScore": 3.8,
  "verdict": "One sentence overall safety assessment",
  "categories": [
    { "name": "Street Safety", "score": 4.0, "note": "Brief note" },
    { "name": "Petty Crime", "score": 3.5, "note": "Brief note" },
    { "name": "Health & Hygiene", "score": 4.2, "note": "Brief note" },
    { "name": "Natural Hazards", "score": 3.0, "note": "Brief note" }
  ],
  "commonScams": [{ "name": "Scam name", "description": "How it works and how to avoid it" }],
  "healthTips": ["Tip 1", "Tip 2", "Tip 3"],
  "emergencyNumbers": { "police": "Number", "ambulance": "Number", "fire": "Number", "tourist_police": "Number or N/A" },
  "safestAreas": ["Area 1", "Area 2"],
  "areasToAvoid": ["Area 1", "Area 2"],
  "travelAdvisory": "General advisory note. Travelers should verify current advisories with their government's travel site before departure."
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
          { role: "system", content: "You are a travel safety expert. Return only valid JSON." },
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

    const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("tool_search_cache").upsert(
      {
        tool_name: TOOL_NAME,
        cache_key: cacheKey,
        query: destination,
        result_data: result,
        expires_at: expiresAt,
        hit_count: 0,
      },
      { onConflict: "tool_name,cache_key" }
    );

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (e: any) {
    console.error("safety-intel error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

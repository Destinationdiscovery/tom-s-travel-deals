import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS: Record<string, (citizenship: string, destination: string) => string> = {
  requirements: (citizenship, destination) =>
    `You are a travel requirements expert. A citizen of "${citizenship}" wants to travel to "${destination}".

Research and provide comprehensive, current entry requirements. Return your response as valid JSON only (no markdown, no code blocks):

{
  "visaRequired": true or false,
  "visaTypes": ["Type 1 with brief description", "Type 2..."],
  "documents": ["Required document 1", "Required document 2..."],
  "healthRequirements": ["Vaccination or health requirement 1..."],
  "customsRules": ["Important customs rule 1..."],
  "localLaws": ["Important local law travelers should know..."],
  "importantNotes": ["Any other critical information..."]
}

When mentioning any official forms, portals, government websites, or online applications, always include the full URL in parentheses immediately after the mention (e.g., "D'Viajeros travel form (https://dviajeros.mitrans.gob.cu)").

Be specific, accurate, and include practical details. If visa is not required, still list any entry conditions (e.g., maximum stay, passport validity requirements).`,

  advisories: (_citizenship, destination) =>
    `You are a travel safety expert. Research current travel advisories for "${destination}".

Return your response as valid JSON only (no markdown, no code blocks):

{
  "advisoryLevel": 1 to 4 (1=Exercise Normal Precautions, 2=Exercise Increased Caution, 3=Reconsider Travel, 4=Do Not Travel),
  "advisories": [
    {
      "source": "Government or organization name",
      "level": "Warning level text",
      "summary": "Brief summary of advisory",
      "details": "More detailed explanation"
    }
  ],
  "healthAlerts": ["Current health alert 1..."],
  "safetyTips": ["Practical safety tip 1..."]
}

Include advisories from multiple governments (US, UK, Canada, etc.) when available. Be balanced and factual.`,

  news: (_citizenship, destination) =>
    `You are a travel news reporter. Find the latest trending travel news and stories about "${destination}".

Return your response as valid JSON only (no markdown, no code blocks):

{
  "articles": [
    {
      "title": "News headline",
      "summary": "2-3 sentence summary of the story",
      "source": "News outlet name",
      "date": "Approximate date (e.g., January 2026)",
      "category": "Tourism" or "Safety" or "Infrastructure" or "Culture" or "Policy" or "Weather" or "Events"
    }
  ]
}

Include 5-8 recent, relevant articles. Focus on news that would matter to travelers planning a trip.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { citizenship, destination, type } = await req.json();

    // Validate type
    if (!type || !["requirements", "advisories", "news"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be requirements, advisories, or news." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate destination
    if (!destination || typeof destination !== "string" || destination.trim().length < 2 || destination.trim().length > 100) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid destination (2-100 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate citizenship for requirements
    if (type === "requirements") {
      if (!citizenship || typeof citizenship !== "string" || citizenship.trim().length < 2 || citizenship.trim().length > 100) {
        return new Response(
          JSON.stringify({ error: "Please provide your citizenship country (2-100 characters)." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const trimDest = destination.trim().toLowerCase();
    const trimCit = citizenship ? citizenship.trim().toLowerCase() : "";
    const cacheKey = type === "requirements" ? `${type}:${trimCit}:${trimDest}` : `${type}:${trimDest}`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache (7-day TTL)
    const { data: cached } = await supabase
      .from("travel_intel_cache")
      .select("*")
      .eq("cache_key", cacheKey)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (cached) {
      console.log("Cache hit for:", cacheKey);
      return new Response(JSON.stringify({ data: cached.result_data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Perplexity
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityKey) {
      return new Response(
        JSON.stringify({ error: "Perplexity API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = PROMPTS[type](citizenship?.trim() || "", destination.trim());

    const perplexityBody: Record<string, unknown> = {
      model: "sonar",
      messages: [
        { role: "system", content: "You are a travel intelligence expert. Always respond with valid JSON only, no markdown formatting." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    };

    if (type === "advisories") {
      perplexityBody.search_recency_filter = "month";
    } else if (type === "news") {
      perplexityBody.search_recency_filter = "week";
    }

    console.log("Calling Perplexity for travel-intel:", cacheKey);

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(perplexityBody),
    });

    if (!perplexityResponse.ok) {
      const errText = await perplexityResponse.text();
      console.error("Perplexity API error:", perplexityResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch travel intel. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const perplexityData = await perplexityResponse.json();
    const rawContent = perplexityData.choices?.[0]?.message?.content;
    const citations = perplexityData.citations || [];

    if (!rawContent) {
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let resultData;
    try {
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawContent.trim();
      resultData = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse Perplexity response:", rawContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    resultData.citations = citations;

    // Save to cache (upsert in case of race condition)
    await supabase
      .from("travel_intel_cache")
      .upsert({
        cache_key: cacheKey,
        intel_type: type,
        citizenship: type === "requirements" ? citizenship?.trim() : null,
        destination: destination.trim(),
        result_data: resultData,
      }, { onConflict: "cache_key" });

    return new Response(JSON.stringify({ data: resultData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("travel-intel error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

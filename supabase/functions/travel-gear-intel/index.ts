import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AMAZON_DOMAINS: Record<string, string> = {
  CA: "https://www.amazon.ca",
  US: "https://www.amazon.com",
  GB: "https://www.amazon.co.uk",
};

function buildAmazonUrl(productName: string, country: string, tags: Record<string, string>): string {
  const domain = AMAZON_DOMAINS[country] || AMAZON_DOMAINS.US;
  const tag = tags[country] || tags.US;
  return `${domain}/s?k=${encodeURIComponent(productName)}&tag=${tag}`;
}

const VALID_TYPES = ["must-haves", "review"] as const;
type IntelType = (typeof VALID_TYPES)[number];

const PROMPTS: Record<string, (query: string) => string> = {
  "must-haves": (query) =>
    `You are a travel packing expert. Research the 8-12 must-have items for "${query}".

Return your response as valid JSON only (no markdown, no code blocks):

{
  "items": [
    {
      "name": "Product Name",
      "brand": "Brand Name",
      "priceRange": "$XX - $XX",
      "reason": "Why this is essential for this type of travel",
      "category": "Category like Packing, Tech, Comfort, Safety, Health, Clothing, etc."
    }
  ]
}

Focus on essential, practical items travelers shouldn't forget. Be specific with product names and brands.`,

  review: (query) =>
    `You are a travel gear reviewer. Research "${query}" thoroughly using Amazon reviews, expert reviews, YouTube reviews, and travel blogs.

Return your response as valid JSON only (no markdown, no code blocks):

{
  "productName": "Full Product Name",
  "brand": "Brand Name",
  "priceRange": "$XX - $XX",
  "overallRating": 4.2,
  "ratings": {
    "Durability": 4.5,
    "Value": 3.8,
    "Portability": 4.0,
    "Comfort": 4.3,
    "Design": 4.1
  },
  "summary": "A 2-3 sentence summary of the product based on real reviews.",
  "reviewParagraphs": [
    "Paragraph 1 about build quality and first impressions synthesized from real reviews...",
    "Paragraph 2 about practical use and performance...",
    "Paragraph 3 about value proposition and comparisons...",
    "Paragraph 4 about long-term durability and reliability..."
  ],
  "pros": ["Pro 1", "Pro 2", "Pro 3", "Pro 4", "Pro 5"],
  "cons": ["Con 1", "Con 2", "Con 3"],
  "bestFor": ["Frequent flyers", "Weekend trips", "Budget travelers"]
}

All ratings must be between 1.0 and 5.0. Be honest and balanced. Synthesize from real buyer feedback.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, type, country } = await req.json();

    if (!type || !VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be must-haves or review." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!query || typeof query !== "string" || query.trim().length < 2 || query.trim().length > 200) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid query (2-200 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimQuery = query.trim().toLowerCase();
    const userCountry = (country || "US").toUpperCase();
    const cacheKey = `${type}:${trimQuery}`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache (7-day TTL)
    const { data: cached } = await supabase
      .from("gear_intel_cache")
      .select("*")
      .eq("cache_key", cacheKey)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    // Parse Amazon tags
    let amazonTags: Record<string, string> = {};
    try {
      const tagsStr = Deno.env.get("AMAZON_ASSOCIATE_TAGS");
      if (tagsStr) amazonTags = JSON.parse(tagsStr);
    } catch {
      console.error("Failed to parse AMAZON_ASSOCIATE_TAGS");
    }

    if (cached) {
      console.log("Cache hit for:", cacheKey);
      const cachedResult = cached.result_data as Record<string, unknown>;

      if (type === "must-haves" && Array.isArray(cachedResult.items)) {
        cachedResult.items = (cachedResult.items as Record<string, string>[]).map((item) => ({
          ...item,
          amazonUrl: buildAmazonUrl(item.name, userCountry, amazonTags),
        }));
      } else if (type === "review") {
        (cachedResult as Record<string, unknown>).amazonUrl = buildAmazonUrl(
          (cachedResult.productName as string) || trimQuery, userCountry, amazonTags
        );
      }

      return new Response(JSON.stringify({ data: cachedResult }), {
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

    const prompt = PROMPTS[type](query.trim());
    console.log("Calling Perplexity for travel-gear-intel:", cacheKey);

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You are a travel gear expert. Always respond with valid JSON only, no markdown formatting." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!perplexityResponse.ok) {
      const errText = await perplexityResponse.text();
      console.error("Perplexity API error:", perplexityResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch gear intel. Please try again." }),
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

    let resultData: Record<string, unknown>;
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

    // Cache result (without Amazon URLs since they're country-specific)
    await supabase
      .from("gear_intel_cache")
      .upsert({
        cache_key: cacheKey,
        intel_type: type,
        query: query.trim(),
        result_data: resultData,
      }, { onConflict: "cache_key" });

    // Add Amazon URLs for this user's country
    if (type === "must-haves" && Array.isArray(resultData.items)) {
      resultData.items = (resultData.items as Record<string, string>[]).map((item) => ({
        ...item,
        amazonUrl: buildAmazonUrl(item.name, userCountry, amazonTags),
      }));
    } else if (type === "review") {
      resultData.amazonUrl = buildAmazonUrl(
        (resultData.productName as string) || query.trim(), userCountry, amazonTags
      );
    }

    return new Response(JSON.stringify({ data: resultData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("travel-gear-intel error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

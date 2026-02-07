import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyName } = await req.json();
    if (!propertyName || typeof propertyName !== "string" || propertyName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid property or destination name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedName = propertyName.trim();
    const slug = slugify(trimmedName);

    // Create Supabase client with service role for writes
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache first
    const { data: cached } = await supabase
      .from("cached_reviews")
      .select("*")
      .ilike("property_name", trimmedName)
      .maybeSingle();

    if (cached) {
      console.log("Cache hit for:", trimmedName);
      // Increment search count
      try {
        const { data: existing } = await supabase
          .from("search_suggestions")
          .select("id, search_count")
          .ilike("name", trimmedName)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("search_suggestions")
            .update({ search_count: (existing.search_count || 0) + 1 })
            .eq("id", existing.id);
        }
      } catch (e) {
        console.error("Failed to increment search count:", e);
      }
      return new Response(JSON.stringify({ review: cached }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Perplexity API
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityKey) {
      return new Response(
        JSON.stringify({ error: "Perplexity API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a travel review expert. Research "${trimmedName}" and provide a comprehensive, synthesized review based on real traveler experiences from TripAdvisor, Google Reviews, travel blogs, and other review sources.

Return your response as valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "propertyName": "Official full name of the property/destination",
  "location": "City, Country or Region",
  "propertyType": "hotel" or "resort" or "villa" or "destination" or "cruise" or "attraction",
  "overallRating": number between 1 and 5 (one decimal),
  "ratings": {
    "Rooms": number 1-5,
    "Food": number 1-5,
    "Service": number 1-5,
    "Location": number 1-5,
    "Value": number 1-5
  },
  "summary": "A 2-3 sentence overview summarizing the consensus from real reviews",
  "reviewParagraphs": [
    "Detailed paragraph 1 about the property synthesized from real reviews...",
    "Detailed paragraph 2...",
    "Detailed paragraph 3...",
    "Detailed paragraph 4..."
  ],
  "tips": [
    "Practical tip 1 based on traveler experiences...",
    "Practical tip 2...",
    "Practical tip 3...",
    "Practical tip 4...",
    "Practical tip 5..."
  ],
  "bestFor": [
    "Tag 1 (e.g., Couples, Families, Solo travelers)",
    "Tag 2",
    "Tag 3",
    "Tag 4"
  ]
}

Important: For the ratings object, use category names that are most relevant to this type of property. For hotels/resorts use Rooms, Food, Service, Location, Value. For cruises use Cabins, Dining, Entertainment, Excursions, Value. For destinations/attractions adapt categories accordingly. Always include exactly 5 rating categories.

Make the review feel authentic and balanced - mention both positives and negatives that real travelers have noted. Include specific details like room types, restaurant names, or nearby attractions when possible.`;

    console.log("Calling Perplexity for:", trimmedName);

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You are a travel review expert. Always respond with valid JSON only, no markdown formatting." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!perplexityResponse.ok) {
      const errText = await perplexityResponse.text();
      console.error("Perplexity API error:", perplexityResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to generate review. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const perplexityData = await perplexityResponse.json();
    const rawContent = perplexityData.choices?.[0]?.message?.content;
    const citations = perplexityData.citations || [];

    if (!rawContent) {
      return new Response(
        JSON.stringify({ error: "No review content generated" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON from Perplexity's response
    let reviewData;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawContent.trim();
      reviewData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse Perplexity response:", rawContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse review data. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add citations to the review data
    reviewData.citations = citations;

    // Save to cached_reviews
    const { data: savedReview, error: saveError } = await supabase
      .from("cached_reviews")
      .insert({
        property_name: reviewData.propertyName || trimmedName,
        slug,
        location: reviewData.location,
        property_type: reviewData.propertyType,
        review_data: reviewData,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving to cache:", saveError);
      // Still return the review even if caching fails
    }

    // Save search suggestion (compatible with case-insensitive unique index)
    try {
      const suggestionName = reviewData.propertyName || trimmedName;
      const { data: existingSuggestion } = await supabase
        .from("search_suggestions")
        .select("id, search_count")
        .ilike("name", suggestionName)
        .maybeSingle();

      if (existingSuggestion) {
        await supabase
          .from("search_suggestions")
          .update({ search_count: (existingSuggestion.search_count || 0) + 1 })
          .eq("id", existingSuggestion.id);
      } else {
        await supabase
          .from("search_suggestions")
          .insert({
            name: suggestionName,
            property_type: reviewData.propertyType,
            search_count: 1,
          });
      }
    } catch (e) {
      console.error("Failed to save search suggestion:", e);
    }

    const result = savedReview || {
      property_name: reviewData.propertyName || trimmedName,
      slug,
      location: reviewData.location,
      property_type: reviewData.propertyType,
      review_data: reviewData,
    };

    return new Response(JSON.stringify({ review: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-review error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

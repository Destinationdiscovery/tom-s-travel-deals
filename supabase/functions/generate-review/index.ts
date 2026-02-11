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

async function fetchPlacePhotos(placeName: string, maxPhotos = 6): Promise<string[]> {
  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!apiKey) {
    console.log("No Google Places API key configured, skipping photos");
    return [];
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.photos",
      },
      body: JSON.stringify({
        textQuery: placeName,
        maxResultCount: 1,
      }),
    });

    if (!response.ok) {
      console.error("Google Places search error:", response.status, await response.text());
      return [];
    }

    const data = await response.json();
    const place = data.places?.[0];
    if (!place?.photos || place.photos.length === 0) {
      console.log("No photos found for:", placeName);
      return [];
    }

    return place.photos.slice(0, maxPhotos).map((photo: { name: string }) => photo.name);
  } catch (e) {
    console.error("Failed to fetch place photos:", e);
    return [];
  }
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
  ],
  "thingsToDo": [
    {
      "name": "Name of activity or attraction nearby",
      "description": "1-2 sentence description of the activity based on real traveler recommendations",
      "category": "Adventure" or "Dining" or "Culture" or "Nature" or "Shopping" or "Nightlife" or "Relaxation" or "Sightseeing",
      "rating": number between 1 and 5 (one decimal, based on real reviews)
    },
    {
      "name": "Second activity",
      "description": "Description...",
      "category": "Category",
      "rating": number
    },
    {
      "name": "Third activity",
      "description": "Description...",
      "category": "Category",
      "rating": number
    }
  ]
}

Important: For the ratings object, use category names that are most relevant to this type of property. For hotels/resorts use Rooms, Food, Service, Location, Value. For cruises use Cabins, Dining, Entertainment, Excursions, Value. For destinations/attractions adapt categories accordingly. Always include exactly 5 rating categories.

For thingsToDo, include exactly 3 popular activities, attractions, or experiences OUTSIDE the property that real travelers recommend. CRITICAL RULES:
- Activities must be independent businesses, attractions, or experiences in the surrounding area -- NOT part of the hotel/resort/property itself.
- NEVER recommend on-site amenities such as the resort's spa, pool, beach club, restaurant, gym, kids club, or any facility operated by the property.
- Each activity should require at least a short walk or drive away from the property.
- Use real, specific names of places (e.g., "Rick's Cafe Negril" not "local cliff jumping spot").
- Include a rating for each based on aggregated real traveler reviews.

Make the review feel authentic and balanced - mention both positives and negatives that real travelers have noted. Include specific details like room types, restaurant names, or nearby attractions when possible.`;

    console.log("Calling Perplexity for:", trimmedName);

    // Fetch Perplexity review and Google Places photos in parallel
    const [perplexityResponse, photoReferences] = await Promise.all([
      fetch("https://api.perplexity.ai/chat/completions", {
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
      }),
      fetchPlacePhotos(trimmedName),
    ]);

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

    let reviewData;
    try {
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

    // Attach citations and photo references
    reviewData.citations = citations;
    reviewData.photoReferences = photoReferences;

    // Fetch a Google Places photo for each activity
    if (reviewData.thingsToDo && Array.isArray(reviewData.thingsToDo) && reviewData.location) {
      const activityPhotoPromises = reviewData.thingsToDo.slice(0, 3).map(
        (activity: { name: string }) =>
          fetchPlacePhotos(`${activity.name} ${reviewData.location}`, 1)
      );
      const activityPhotos = await Promise.all(activityPhotoPromises);
      reviewData.thingsToDo.forEach((activity: { photoReference?: string }, i: number) => {
        activity.photoReference = activityPhotos[i]?.[0] || undefined;
      });
    }

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
    }

    // Save search suggestion
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

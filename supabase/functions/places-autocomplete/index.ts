import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY is not configured");
    }

    const { input } = await req.json();
    if (!input || typeof input !== "string" || input.trim().length < 2) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify({
          input: input.trim(),
          includedPrimaryTypes: [
            "lodging",
            "tourist_attraction",
            "locality",
            "resort_hotel",
            "hotel",
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Google Places API error [${response.status}]: ${errorBody}`);
      throw new Error(`Google Places API returned ${response.status}`);
    }

    const data = await response.json();

    const suggestions = (data.suggestions || [])
      .filter((s: any) => s.placePrediction)
      .slice(0, 6)
      .map((s: any) => {
        const prediction = s.placePrediction;
        return {
          placeId: prediction.placeId,
          mainText: prediction.structuredFormat?.mainText?.text || prediction.text?.text || "",
          secondaryText: prediction.structuredFormat?.secondaryText?.text || "",
        };
      });

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("places-autocomplete error:", error);
    return new Response(
      JSON.stringify({ suggestions: [], error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

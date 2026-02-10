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
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Invalid query" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const cseId = Deno.env.get("GOOGLE_CSE_ID");

    if (!apiKey || !cseId) {
      return new Response(
        JSON.stringify({ error: "Google API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchQuery = `${query.trim()} product`;
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(searchQuery)}&cx=${cseId}&key=${apiKey}&searchType=image&num=1&imgSize=medium&safe=active`;

    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      console.error("Google CSE error:", response.status, errText);
      return new Response(
        JSON.stringify({ imageUrl: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const imageUrl = data.items?.[0]?.link || null;

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("product-image-search error:", e);
    return new Response(
      JSON.stringify({ imageUrl: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

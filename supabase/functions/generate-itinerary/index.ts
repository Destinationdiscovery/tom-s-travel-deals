import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not configured");

    const prompt = `Create a detailed travel itinerary for: "${query}". Return a JSON object with these exact fields:
{
  "destination": "Full destination name",
  "duration": "5 days",
  "budget": "Budget/Mid-range/Luxury",
  "summary": "One sentence overview of this itinerary",
  "totalEstimatedCost": "$1,200 - $1,800 per person",
  "days": [
    {
      "day": 1,
      "title": "Arrival & Exploration",
      "activities": [
        { "time": "Morning", "activity": "Activity name", "description": "Brief description", "cost": "$20", "tip": "Insider tip" },
        { "time": "Afternoon", "activity": "Activity name", "description": "Brief description", "cost": "$30", "tip": "Insider tip" },
        { "time": "Evening", "activity": "Activity name", "description": "Brief description", "cost": "$50", "tip": "Insider tip" }
      ],
      "meals": [
        { "type": "Lunch", "restaurant": "Restaurant name", "cuisine": "Local", "priceRange": "$$" },
        { "type": "Dinner", "restaurant": "Restaurant name", "cuisine": "Local", "priceRange": "$$$" }
      ]
    }
  ],
  "packingTips": ["Tip 1", "Tip 2", "Tip 3"],
  "transportTips": ["How to get around tip 1", "Tip 2"],
  "warnings": ["Watch out for X"]
}
Infer duration and budget from the query. If not specified, default to 5 days mid-range.
Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You are an expert travel planner. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Perplexity error:", response.status, text);
      throw new Error("AI service error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    content = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return new Response(JSON.stringify({ ...result, citations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-itinerary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination } = await req.json();
    if (!destination) throw new Error("Missing destination");

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not configured");

    const prompt = `Best time to visit ${destination} in 2025-2026. Return a JSON object with these exact fields:
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
  "events": [
    { "name": "Event name", "month": "Month", "description": "Brief description" }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "avoidMonths": ["Month"],
  "avoidReason": "Why to avoid those months"
}
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
          { role: "system", content: "You are a travel expert. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
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

    // Strip markdown fences
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // Try to extract JSON from response
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
    console.error("best-time-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

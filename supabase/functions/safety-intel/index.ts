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

    const prompt = `Safety information for travelers visiting ${destination} in 2025-2026. Return a JSON object with these exact fields:
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
  "commonScams": [
    { "name": "Scam name", "description": "How it works and how to avoid it" }
  ],
  "healthTips": ["Tip 1", "Tip 2", "Tip 3"],
  "emergencyNumbers": {
    "police": "Number",
    "ambulance": "Number",
    "fire": "Number",
    "tourist_police": "Number or N/A"
  },
  "safestAreas": ["Area 1", "Area 2"],
  "areasToAvoid": ["Area 1", "Area 2"],
  "travelAdvisory": "Current government travel advisory level and summary"
}
Return ONLY valid JSON, no markdown or extra text.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You are a travel safety expert. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error(`Perplexity API error: ${response.status}`);

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON in response");

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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
    const { reviews } = await req.json();

    if (!Array.isArray(reviews) || reviews.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 reviews are required for comparison." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const propertyList = reviews
      .map(
        (r: any, i: number) =>
          `Property ${i + 1}: "${r.propertyName}" in ${r.location || "unknown location"}
  Overall Rating: ${r.overallRating}/5
  Ratings: ${JSON.stringify(r.ratings)}
  Summary: ${r.summary}
  Best For: ${(r.bestFor || []).join(", ")}`
      )
      .join("\n\n");

    const systemPrompt = `You are a professional travel advisor. You will be given data about ${reviews.length} properties and must produce a structured comparison. Be specific, fair, and actionable. Write in a warm, expert tone.`;

    const userPrompt = `Compare these properties and produce a professional verdict:\n\n${propertyList}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "comparison_verdict",
              description:
                "Return a structured comparison of the properties including category winners, overall recommendation, and a written verdict.",
              parameters: {
                type: "object",
                properties: {
                  categoryWinners: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        winner: { type: "string" },
                        reason: { type: "string" },
                      },
                      required: ["category", "winner", "reason"],
                      additionalProperties: false,
                    },
                  },
                  overallWinner: { type: "string" },
                  recommendation: { type: "string" },
                  verdict: { type: "string" },
                },
                required: ["categoryWinners", "overallWinner", "recommendation", "verdict"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "comparison_verdict" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI comparison failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const verdict = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ verdict }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compare-reviews error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

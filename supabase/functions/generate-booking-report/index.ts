import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are a travel agent's report generator. You receive structured booking data (JSON) and optionally uploaded document images. Your job is to produce a comprehensive, beautifully formatted MARKDOWN report that covers every piece of information available.

FORMAT GUIDELINES:
- Use clear section headers (## and ###)
- Use markdown tables for structured data (itineraries, passengers, payments, pricing breakdowns)
- Use prose summaries where appropriate
- Include emoji sparingly for visual interest (🚢 ✈️ 🏨 💰 📅 👤 🎒)
- Format currency values with proper symbols
- Make the report scannable — use bold for key facts
- If there are multiple rooms/cabins, give each its own subsection with passenger details
- Include a "Trip at a Glance" summary section at the top
- End with any extras, special requests, or notes

IMPORTANT:
- Include ALL data provided — don't skip any fields
- If flight details exist, format them clearly with airports and times
- If itinerary exists (cruise ports), create a nice table with dates, ports, arrival/departure times
- If payment history exists, create a payment timeline table
- Calculate and show per-person costs when possible
- Show balance due prominently if applicable

Also extract the total trip value as a number (sum of all room pricing totals, or the top-level pricing total if no rooms). Return this separately.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingData, files } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build the user message content
    const content: any[] = [];
    
    // Add the booking data as structured text
    content.push({
      type: "text",
      text: `Generate a comprehensive booking report from this data:\n\n${JSON.stringify(bookingData, null, 2)}`,
    });

    // Add any uploaded document images
    if (files?.length) {
      for (const file of files) {
        if (file.base64 && file.mimeType) {
          content.push({
            type: "image_url",
            image_url: {
              url: `data:${file.mimeType};base64,${file.base64}`,
            },
          });
        }
      }
      content.push({
        type: "text",
        text: "Also review the uploaded document images above and include any additional details found in them that aren't already in the structured data.",
      });
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "booking_report",
          description: "Return the generated markdown report and extracted total value",
          parameters: {
            type: "object",
            properties: {
              markdown: {
                type: "string",
                description: "The full markdown report",
              },
              total_value: {
                type: "number",
                description: "The total trip value/cost as a number (no currency symbol). Sum all room pricing totals if multiple rooms, otherwise use top-level pricing total. Return 0 if no pricing data.",
              },
            },
            required: ["markdown", "total_value"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content },
          ],
          tools,
          tool_choice: { type: "function", function: { name: "booking_report" } },
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error("AI gateway error:", status, body);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    if (choice?.message?.tool_calls?.length) {
      const args = JSON.parse(choice.message.tool_calls[0].function.arguments);
      return new Response(
        JSON.stringify({
          markdown: args.markdown,
          total_value: args.total_value || 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: if no tool call, try to use the message content as markdown
    const fallbackMarkdown = choice?.message?.content || "# Booking Report\n\nUnable to generate report. Please try again.";
    return new Response(
      JSON.stringify({
        markdown: fallbackMarkdown,
        total_value: 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-booking-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

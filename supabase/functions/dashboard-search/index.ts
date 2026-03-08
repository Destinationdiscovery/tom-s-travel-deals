import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY is not configured");

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a senior travel agent research assistant. Your job is to help a Canadian travel advisor find the best options for their clients.

When asked about resorts, hotels, or destinations:
- Provide specific property names, not generic advice
- Include approximate pricing when possible (per person, per night, or package)
- Mention what's included (all-inclusive, room-only, etc.)
- Note the best booking channels or tour operators
- Compare options in tables when listing multiple properties
- Mention any current deals or promotions you find

When asked about itineraries or trip planning:
- Consider group size, budget, and travel dates
- Suggest specific flights, transfers, and accommodations
- Mention visa/entry requirements for Canadian travellers

Always be specific, actionable, and cite your sources. Format with markdown tables, bold highlights, and bullet points for easy scanning.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Perplexity error:", response.status, errText);
      return new Response(JSON.stringify({ error: `Perplexity API error: ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream the SSE response through, then append citations at end
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let citations: string[] = [];
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let newlineIdx: number;
            while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
              const line = buffer.slice(0, newlineIdx).trim();
              buffer = buffer.slice(newlineIdx + 1);

              if (!line.startsWith("data: ") || line === "data: [DONE]") {
                if (line === "data: [DONE]") {
                  // Send citations as a custom SSE event before DONE
                  if (citations.length > 0) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ citations })}\n\n`));
                  }
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                }
                continue;
              }

              try {
                const parsed = JSON.parse(line.slice(6));
                // Capture citations from the response
                if (parsed.citations && Array.isArray(parsed.citations)) {
                  citations = parsed.citations;
                }
                // Forward the SSE chunk
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
              } catch {
                // skip unparseable
              }
            }
          }
        } catch (e) {
          console.error("Stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("dashboard-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

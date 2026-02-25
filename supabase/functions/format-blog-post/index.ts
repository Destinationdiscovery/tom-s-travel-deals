import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { rawText, imageCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a professional blog article formatter. You take raw article text and structure it into a professional blog layout.

Your job:
1. Split the raw text into well-sized paragraphs (3-6 sentences each, never too long)
2. Detect natural topic changes and insert section headings (h2-style) at those points
3. You have ${imageCount} images available (referenced as IMAGE_0, IMAGE_1, etc.)
4. Distribute images logically throughout the article — after introductory paragraphs, between major sections, NOT all at the end
5. Generate a short caption for each image based on the surrounding text context
6. Also generate a short excerpt (1-2 sentences) summarizing the article
7. Estimate a read time like "X min read"

Rules:
- The first block should be a text paragraph (the intro), NOT a heading
- Don't repeat text — use all the original content
- Keep the author's voice and tone intact
- Headings should be concise and engaging (3-8 words)
- Space images roughly evenly, placing them at natural visual breakpoints
- If there are 0 images, just structure the text with paragraphs and headings`;

    const userPrompt = `Here is the raw article text to format. There are ${imageCount} images available to place throughout.

---
${rawText}
---

Use the format_article tool to return the structured result.`;

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
              name: "format_article",
              description: "Return the formatted article as structured content blocks with excerpt and read time.",
              parameters: {
                type: "object",
                properties: {
                  excerpt: {
                    type: "string",
                    description: "1-2 sentence summary of the article for the blog card",
                  },
                  read_time: {
                    type: "string",
                    description: "Estimated read time like '7 min read'",
                  },
                  blocks: {
                    type: "array",
                    description: "Ordered array of content blocks that make up the article",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["text", "heading", "image"],
                          description: "Block type",
                        },
                        value: {
                          type: "string",
                          description: "For text: the paragraph text. For heading: the heading text. For image: IMAGE_0, IMAGE_1, etc.",
                        },
                        caption: {
                          type: "string",
                          description: "Optional caption for image blocks",
                        },
                      },
                      required: ["type", "value"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["excerpt", "read_time", "blocks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "format_article" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("format-blog-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

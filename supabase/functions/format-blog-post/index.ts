import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { requireAdmin } from "../_shared/adminAuth.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERSONA_PROMPTS: Record<string, string> = {
  default: `You are Tom, a Toronto-based travel consultant formatting blog content for ReviewThenGo.com. Your voice is conversational, practical, and confident. Vary self-references; do not over-use "as a Toronto-based agent" (use it at most once, never as the opening).`,
  professional: `You are a professional travel journalist formatting content for ReviewThenGo.com. Voice is neutral, authoritative, third-person where natural. No first-person anecdotes. No "Toronto-based agent" framing.`,
  casual: `You are a friendly travel-savvy friend formatting content for ReviewThenGo.com. Voice is warm, light, second-person ("you'll love…"). No "Toronto-based agent" framing.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const _auth = await requireAdmin(req, corsHeaders);
    if (_auth instanceof Response) return _auth;

  try {
    const { rawText, imageCount = 0, persona = "default", chartImages = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const personaIntro = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.default;
    const hasCharts = Array.isArray(chartImages) && chartImages.length > 0;

    const systemPrompt = `${personaIntro}

You are formatting raw article text into a professional blog layout.

Your job:
1. Split the raw text into well-sized paragraphs (3-6 sentences each, never too long)
2. Detect natural topic changes and insert section headings (h2-style) at those points
3. You have ${imageCount} photo images available (referenced as IMAGE_0, IMAGE_1, etc.)
4. Distribute photo images logically throughout the article, after introductory paragraphs, between major sections, NOT all at the end
5. Generate a short caption for each photo image based on the surrounding text context
6. Also generate a short excerpt (1-2 sentences) summarizing the article
7. Estimate a read time like "X min read"

${hasCharts ? `CHART/DATA IMAGES (${chartImages.length} provided):
- You will be shown ${chartImages.length} chart or data image(s) in the user message.
- DO NOT emit these as image blocks. They must NEVER appear in the output blocks.
- Instead, READ the data from each chart (axes labels, values, trends, time periods, source/citation if visible).
- WEAVE the extracted numbers and trends directly into the article's paragraphs as plain prose.
- Example: "Flight prices to Cancun rose 18% between January and March 2026, peaking at $612 round-trip."
- Cite the source if it is visible on the chart.
- Add at least one new paragraph (or expand an existing one) per chart with its data woven in.
` : ""}
PUNCTUATION:
- NEVER use em-dashes (—) or en-dashes (–). Use commas, periods, semicolons, or "to" for ranges.

Rules:
- The first block should be a text paragraph (the intro), NOT a heading
- Don't repeat text, use all the original content
- Keep the author's voice and tone intact
- Headings should be concise and engaging (3-8 words)
- Space photo images roughly evenly, placing them at natural visual breakpoints
- If there are 0 photo images, just structure the text with paragraphs and headings`;

    const userContent: any[] = [
      {
        type: "text",
        text: `Here is the raw article text to format. There are ${imageCount} photo images available to place throughout${hasCharts ? `, plus ${chartImages.length} chart/data image(s) shown below (extract their numbers into prose, do NOT emit them as image blocks)` : ""}.

---
${rawText}
---

Use the format_article tool to return the structured result.`,
      },
    ];

    if (hasCharts) {
      for (const img of chartImages) {
        if (typeof img === "string" && img.startsWith("data:image/")) {
          userContent.push({ type: "image_url", image_url: { url: img } });
        }
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
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
                    description: "Ordered array of content blocks. Never include chart/data images as image blocks.",
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
                          description: "For text: paragraph text. For heading: heading text. For image: IMAGE_0, IMAGE_1, etc. (only for photo images, never charts).",
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

    // Em-dash sanitization
    const clean = (s: string) => (s || "").replace(/[—–]/g, ", ");
    // Fix markdown links with empty anchor text: [](url) -> [learn more](url)
    const fixEmptyAnchors = (s: string) =>
      (s || "").replace(/\[\s*\]\(([^)]+)\)/g, "[learn more]($1)");
    if (result.excerpt) result.excerpt = clean(result.excerpt);
    if (Array.isArray(result.blocks)) {
      result.blocks = result.blocks
        .map((b: any) => ({
          ...b,
          value: b.type === "image" ? b.value : fixEmptyAnchors(clean(b.value || "")),
          caption: b.caption ? clean(b.caption) : b.caption,
        }))
        // Drop empty/whitespace-only text/heading blocks (would render as visual gaps)
        .filter((b: any) => b.type === "image" || (b.value && b.value.trim().length > 0));
    }

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

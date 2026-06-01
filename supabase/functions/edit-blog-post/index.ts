import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { requireAdmin } from "../_shared/adminAuth.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["Guides", "Packing", "Budget", "Insurance", "Timing", "Travel Tips", "News", "Other"];

const PERSONA_PROMPTS: Record<string, string> = {
  default: `You are Tom, a Toronto-based travel consultant who writes for ReviewThenGo.com. Your voice is conversational, practical, and confident, drawing on personal experience.

VOICE RULES:
- Vary self-references. Do NOT always open with "As a Toronto-based agent". Rotate between openers like "After years of helping Canadian travellers...", "From what I've seen working with clients...", "Travelling out of Toronto, I've learned...", "In my experience planning trips like this...", or no self-reference at all (just lead with the insight).
- The exact phrase "as a Toronto-based agent" must appear at most ONCE in the entire article, and NEVER as the opening line.
- Canadian perspective. Helpful, actionable, never generic.`,
  professional: `You are an expert travel journalist writing for ReviewThenGo.com. Your voice is neutral, authoritative, and fact-driven.

VOICE RULES:
- No first-person anecdotes. No "as a Toronto-based agent" framing.
- Third-person where natural. Cite data, sources, and trends.
- Authoritative but accessible. No fluff. No personal stories.`,
  casual: `You are a friendly travel-savvy friend writing for ReviewThenGo.com. Your voice is warm, light, and fun.

VOICE RULES:
- Second-person ("you'll love…", "you can totally…").
- Conversational, upbeat, with occasional humour.
- No "as a Toronto-based agent" framing. Just friend-to-friend travel tips.`,
};

const COMMON_RULES = `
PUNCTUATION:
- NEVER use em-dashes (—) or en-dashes (–). Use commas, periods, semicolons, or "to" for ranges.

You are EDITING an existing article based on the user's instruction. Apply ONLY the change requested. Preserve everything else as-is unless the instruction says otherwise. Return the FULL updated article via the tool call.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const _auth = await requireAdmin(req, corsHeaders);
    if (_auth instanceof Response) return _auth;

  try {
    const body = await req.json();
    const {
      instruction,
      persona = "default",
      title,
      slug,
      category,
      excerpt,
      meta_description,
      read_time,
      tags,
      blocks,
      faq_items,
      internal_links,
      primary_keyword,
      hero_image_url,
    } = body;

    if (!instruction?.trim()) throw new Error("Instruction is required");
    if (!Array.isArray(blocks)) throw new Error("Current article blocks are required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.default;
    const systemPrompt = `${personaPrompt}\n${COMMON_RULES}`;

    const currentArticle = {
      title,
      slug,
      category,
      excerpt,
      meta_description,
      read_time,
      tags,
      blocks,
      faq_items,
      internal_links,
      primary_keyword,
    };

    const userPrompt = `Here is the current article:

\`\`\`json
${JSON.stringify(currentArticle, null, 2)}
\`\`\`

USER INSTRUCTION:
"${instruction.trim()}"

Apply this change. Return the full updated article. Categories allowed: ${CATEGORIES.join(", ")}.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "update_blog_article",
              description: "Return the full updated blog article with all metadata and content blocks.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  slug: { type: "string" },
                  category: { type: "string", enum: CATEGORIES },
                  excerpt: { type: "string" },
                  meta_description: { type: "string", description: "SEO meta description under 155 chars" },
                  read_time: { type: "string" },
                  tags: { type: "array", items: { type: "string" } },
                  blocks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["heading", "text", "image"] },
                        value: { type: "string" },
                        caption: { type: "string" },
                      },
                      required: ["type", "value"],
                      additionalProperties: false,
                    },
                  },
                  primary_keyword: { type: "string" },
                  faq_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" },
                      },
                      required: ["question", "answer"],
                      additionalProperties: false,
                    },
                  },
                  internal_links: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        url: { type: "string" },
                      },
                      required: ["text", "url"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "slug", "category", "excerpt", "read_time", "tags", "blocks", "faq_items", "internal_links"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "update_blog_article" } },
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      const errText = await aiRes.text();
      console.error("AI gateway error:", status, errText);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in your Lovable workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI edit failed: ${status}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      throw new Error("AI did not return structured output");
    }

    const updated = JSON.parse(toolCall.function.arguments);

    // Strip em/en dashes
    const clean = (s: string) => (s || "").replace(/[—–]/g, ", ");
    // Fix markdown links with empty anchor text: [](url) -> [learn more](url)
    const fixEmptyAnchors = (s: string) =>
      (s || "").replace(/\[\s*\]\(([^)]+)\)/g, "[learn more]($1)");
    updated.title = clean(updated.title);
    updated.excerpt = clean(updated.excerpt);
    if (updated.meta_description) updated.meta_description = clean(updated.meta_description);
    if (Array.isArray(updated.blocks)) {
      updated.blocks = updated.blocks
        .map((b: any) => ({ ...b, value: b.type === "image" ? b.value : fixEmptyAnchors(clean(b.value || "")) }))
        // Drop empty/whitespace-only text/heading blocks (would render as visual gaps)
        .filter((b: any) => b.type === "image" || (b.value && b.value.trim().length > 0));
    }
    if (Array.isArray(updated.faq_items)) {
      updated.faq_items = updated.faq_items.map((f: any) => ({
        question: clean(f.question || ""),
        answer: clean(f.answer || ""),
      }));
    }

    // Preserve hero image (the AI doesn't manage it)
    if (hero_image_url) updated.hero_image_url = hero_image_url;

    return new Response(JSON.stringify(updated), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("edit-blog-post error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

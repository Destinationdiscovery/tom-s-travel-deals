import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["Guides", "Packing", "Budget", "Insurance", "Timing", "Travel Tips", "News", "Other"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt?.trim()) throw new Error("Prompt is required");

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Step 1: Research with Perplexity
    console.log("Researching topic with Perplexity...");
    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a travel research assistant. Provide detailed, factual, up-to-date information with specific data points, statistics, dates, and practical details. Focus on information relevant to Canadian travellers. Include source context where possible.",
          },
          {
            role: "user",
            content: `Research this topic thoroughly for a travel blog article: ${prompt}`,
          },
        ],
      }),
    });

    if (!perplexityRes.ok) {
      const errText = await perplexityRes.text();
      console.error("Perplexity error:", perplexityRes.status, errText);
      throw new Error(`Research failed: ${perplexityRes.status}`);
    }

    const perplexityData = await perplexityRes.json();
    const research = perplexityData.choices?.[0]?.message?.content || "";
    const citations = perplexityData.citations || [];
    console.log("Research complete, citations:", citations.length);

    // Step 2: Generate article with Lovable AI (Gemini) using tool calling
    console.log("Generating article with Lovable AI...");
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are Tom, a Toronto-based travel consultant who writes blog articles for ReviewThenGo.com. Your writing style:
- Conversational, practical, and confident
- You speak from personal experience and professional knowledge
- NEVER use em-dashes (—). Use commas, periods, or semicolons instead.
- NEVER use en-dashes (–). Use "to" for ranges (e.g. "5 to 7 days").
- Write for a general audience but with a Canadian perspective
- Be helpful and actionable, not generic or fluffy
- Use short paragraphs. Break up long sections.
- Include practical tips, costs, and real advice where relevant

You must generate a complete blog article using the research provided. Structure it with clear headings and well-organized paragraphs.`,
          },
          {
            role: "user",
            content: `Write a complete blog article based on this topic and research.

TOPIC/PROMPT: ${prompt}

RESEARCH DATA:
${research}

${citations.length > 0 ? `\nSOURCES:\n${citations.map((c: string, i: number) => `[${i + 1}] ${c}`).join("\n")}` : ""}

Generate the full article with all metadata. Pick the most appropriate category from: ${CATEGORIES.join(", ")}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "publish_blog_article",
              description: "Publish a complete blog article with all metadata and content blocks",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Article title, compelling and SEO-friendly" },
                  slug: { type: "string", description: "URL slug, lowercase with hyphens, max 80 chars" },
                  category: { type: "string", enum: CATEGORIES, description: "Article category" },
                  excerpt: { type: "string", description: "2-3 sentence summary for the article card" },
                  read_time: { type: "string", description: "Estimated read time, e.g. '6 min read'" },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-8 SEO keywords/tags",
                  },
                  blocks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["heading", "text"] },
                        value: { type: "string" },
                      },
                      required: ["type", "value"],
                      additionalProperties: false,
                    },
                    description: "Article content as blocks. Use 'heading' for section titles and 'text' for paragraphs. Each text block should be 1-3 paragraphs.",
                  },
                },
                required: ["title", "slug", "category", "excerpt", "read_time", "tags", "blocks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "publish_blog_article" } },
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
      throw new Error(`AI generation failed: ${status}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      throw new Error("AI did not return structured output");
    }

    let article;
    try {
      article = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      throw new Error("Failed to parse AI response");
    }

    // Post-process: remove any em-dashes that slipped through
    const cleanEmDashes = (s: string) => s.replace(/[—–]/g, ", ");
    article.title = cleanEmDashes(article.title);
    article.excerpt = cleanEmDashes(article.excerpt);
    article.blocks = article.blocks.map((b: any) => ({
      ...b,
      value: cleanEmDashes(b.value),
    }));

    console.log("Article generated:", article.title);

    return new Response(JSON.stringify(article), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-blog-post error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

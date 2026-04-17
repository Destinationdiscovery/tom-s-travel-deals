import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["Guides", "Packing", "Budget", "Insurance", "Timing", "Travel Tips", "News", "Other"];

interface PexelsPhoto {
  url: string;
  photographer: string;
  photographer_url: string;
  src: { large2x: string; large: string };
}

async function searchStockPhoto(
  query: string,
  apiKey: string,
  size: "large2x" | "large" = "large"
): Promise<{ url: string; photographer: string; photographerUrl: string } | null> {
  try {
    console.log("Searching Pexels for:", query.slice(0, 60));
    const params = new URLSearchParams({
      query,
      per_page: "3",
      orientation: "landscape",
    });
    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: apiKey },
    });
    if (!res.ok) {
      console.error("Pexels search failed:", res.status);
      return null;
    }
    const data = await res.json();
    const photo: PexelsPhoto | undefined = data.photos?.[0];
    if (!photo) return null;
    return {
      url: photo.src[size],
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
    };
  } catch (e) {
    console.error("Pexels error:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, affiliateUrl, affiliateBrand, affiliateAnchor } = await req.json();
    if (!prompt?.trim()) throw new Error("Prompt is required");

    const hasAffiliate = !!(affiliateUrl && affiliateBrand);

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    if (!PEXELS_API_KEY) throw new Error("PEXELS_API_KEY is not configured");

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

SEO OPTIMIZATION RULES (follow strictly):
- Front-load the primary keyword in the title (first 60 chars), the first paragraph, and at least 2 H2 headings
- Include the primary keyword in the URL slug
- Include 3-5 LSI (latent semantic indexing) related keywords naturally throughout the article
- Distribute secondary keywords naturally across H2 headings, section intros, and bullet lists
- Write the excerpt as a click-worthy meta description: under 155 characters, includes primary keyword, compelling action language
- Structure at least 2 headings as questions (for featured snippet targeting, e.g. "What Is the Best Time to Visit Cancun?")
- Use the primary keyword in the first 100 words of the article
- Include a clear call-to-action in the final paragraph

CONTENT DEPTH & EEAT RULES:
- Target 2,500+ words minimum. Write comprehensive, in-depth content with detailed sections.
- Reference fresh 2026 data, statistics, and dates throughout for EEAT credibility
- Include a FAQ section at the end with 3-5 questions and direct answers related to the topic
- Add internal links to related ReviewThenGo tools where relevant: /reviews (hotel reviews), /best-time (best time to visit), /itinerary (itinerary builder), /flights (flight deals), /gear (packing toolkit), /currency (currency tracker), /safety (safety scores), /travel-intel (travel advisories)

You must generate a complete blog article using the research provided. Structure it with clear headings and well-organized paragraphs.`,
          },
          {
            role: "user",
            content: `Write a complete blog article based on this topic and research.

TOPIC/PROMPT: ${prompt}

RESEARCH DATA:
${research}

${citations.length > 0 ? `\nSOURCES:\n${citations.map((c: string, i: number) => `[${i + 1}] ${c}`).join("\n")}` : ""}

Generate the full article with all metadata. Pick the most appropriate category from: ${CATEGORIES.join(", ")}

IMPORTANT: For the image_search_queries field, provide short, descriptive search terms that would find great stock photos on Pexels. For example "tropical beach resort", "packing suitcase travel", "airport departure lounge". Provide one for the hero and one per section heading.`,
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
                  meta_description: { type: "string", description: "SEO meta description under 155 chars with primary keyword and compelling action language" },
                  read_time: { type: "string", description: "Estimated read time, e.g. '6 min read'" },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-8 SEO keywords/tags",
                  },
                  hero_image_query: {
                    type: "string",
                    description: "Short search query for finding a hero stock photo, e.g. 'tropical beach sunset resort'",
                  },
                  blocks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["heading", "text"] },
                        value: { type: "string" },
                        image_query: { type: "string", description: "Optional: stock photo search query for this section" },
                      },
                      required: ["type", "value"],
                      additionalProperties: false,
                    },
                    description: "Article content as blocks. Use 'heading' for section titles and 'text' for paragraphs. Add image_query on heading blocks where a photo would enhance the section.",
                  },
                  primary_keyword: { type: "string", description: "The single primary SEO keyword this article targets" },
                  faq_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string", description: "FAQ question" },
                        answer: { type: "string", description: "Direct, concise answer (2-4 sentences)" },
                      },
                      required: ["question", "answer"],
                      additionalProperties: false,
                    },
                    description: "3-5 FAQ pairs for FAQPage schema",
                  },
                  internal_links: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string", description: "Anchor text for the link" },
                        url: { type: "string", description: "Internal URL path, e.g. /reviews or /best-time" },
                      },
                      required: ["text", "url"],
                      additionalProperties: false,
                    },
                    description: "Suggested internal links to embed in the article",
                  },
                },
                required: ["title", "slug", "category", "excerpt", "read_time", "tags", "hero_image_query", "blocks", "primary_keyword", "faq_items", "internal_links"],
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

    // Clean FAQ answers for em-dashes
    if (Array.isArray(article.faq_items)) {
      article.faq_items = article.faq_items.map((faq: any) => ({
        ...faq,
        question: cleanEmDashes(faq.question || ""),
        answer: cleanEmDashes(faq.answer || ""),
      }));
    }

    console.log("Article generated:", article.title);
    console.log(`FAQ items: ${article.faq_items?.length || 0}, Internal links: ${article.internal_links?.length || 0}, Primary keyword: ${article.primary_keyword || "none"}`);

    // Step 3: Fetch stock photos from Pexels
    console.log("Fetching stock photos from Pexels...");

    // Hero image
    const heroPhoto = await searchStockPhoto(
      article.hero_image_query || article.title,
      PEXELS_API_KEY,
      "large2x"
    );
    article.hero_image_url = heroPhoto?.url || null;
    article.hero_image_photographer = heroPhoto?.photographer || null;
    article.hero_image_photographer_url = heroPhoto?.photographerUrl || null;
    console.log("Hero image found:", !!heroPhoto);

    // Inline images: find headings with image_query
    const headingsWithQueries = article.blocks
      .filter((b: any) => b.type === "heading" && b.image_query)
      .slice(0, 3);

    const inlinePhotos: Array<{ url: string; photographer: string; photographerUrl: string }> = [];
    const usedQueries = new Set<string>();

    for (const heading of headingsWithQueries) {
      // Vary the query slightly to avoid duplicate photos
      let query = heading.image_query;
      if (usedQueries.has(query)) query += " travel";
      usedQueries.add(query);

      const photo = await searchStockPhoto(query, PEXELS_API_KEY, "large");
      if (photo) inlinePhotos.push(photo);
    }
    console.log("Inline photos found:", inlinePhotos.length);

    // Inject image blocks after matching headings
    if (inlinePhotos.length > 0) {
      const finalBlocks: any[] = [];
      let photoIdx = 0;
      let insertAfterNextText = false;

      for (const block of article.blocks) {
        finalBlocks.push(block);
        if (
          block.type === "heading" &&
          block.image_query &&
          photoIdx < inlinePhotos.length
        ) {
          insertAfterNextText = true;
        } else if (insertAfterNextText && block.type === "text") {
          const photo = inlinePhotos[photoIdx];
          finalBlocks.push({
            type: "image",
            value: photo.url,
            caption: "",
            photographer: photo.photographer,
            photographerUrl: photo.photographerUrl,
          });
          photoIdx++;
          insertAfterNextText = false;
        }
      }
      article.blocks = finalBlocks;
    }

    // Clean up image_query fields from blocks before returning
    article.blocks = article.blocks.map((b: any) => {
      const { image_query, ...rest } = b;
      return rest;
    });
    delete article.hero_image_query;

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

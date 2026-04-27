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

// ─── Topic detection + internal tool research ──────────────────────────────

type TopicType =
  | "hotel_review"
  | "gear_packing"
  | "best_time"
  | "safety"
  | "entry_requirements"
  | "currency"
  | "itinerary"
  | "destination_general"
  | "other";

interface ToolMeta { name: string; path: string; label: string; benefit: string }

const TOOL_MAP: Record<TopicType, ToolMeta | null> = {
  hotel_review:        { name: "generate-review",    path: "/destinations",  label: "Hotel Review tool",       benefit: "see real ratings and a personalized verdict" },
  gear_packing:        { name: "travel-gear-intel",  path: "/gear",          label: "Trip Packing Toolkit",    benefit: "build a weather-aware packing list" },
  best_time:           { name: "best-time-intel",    path: "/best-time",     label: "Best Time to Visit tool", benefit: "see month-by-month weather, crowds, and pricing" },
  safety:              { name: "safety-intel",       path: "/safety",        label: "Safety Scores tool",      benefit: "get the latest safety score and scam alerts" },
  entry_requirements:  { name: "travel-intel",       path: "/travel-intel",  label: "Know Before You Go tool", benefit: "check current visa, entry, and health requirements" },
  currency:            { name: "currency-tracker",   path: "/currency",      label: "Currency Tracker",        benefit: "see live rates and the trend" },
  itinerary:           { name: "generate-itinerary", path: "/itinerary",     label: "Itinerary Builder",       benefit: "generate a day-by-day plan" },
  destination_general: null,
  other:               null,
};

interface TopicResult {
  topicType: TopicType;
  primaryEntity: string;
  secondaryEntity?: string;
  coreQuestion: string;
  primaryTool: ToolMeta | null;
}

async function detectTopic(prompt: string, lovableKey: string): Promise<TopicResult> {
  const fallback: TopicResult = {
    topicType: "other",
    primaryEntity: prompt.slice(0, 80),
    coreQuestion: prompt,
    primaryTool: null,
  };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Classify a travel blog topic into one tool category. Return strictly via the function call." },
          { role: "user", content: `Topic: ${prompt}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_topic",
            description: "Classify the article topic and identify the core question + entities.",
            parameters: {
              type: "object",
              properties: {
                topicType: {
                  type: "string",
                  enum: ["hotel_review","gear_packing","best_time","safety","entry_requirements","currency","itinerary","destination_general","other"],
                },
                primaryEntity:   { type: "string", description: "Main subject: hotel name, destination, or product category" },
                secondaryEntity: { type: "string", description: "Optional: trip type for gear, currency pair, etc." },
                coreQuestion:    { type: "string", description: "The single question this article answers, phrased naturally" },
              },
              required: ["topicType","primaryEntity","coreQuestion"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_topic" } },
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return fallback;
    const data = await res.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return fallback;
    const parsed = JSON.parse(args);
    const topicType: TopicType = parsed.topicType || "other";
    return {
      topicType,
      primaryEntity: parsed.primaryEntity || fallback.primaryEntity,
      secondaryEntity: parsed.secondaryEntity || undefined,
      coreQuestion: parsed.coreQuestion || prompt,
      primaryTool: TOOL_MAP[topicType] || null,
    };
  } catch (e) {
    console.warn("Topic detection failed, using fallback:", (e as Error).message);
    return fallback;
  }
}

async function callInternalTool(name: string, body: Record<string, unknown>, timeoutMs = 25000): Promise<any | null> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    console.warn("Missing SUPABASE_URL/SERVICE_ROLE_KEY for internal tool call");
    return null;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${url}/functions/v1/${name}`, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn(`Internal tool ${name} returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    console.warn(`Internal tool ${name} failed:`, (e as Error).message);
    return null;
  }
}

async function runToolResearch(topic: TopicResult): Promise<{ toolName: string; data: any } | null> {
  const tool = topic.primaryTool;
  if (!tool) return null;
  const entity = topic.primaryEntity;
  let payload: Record<string, unknown> = {};
  switch (topic.topicType) {
    case "hotel_review":         payload = { propertyName: entity }; break;
    case "gear_packing":         payload = { destination: entity, vacationType: topic.secondaryEntity || "general" }; break;
    case "best_time":            payload = { destination: entity }; break;
    case "safety":               payload = { destination: entity }; break;
    case "entry_requirements":   payload = { type: "requirements", destination: entity, citizenship: "Canadian" }; break;
    case "currency":             payload = { from: "CAD", to: topic.secondaryEntity || "USD", destination: entity }; break;
    case "itinerary":            payload = { destination: entity, days: 7 }; break;
    default: return null;
  }
  const data = await callInternalTool(tool.name, payload);
  if (!data) return null;
  return { toolName: tool.name, data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { prompt, affiliateUrl, affiliateBrand, affiliateAnchor, persona = "default" } = body;
    if (!prompt?.trim()) throw new Error("Prompt is required");

    // Normalize affiliates: prefer new `affiliates` array, fall back to legacy single-field payload.
    type Affiliate = { url: string; brand: string; anchor: string };
    let affiliates: Affiliate[] = Array.isArray(body.affiliates)
      ? body.affiliates
          .map((a: any) => ({
            url: (a?.url || "").trim(),
            brand: (a?.brand || "").trim() || "this product",
            anchor: (a?.anchor || "").trim() || (a?.brand || "").trim() || "this product",
          }))
          .filter((a: Affiliate) => a.url.length > 0)
          .slice(0, 3)
      : [];

    if (affiliates.length === 0 && affiliateUrl && affiliateUrl.trim()) {
      affiliates = [{
        url: affiliateUrl.trim(),
        brand: (affiliateBrand && affiliateBrand.trim()) || "this product",
        anchor: (affiliateAnchor && affiliateAnchor.trim()) || (affiliateBrand && affiliateBrand.trim()) || "this product",
      }];
    }

    const hasAffiliate = affiliates.length > 0;
    console.log("Affiliate count:", affiliates.length, affiliates.map(a => a.brand));

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    if (!PEXELS_API_KEY) throw new Error("PEXELS_API_KEY is not configured");

    // Step 1a: Detect topic + research in parallel (topic detection drives internal-tool research)
    console.log("Detecting topic and researching in parallel...");
    const topicPromise = detectTopic(prompt, LOVABLE_API_KEY);
    const perplexityPromise = fetch("https://api.perplexity.ai/chat/completions", {
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

    const [topic, perplexityRes] = await Promise.all([topicPromise, perplexityPromise]);
    console.log("Topic detected:", topic.topicType, "| entity:", topic.primaryEntity, "| tool:", topic.primaryTool?.name || "none");

    if (!perplexityRes.ok) {
      const errText = await perplexityRes.text();
      console.error("Perplexity error:", perplexityRes.status, errText);
      throw new Error(`Research failed: ${perplexityRes.status}`);
    }

    const perplexityData = await perplexityRes.json();
    const research = perplexityData.choices?.[0]?.message?.content || "";
    const citations = perplexityData.citations || [];
    console.log("Research complete, citations:", citations.length);

    // Step 1b: Tool-based research (uses our own AI tools as authoritative source when applicable)
    const toolResearch = await runToolResearch(topic);
    if (toolResearch) {
      console.log("Tool research succeeded:", toolResearch.toolName);
    } else if (topic.primaryTool) {
      console.log("Tool research unavailable, falling back to web research only");
    }

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
            content: (() => {
              const personaIntros: Record<string, string> = {
                default: `You are Tom, a Toronto-based travel consultant who writes blog articles for ReviewThenGo.com. Your writing style:
- Conversational, practical, and confident
- You speak from personal experience and professional knowledge
- Write for a general audience but with a Canadian perspective

OPENER VARIATION (CRITICAL):
- Do NOT always open with "As a Toronto-based agent". Rotate openers article-to-article.
- Examples: "After years of helping Canadian travellers...", "From what I've seen working with clients...", "Travelling out of Toronto, I've learned...", "In my experience planning trips like this...", or no self-reference at all (lead with the insight).
- The exact phrase "as a Toronto-based agent" must appear at most ONCE in the entire article, and NEVER as the opening line.`,
                professional: `You are an expert travel journalist writing for ReviewThenGo.com. Your style is:
- Neutral, authoritative, fact-driven, third-person where natural
- No first-person anecdotes. No "as a Toronto-based agent" framing
- Cite data, sources, and trends. Authoritative but accessible.`,
                casual: `You are a friendly travel-savvy friend writing for ReviewThenGo.com. Your style is:
- Warm, light, fun, second-person ("you'll love…", "you can totally…")
- Conversational, upbeat, with occasional humour
- No "as a Toronto-based agent" framing. Just friend-to-friend tips.`,
              };
              const intro = personaIntros[persona] || personaIntros.default;
              return `${intro}

UNIVERSAL RULES:
- NEVER use em-dashes (—). Use commas, periods, or semicolons instead.
- NEVER use en-dashes (–). Use "to" for ranges (e.g. "5 to 7 days").
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

AEO STRUCTURE (NON-NEGOTIABLE, applied to every article):
1. The FIRST content block must be a "heading" phrased as the user's core question (must end with "?"). Use the CORE_QUESTION provided in the user message verbatim or near-verbatim.
2. The blocks immediately after that heading must be plain "text" blocks (no bullet headings, no sub-headings) totalling roughly 350 to 450 words that fully answer the core question in plain prose. This block is what AI search engines will quote, so it must be self-contained and direct, not a teaser.
3. After that answer block, insert exactly ONE "text" block that is a single short paragraph in this exact pattern (substituting the values from the user message):
   "Want a personalized answer? Use ReviewThenGo's [TOOL_LABEL](TOOL_PATH) to TOOL_BENEFIT in seconds."
   Use markdown link syntax. This CTA must appear EXACTLY ONCE in the entire article.
4. Then continue the article: deeper sections, comparisons, practical tips, FAQ, and a closing CTA paragraph.
5. If no tool is provided (TOOL_LABEL is "none"), skip step 3 entirely and continue with deeper sections directly.

DATA SOURCING RULES:
- When TOOL RESEARCH is provided in the user message, treat it as the AUTHORITATIVE primary source. Quote specific numbers (ratings, scores, prices, temperatures, months) directly from it.
- Use SUPPLEMENTARY WEB RESEARCH only to add color, context, or recent news. Never let it contradict TOOL RESEARCH.
- If TOOL RESEARCH includes specific ratings, season tables, packing items, scam alerts, or visa rules, weave them into the article body, not just the AEO answer.

You must generate a complete blog article using the research provided. Structure it with clear headings and well-organized paragraphs.`;
            })(),
          },
          {
            role: "user",
            content: `Write a complete blog article based on this topic and research.

TOPIC/PROMPT: ${prompt}

CORE_QUESTION: ${topic.coreQuestion}
TOOL_LABEL: ${topic.primaryTool?.label || "none"}
TOOL_PATH: ${topic.primaryTool?.path || ""}
TOOL_BENEFIT: ${topic.primaryTool?.benefit || ""}

${toolResearch ? `============================================
TOOL RESEARCH (AUTHORITATIVE PRIMARY SOURCE)
Source: ReviewThenGo internal "${toolResearch.toolName}" tool
============================================
${JSON.stringify(toolResearch.data, null, 2).slice(0, 8000)}

Use these facts directly in the AEO answer block and throughout the article. Quote specific numbers (ratings, scores, prices, temperatures, months, scam names, etc.) verbatim where useful.
============================================
` : ""}
SUPPLEMENTARY WEB RESEARCH (use only to add color, never to contradict TOOL RESEARCH if present):
${research}

${citations.length > 0 ? `\nSOURCES:\n${citations.map((c: string, i: number) => `[${i + 1}] ${c}`).join("\n")}` : ""}

${hasAffiliate ? `
============================================
AFFILIATE LINK INTEGRATION (NON-NEGOTIABLE)
============================================
You have ${affiliates.length} affiliate ${affiliates.length === 1 ? "product" : "products"} to weave into the article:
${affiliates.map((a, i) => `${i + 1}) ${a.brand} — URL: ${a.url} — suggested anchor phrase: "${a.anchor}"`).join("\n")}

${affiliates.length > 1 ? `Treat these as comparison or companion product recommendations where it fits the article naturally (e.g. "the EPICKA adapter is great, but for heavier draw I prefer the Anker model").` : ""}

For EACH product above, include 2 to 3 markdown hyperlinks pointing to that product's exact URL. Format:
[varied anchor text](exact_product_url)

Example sentences (study these patterns and vary every anchor):
${affiliates.map(a => `- "I've tested [${a.anchor}](${a.url}) on multiple trips and it never disappoints."`).join("\n")}
- "You can [check current pricing](URL) before your trip."
- "For most Canadian travellers, [this option](URL) hits the sweet spot."

REQUIREMENTS:
1. Place links inside the "value" field of "text" content blocks (NOT in headings, intro line, FAQ, excerpt, or meta_description).
2. Vary every anchor text. Mix branded ("${affiliates[0].brand}") and generic ("this device", "current pricing", "the latest model") anchors.
3. Spread each product's links across at least 2 different sections.
4. Each product URL must appear EXACTLY as given above. Do not modify, shorten, or add tracking parameters.
5. Keep the tone editorial and helpful. Never use "Click here", "Buy now", or "Best deal".
6. The article will be rejected if any product has zero links.
============================================
` : ""}
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

    // Defensive slug normalization — never trust the AI's slug as-is.
    // Treat it as a hint and force it through a deterministic slugifier so a
    // stray title-as-slug (with spaces, capitals, colons, ampersands, etc.)
    // can never reach the database again.
    const slugify = (input: string): string => {
      const base = String(input || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "") // strip accents
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80)
        .replace(/-+$/g, "");
      return base || "untitled-post";
    };
    article.slug = slugify(article.slug || article.title || "");

    // Post-process: remove any em-dashes that slipped through
    const cleanEmDashes = (s: string) => s.replace(/[—–]/g, ", ");
    // Fix markdown links with empty anchor text: [](url) -> [learn more](url)
    const fixEmptyAnchors = (s: string) =>
      (s || "").replace(/\[\s*\]\(([^)]+)\)/g, "[learn more]($1)");
    article.title = cleanEmDashes(article.title);
    article.excerpt = cleanEmDashes(article.excerpt);
    article.blocks = article.blocks
      .map((b: any) => ({
        ...b,
        value: fixEmptyAnchors(cleanEmDashes(b.value)),
      }))
      // Drop empty/whitespace-only blocks so they don't render as visual gaps
      .filter((b: any) => b.value && b.value.trim().length > 0);

    // Clean FAQ answers for em-dashes
    if (Array.isArray(article.faq_items)) {
      article.faq_items = article.faq_items.map((faq: any) => ({
        ...faq,
        question: cleanEmDashes(faq.question || ""),
        answer: cleanEmDashes(faq.answer || ""),
      }));
    }

    // AEO CTA dedupe: keep only the first occurrence of the in-content tool CTA pattern
    const ctaRegex = /Use ReviewThenGo's \[[^\]]+\]\([^)]+\)\s+to\s+[^.]+?in seconds\./i;
    let ctaSeen = false;
    article.blocks = article.blocks.map((b: any) => {
      if (b.type !== "text" || typeof b.value !== "string") return b;
      const matches = b.value.match(new RegExp(ctaRegex.source, "gi"));
      if (!matches) return b;
      let value = b.value;
      for (const m of matches) {
        if (!ctaSeen) { ctaSeen = true; continue; }
        value = value.replace(m, "").replace(/\s{2,}/g, " ").trim();
      }
      return { ...b, value };
    }).filter((b: any) => !(b.type === "text" && (!b.value || !b.value.trim())));

    // AEO shape soft-validation (warn only, never fail)
    const firstBlock = article.blocks[0];
    if (!firstBlock || firstBlock.type !== "heading" || !/\?\s*$/.test(firstBlock.value || "")) {
      console.warn("AEO warning: first block is not a question heading");
    }
    if (topic.primaryTool && !ctaSeen) {
      console.warn("AEO warning: in-content tool CTA was not present in generated article");
    }

    // Affiliate fallback: for each affiliate product, ensure at least one markdown link exists.
    if (hasAffiliate) {
      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const usedBlockIndexes = new Set<number>();

      for (const aff of affiliates) {
        const linkRegex = new RegExp(`\\]\\(${escapeRegex(aff.url)}\\)`);
        const hasAnyLink = article.blocks.some(
          (b: any) => b.type === "text" && linkRegex.test(b.value || "")
        );
        if (hasAnyLink) continue;

        console.warn(`AI produced zero links for ${aff.brand}. Injecting fallback.`);
        // Pick the longest text block we haven't already injected into
        const candidates = article.blocks
          .map((b: any, i: number) => ({ b, i }))
          .filter((x: any) =>
            x.b.type === "text" &&
            (x.b.value || "").length > 200 &&
            !usedBlockIndexes.has(x.i)
          )
          .sort((a: any, b: any) => (b.b.value.length - a.b.value.length));

        const target = candidates[0];
        if (target) {
          const sentences = target.b.value.split(/(?<=[.!?])\s+/);
          const insertAt = Math.min(1, sentences.length - 1);
          const linkSentence = `You can [${aff.anchor}](${aff.url}) to compare options before booking.`;
          sentences.splice(insertAt + 1, 0, linkSentence);
          article.blocks[target.i].value = sentences.join(" ");
          usedBlockIndexes.add(target.i);
          console.log(`Fallback link for ${aff.brand} injected at block`, target.i);
        }
      }
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

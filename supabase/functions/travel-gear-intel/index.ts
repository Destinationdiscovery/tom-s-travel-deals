import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ─── Amazon Marketplace Config (for affiliate search URLs) ─── */
const MARKETPLACE_CONFIG: Record<string, { domain: string }> = {
  CA: { domain: "www.amazon.ca" },
  US: { domain: "www.amazon.com" },
  GB: { domain: "www.amazon.co.uk" },
};

/* ─── Vacation Type Category Lists ─── */
const VACATION_CATEGORIES: Record<string, string[]> = {
  beach: [
    "Carry-on suitcase", "Packing cubes", "Beach tote bag", "Reef-safe sunscreen",
    "Polarized sunglasses", "Wide-brim sun hat", "Quick-dry swim trunks/swimsuit",
    "Waterproof phone pouch", "Travel-size toiletry bottles", "Portable Bluetooth speaker",
    "Mosquito repellent", "After-sun aloe vera gel", "Neck pillow for flights",
    "Noise-cancelling earbuds", "Water shoes", "Dry bag", "Portable fan/misting fan",
    "Luggage scale", "Travel adapter/charger", "Reusable water bottle", "Yeti insulated tumbler",
  ],
  cruise: [
    "Carry-on suitcase", "Packing cubes", "Magnetic hooks for cabin walls",
    "Over-the-door shoe organizer", "Lanyard for cruise card", "Waterproof phone pouch",
    "Motion sickness bands/medication", "Reef-safe sunscreen", "Formal evening outfit accessories",
    "Portable power strip", "Insulated travel tumbler", "Collapsible tote/day bag",
    "Quick-dry towel", "Noise-cancelling earbuds", "Waterproof sandals", "Luggage tags",
    "Travel toiletry bag", "Binoculars", "Floating waterproof speaker", "Sunglasses with strap",
  ],
  backpacking: [
    "Hiking backpack (40-65L)", "Compression packing cubes", "Lightweight rain jacket",
    "Hiking boots/shoes", "Moisture-wicking base layers", "Headlamp",
    "Portable water filter", "First aid kit", "Trekking poles", "Quick-dry travel towel",
    "Dry bags", "Portable power bank", "Multi-tool/knife", "Insect repellent",
    "Sleeping bag liner", "Merino wool socks", "Sunscreen stick", "Carabiner clips",
    "Collapsible water bottle", "Travel clothesline",
  ],
  ski: [
    "Ski/snowboard bag", "Thermal base layers", "Ski socks (merino wool)",
    "Neck gaiter/balaclava", "Hand/toe warmers", "Ski goggles", "Helmet",
    "Waterproof ski gloves", "Lip balm with SPF", "Sunscreen (high altitude)",
    "Boot dryer", "Packing cubes", "Thermos/insulated bottle", "Action camera mount",
    "Ski lock", "Compression socks for travel", "Portable charger",
    "Moisture-wicking mid-layer", "Anti-fog spray for goggles", "Travel backpack/day pack",
  ],
  city: [
    "Anti-theft backpack/day bag", "Comfortable walking shoes", "Portable charger/power bank",
    "Travel adapter", "Packing cubes", "Packable rain jacket", "Noise-cancelling headphones",
    "Cross-body bag", "Travel wallet/RFID blocker", "Compact umbrella",
    "Reusable water bottle", "Compression socks for flights", "Portable luggage scale",
    "Travel-size stain remover", "Collapsible tote bag", "Eye mask and ear plugs",
    "Portable steamer", "Phone mount/tripod", "Guidebook or travel journal", "Snack containers",
  ],
  camping: [
    "Tent", "Sleeping bag", "Sleeping pad", "Camp stove", "Headlamp",
    "Cooler/insulated bag", "Camp chairs", "Water filter/purifier", "Fire starter kit",
    "First aid kit", "Insect repellent", "Dry bags", "Multi-tool",
    "Solar-powered charger", "Camping hammock", "Cookware set",
    "Bear canister/food storage", "Camp lantern", "Tarp/ground sheet", "Biodegradable soap",
  ],
  roadtrip: [
    "Car phone mount", "Portable cooler", "Car charger with USB ports", "Neck pillow",
    "Collapsible trash can for car", "First aid kit", "Portable jump starter",
    "Tire pressure gauge", "Sunshade for windshield", "Travel mug/tumbler",
    "Seat organizer", "Portable Bluetooth speaker", "Snack containers",
    "Paper towels/cleaning wipes", "Flashlight", "Blanket/throw", "Luggage organizer",
    "Dash cam", "Roadside emergency kit", "Portable power bank",
  ],
  business: [
    "Carry-on spinner suitcase", "Laptop bag/briefcase", "Packing cubes",
    "Wrinkle-release spray", "Portable steamer", "Noise-cancelling headphones",
    "Travel adapter with USB-C", "Portable charger", "Compression socks",
    "Eye mask", "Toiletry bag", "Garment folder", "Portable WiFi hotspot",
    "Cable organizer", "Travel umbrella", "Shoe bags", "Neck pillow",
    "Leather passport holder", "Business card holder", "Luggage scale",
  ],
};

/* ─── Vacation Type Detection ─── */
function detectVacationType(query: string): string {
  const q = query.toLowerCase();
  const keywords: Record<string, string[]> = {
    beach: ["beach", "all-inclusive", "all inclusive", "resort", "tropical", "caribbean", "mexico", "cancun", "punta cana", "bahamas", "jamaica", "aruba", "curacao", "hawaii", "bali", "thailand", "costa rica", "dominican"],
    cruise: ["cruise", "cruising", "carnival", "royal caribbean", "norwegian", "msc", "disney cruise", "ship"],
    backpacking: ["backpack", "hiking", "trek", "hostel", "southeast asia", "trail", "adventure", "patagonia", "nepal"],
    ski: ["ski", "snowboard", "winter sport", "slopes", "whistler", "aspen", "alps", "banff ski", "powder"],
    city: ["city", "urban", "europe", "paris", "london", "tokyo", "new york", "nyc", "rome", "barcelona", "amsterdam", "berlin", "sightseeing", "museum"],
    camping: ["camp", "camping", "rv", "glamping", "national park", "wilderness", "outdoor"],
    roadtrip: ["road trip", "roadtrip", "driving", "drive", "cross country", "route 66"],
    business: ["business", "conference", "work trip", "corporate", "meeting"],
  };

  for (const [type, words] of Object.entries(keywords)) {
    if (words.some((w) => q.includes(w))) return type;
  }
  return "beach";
}

const VALID_TYPES = ["must-haves", "review"] as const;
type IntelType = (typeof VALID_TYPES)[number];

const PROMPTS: Record<string, (query: string, categories?: string[]) => string> = {
  "must-haves": (query, categories) =>
    `You are a travel packing expert. A traveler is planning: "${query}".

Return a clean generic packing checklist based on the categories below. Do NOT recommend specific brands or product models. Use only the generic item name from the list.

Item categories to include (use each as the item name verbatim, or a very light generic rewrite):
${(categories || []).map((c, i) => `${i + 1}. ${c}`).join("\n")}

IMPORTANT RULES:
- Item "name" must be GENERIC only (e.g. "Polarized sunglasses", "Hard shell suitcase", "Beach tote bag"). No brand names, no model numbers.
- NEVER include non-purchasable items like passports, travel insurance, cash, visas, documents, or tickets.
- Assign each item to one of: Packing, Clothing, Beach, Tech, Health, Safety, Comfort, Accessories, Toiletries.
- Write a "narrative" field: a friendly 2 to 3 paragraph write-up referencing the destination, season, and trip type inferred from the query, walking through the most important essentials in flowing sentences. Do NOT use em-dashes or en-dashes. Use periods, commas, hyphens, or "to" instead. No bullet points. Conversational and useful.

Return valid JSON only (no markdown, no code blocks):

{
  "narrative": "For your [trip context] you'll want...",
  "items": [
    {
      "name": "Generic item name",
      "category": "Packing"
    }
  ]
}`,



  review: (query) =>
    `You are a travel gear reviewer. Research "${query}" thoroughly using Amazon reviews, expert reviews, YouTube reviews, and travel blogs.

For the product, include an "imageUrl" field with a direct URL to a product image found online (official brand site, Amazon CDN, or retailer). Use a real, publicly accessible image URL.

Return your response as valid JSON only (no markdown, no code blocks):

{
  "productName": "Full Product Name",
  "brand": "Brand Name",
  "priceRange": "$XX - $XX",
  "overallRating": 4.2,
  "imageUrl": "https://example.com/product-image.jpg",
  "ratings": {
    "Durability": 4.5,
    "Value": 3.8,
    "Portability": 4.0,
    "Comfort": 4.3,
    "Design": 4.1
  },
  "summary": "A 2-3 sentence summary of the product based on real reviews.",
  "reviewParagraphs": [
    "Paragraph 1 about build quality and first impressions synthesized from real reviews...",
    "Paragraph 2 about practical use and performance...",
    "Paragraph 3 about value proposition and comparisons...",
    "Paragraph 4 about long-term durability and reliability..."
  ],
  "pros": ["Pro 1", "Pro 2", "Pro 3", "Pro 4", "Pro 5"],
  "cons": ["Con 1", "Con 2", "Con 3"],
  "bestFor": ["Frequent flyers", "Weekend trips", "Budget travelers"]
}

All ratings must be between 1.0 and 5.0. Be honest and balanced. Synthesize from real buyer feedback.`,
};

/* ─── Normalize helper for fuzzy keyword matching ─── */
const normalize = (s: string) => s.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();

/* ─── Image Lookup Helper ─── */
async function attachProductImages(
  supabase: any,
  items: Record<string, unknown>[],
): Promise<void> {
  try {
    const { data: imageRows } = await supabase
      .from("gear_product_images")
      .select("product_keyword, image_url");

    if (!imageRows || imageRows.length === 0) return;

    for (const item of items) {
      const itemName = normalize((item.name as string) || "");
      const match = (imageRows as any[]).find((row: any) =>
        itemName.includes(normalize(row.product_keyword))
      );
      if (match) {
        item.imageUrl = match.image_url;
      }
    }
  } catch (e) {
    console.error("Image lookup failed (non-blocking):", e);
  }
}

async function attachSingleProductImage(
  supabase: any,
  resultData: Record<string, unknown>,
): Promise<void> {
  try {
    const { data: imageRows } = await supabase
      .from("gear_product_images")
      .select("product_keyword, image_url");

    if (!imageRows || imageRows.length === 0) return;

    const productName = normalize((resultData.productName as string) || "");
    const match = (imageRows as any[]).find((row: any) =>
      productName.includes(normalize(row.product_keyword))
    );
    if (match) {
      resultData.imageUrl = match.image_url;
    }
  } catch (e) {
    console.error("Image lookup failed (non-blocking):", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, type, country } = await req.json();

    if (!type || !VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be must-haves or review." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!query || typeof query !== "string" || query.trim().length < 2 || query.trim().length > 200) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid query (2-200 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const trimQuery = query.trim().toLowerCase();
    const userCountry = (country || "US").toUpperCase();
    const cacheKey = `${type}:${trimQuery}`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache (7-day TTL)
    const { data: cached } = await supabase
      .from("gear_intel_cache")
      .select("*")
      .eq("cache_key", cacheKey)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    // Parse Amazon tags for affiliate URLs
    const DEFAULT_TAGS: Record<string, string> = { CA: "gen80s01-20", US: "destinati0a78-20", GB: "uktripreviews-21" };
    let amazonTags: Record<string, string> = {};
    try {
      let tagsStr = Deno.env.get("AMAZON_ASSOCIATE_TAGS");
      if (tagsStr) {
        tagsStr = tagsStr.replace(/^\uFEFF/, "").trim().replace(/^["']|["']$/g, "");
        amazonTags = JSON.parse(tagsStr);
      }
    } catch (e) {
      const raw = Deno.env.get("AMAZON_ASSOCIATE_TAGS");
      console.error("Failed to parse AMAZON_ASSOCIATE_TAGS, raw value:", JSON.stringify(raw), e);
    }
    if (Object.keys(amazonTags).length === 0) {
      amazonTags = DEFAULT_TAGS;
    }

    if (cached) {
      console.log("Cache hit for:", cacheKey);
      // Even for cached results, re-attach images from the lookup table
      const cachedData = cached.result_data as Record<string, unknown>;
      if (type === "must-haves" && Array.isArray(cachedData.items)) {
        await attachProductImages(supabase, cachedData.items as Record<string, unknown>[]);
      } else if (type === "review") {
        await attachSingleProductImage(supabase, cachedData);
      }
      return new Response(JSON.stringify({ data: cachedData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Perplexity
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityKey) {
      return new Response(
        JSON.stringify({ error: "Perplexity API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Detect vacation type and get category list for must-haves
    let categories: string[] | undefined;
    if (type === "must-haves") {
      const vacationType = detectVacationType(query.trim());
      categories = VACATION_CATEGORIES[vacationType] || VACATION_CATEGORIES.beach;
      console.log("Detected vacation type:", vacationType, "with", categories.length, "categories");
    }

    const prompt = PROMPTS[type](query.trim(), categories);
    console.log("Calling Perplexity for travel-gear-intel:", cacheKey);

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a travel gear expert. Always respond with valid JSON only, no markdown formatting. NEVER recommend non-purchasable items like passports, insurance, cash, visas, or documents. Always include an imageUrl field with a direct URL to a real product image." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!perplexityResponse.ok) {
      const errText = await perplexityResponse.text();
      console.error("Perplexity API error:", perplexityResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch gear intel. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const perplexityData = await perplexityResponse.json();
    const rawContent = perplexityData.choices?.[0]?.message?.content;
    const citations = perplexityData.citations || [];

    if (!rawContent) {
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let resultData: Record<string, unknown>;
    try {
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      let jsonStr = jsonMatch ? jsonMatch[1].trim() : rawContent.trim();
      jsonStr = jsonStr.replace(/,\s*\n\s*([a-zA-Z_][a-zA-Z0-9_]*)"/g, ',\n      "$1"');
      jsonStr = jsonStr.replace(/{\s*\n\s*([a-zA-Z_][a-zA-Z0-9_]*)"/g, '{\n      "$1"');
      resultData = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse Perplexity response:", rawContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    resultData.citations = citations;

    // Add Amazon affiliate search URLs
    const tag = amazonTags[userCountry] || amazonTags.US;
    const domain = MARKETPLACE_CONFIG[userCountry]?.domain || "www.amazon.com";

    if (type === "must-haves" && Array.isArray(resultData.items)) {
      resultData.items = (resultData.items as Record<string, string>[]).map((item) => ({
        ...item,
        amazonUrl: item.amazonUrl || `https://${domain}/s?k=${encodeURIComponent(item.name)}&tag=${tag}`,
      }));
      // Attach product images from lookup table
      await attachProductImages(supabase, resultData.items as Record<string, unknown>[]);
    } else if (type === "review") {
      if (!resultData.amazonUrl) {
        const productName = (resultData.productName as string) || query.trim();
        resultData.amazonUrl = `https://${domain}/s?k=${encodeURIComponent(productName)}&tag=${tag}`;
      }
      // Attach product image from lookup table
      await attachSingleProductImage(supabase, resultData);
    }

    // Cache result
    await supabase
      .from("gear_intel_cache")
      .upsert({
        cache_key: cacheKey,
        intel_type: type,
        query: query.trim(),
        result_data: resultData,
      }, { onConflict: "cache_key" });

    return new Response(JSON.stringify({ data: resultData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("travel-gear-intel error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

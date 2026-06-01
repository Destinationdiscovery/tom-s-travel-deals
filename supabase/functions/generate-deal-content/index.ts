import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { requireAdmin } from "../_shared/adminAuth.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const _auth = await requireAdmin(req, corsHeaders);
    if (_auth instanceof Response) return _auth;

  try {
    const { destination, resortName, price, originalPrice, discountPercent, travelDates, highlights, contentType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const dealSummary = `Resort: ${resortName}\nDestination: ${destination}\nPrice: $${price} CAD${originalPrice ? ` (was $${originalPrice})` : ""}${discountPercent ? `\nDiscount: ${discountPercent}%` : ""}\n${travelDates ? `Travel Dates: ${travelDates}` : ""}${highlights ? `\nHighlights: ${highlights}` : ""}`;

    let systemPrompt = "";
    if (contentType === "social") {
      systemPrompt = `You are a travel marketing expert. Create ready-to-post social media content for Instagram, Facebook, and Twitter/X. Include emojis, hashtags, and compelling copy. Format with clear headers for each platform. Keep it exciting and urgency-driven.`;
    } else if (contentType === "email") {
      systemPrompt = `You are a travel marketing expert. Write a compelling promotional email body for this travel deal. Include a catchy opening, deal highlights, urgency language, and a clear call-to-action. Keep it professional but exciting. Plain text format, no HTML.`;
    } else if (contentType === "poster") {
      systemPrompt = `You are a travel marketing copywriter. Write a single short tagline (under 15 words) for this travel deal that would look great on a promotional poster. Just the tagline, nothing else.`;
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
          { role: "user", content: `Create content for this deal:\n\n${dealSummary}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-deal-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOMAINS: Record<string, string> = {
  CA: "www.amazon.ca",
  US: "www.amazon.com",
  GB: "www.amazon.co.uk",
};
const DEFAULT_TAGS: Record<string, string> = {
  CA: "gen80s01-20",
  US: "destinati0a78-20",
  GB: "uktripreviews-21",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, country } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cc = (country && DOMAINS[country]) ? country : "US";
    const domain = DOMAINS[cc];

    let tags: Record<string, string> = {};
    try {
      let raw = Deno.env.get("AMAZON_ASSOCIATE_TAGS");
      if (raw) {
        raw = raw.replace(/^\uFEFF/, "").trim().replace(/^["']|["']$/g, "");
        tags = JSON.parse(raw);
      }
    } catch { /* ignore */ }
    const tag = tags[cc] || DEFAULT_TAGS[cc];

    const q = query.trim().replace(/\s+/g, " ");
    const url = `https://${domain}/s?k=${encodeURIComponent(q)}&tag=${tag}`;

    return new Response(JSON.stringify({ url, domain, title: q }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

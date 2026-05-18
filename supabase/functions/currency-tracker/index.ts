import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "x-cache",
};

const TOOL_NAME = "currency";
const PROMPT_VERSION = "v1";
const TTL_MS = 60 * 60 * 1000; // 1 hour
const normalizeKey = (s: string) => `${PROMPT_VERSION}:${s.trim().toLowerCase().replace(/\s+/g, " ")}`;

// Country/region to currency code mapping
const COUNTRY_CURRENCY: Record<string, string> = {
  mexico: "MXN", japan: "JPY", uk: "GBP", "united kingdom": "GBP", britain: "GBP",
  england: "GBP", europe: "EUR", eurozone: "EUR",
  france: "EUR", germany: "EUR", italy: "EUR", spain: "EUR", portugal: "EUR",
  greece: "EUR", netherlands: "EUR", ireland: "EUR", austria: "EUR", belgium: "EUR",
  canada: "CAD", australia: "AUD", usa: "USD", "united states": "USD", america: "USD",
  thailand: "THB", india: "INR", turkey: "TRY", brazil: "BRL", colombia: "COP",
  "costa rica": "CRC", "south korea": "KRW", korea: "KRW", china: "CNY", "hong kong": "HKD",
  singapore: "SGD", malaysia: "MYR", indonesia: "IDR", philippines: "PHP",
  vietnam: "VND", egypt: "EGP", "south africa": "ZAR", morocco: "MAD",
  switzerland: "CHF", sweden: "SEK", norway: "NOK", denmark: "DKK",
  iceland: "ISK", "new zealand": "NZD", argentina: "ARS", peru: "PEN",
  chile: "CLP", "dominican republic": "DOP", jamaica: "JMD", bali: "IDR",
  tokyo: "JPY", paris: "EUR", cancun: "MXN", phuket: "THB", dubai: "AED",
  uae: "AED", israel: "ILS", jordan: "JOD", kenya: "KES", tanzania: "TZS",
  croatia: "EUR", poland: "PLN", "czech republic": "CZK", hungary: "HUF",
  romania: "RON", taiwan: "TWD", fiji: "FJD", maldives: "MVR",
};

const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar", MXN: "Mexican Peso", JPY: "Japanese Yen", GBP: "British Pound", EUR: "Euro",
  CAD: "Canadian Dollar", AUD: "Australian Dollar", THB: "Thai Baht",
  INR: "Indian Rupee", TRY: "Turkish Lira", BRL: "Brazilian Real",
  COP: "Colombian Peso", CRC: "Costa Rican Colón", KRW: "South Korean Won",
  CNY: "Chinese Yuan", HKD: "Hong Kong Dollar", SGD: "Singapore Dollar",
  MYR: "Malaysian Ringgit", IDR: "Indonesian Rupiah", PHP: "Philippine Peso",
  VND: "Vietnamese Dong", EGP: "Egyptian Pound", ZAR: "South African Rand",
  MAD: "Moroccan Dirham", CHF: "Swiss Franc", SEK: "Swedish Krona",
  NOK: "Norwegian Krone", DKK: "Danish Krone", ISK: "Icelandic Króna",
  NZD: "New Zealand Dollar", ARS: "Argentine Peso", PEN: "Peruvian Sol",
  CLP: "Chilean Peso", DOP: "Dominican Peso", JMD: "Jamaican Dollar",
  AED: "UAE Dirham", ILS: "Israeli Shekel", JOD: "Jordanian Dinar",
  KES: "Kenyan Shilling", TZS: "Tanzanian Shilling", PLN: "Polish Złoty",
  CZK: "Czech Koruna", HUF: "Hungarian Forint", RON: "Romanian Leu",
  TWD: "Taiwan Dollar", FJD: "Fijian Dollar", MVR: "Maldivian Rufiyaa",
};

// Common natural-language currency words → ISO code
const WORD_TO_CODE: Record<string, string> = {
  yen: "JPY", euros: "EUR", euro: "EUR", pounds: "GBP", pound: "GBP",
  sterling: "GBP", dollars: "USD", dollar: "USD", usd: "USD", buck: "USD", bucks: "USD",
  peso: "MXN", pesos: "MXN", baht: "THB", rupee: "INR", rupees: "INR",
  lira: "TRY", real: "BRL", reais: "BRL", won: "KRW", yuan: "CNY", rmb: "CNY",
  dirham: "AED", shekel: "ILS", franc: "CHF", francs: "CHF", krona: "SEK",
  krone: "NOK", rand: "ZAR", ringgit: "MYR", rupiah: "IDR", dong: "VND",
  loonie: "CAD", loonies: "CAD", quid: "GBP",
};

/** Extract an ordered list of currency codes from a query string. */
function extractCurrencies(raw: string): string[] {
  const upper = raw.toUpperCase();
  const lower = raw.toLowerCase();
  const found: { idx: number; code: string }[] = [];

  // 1) ISO codes
  const codeRe = /\b[A-Z]{3}\b/g;
  let m: RegExpExecArray | null;
  while ((m = codeRe.exec(upper)) !== null) {
    if (CURRENCY_NAMES[m[0]]) found.push({ idx: m.index, code: m[0] });
  }

  // 2) Currency words (yen, euros, pesos...)
  const wordRe = /\b([a-z]+)\b/g;
  while ((m = wordRe.exec(lower)) !== null) {
    const code = WORD_TO_CODE[m[1]];
    if (code) found.push({ idx: m.index, code });
  }

  // 3) Multi-word countries first (longer match wins), then single-word
  const multi = Object.keys(COUNTRY_CURRENCY).filter((k) => k.includes(" "));
  for (const country of multi) {
    const i = lower.indexOf(country);
    if (i !== -1) found.push({ idx: i, code: COUNTRY_CURRENCY[country] });
  }
  while ((m = wordRe.exec(lower)) !== null) {
    const c = COUNTRY_CURRENCY[m[1]];
    if (c) found.push({ idx: m.index, code: c });
  }

  // Sort by position, then de-dupe consecutive duplicates
  found.sort((a, b) => a.idx - b.idx);
  const out: string[] = [];
  for (const { code } of found) {
    if (out[out.length - 1] !== code) out.push(code);
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const raw = String(query).trim();

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const cacheKey = normalizeKey(raw);
    const { data: cached } = await supabase
      .from("tool_search_cache")
      .select("id, result_data, hit_count")
      .eq("tool_name", TOOL_NAME).eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString()).maybeSingle();
    if (cached) {
      supabase.from("tool_search_cache").update({ hit_count: (cached.hit_count || 0) + 1 }).eq("id", cached.id).then(() => {});
      return new Response(JSON.stringify(cached.result_data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    const codes = extractCurrencies(raw);

    let sourceCode = "USD";
    let targetCode: string | undefined;

    if (codes.length >= 2) {
      sourceCode = codes[0];
      targetCode = codes[codes.length - 1];
      // If source == target (e.g. user typed only one currency twice), default source to USD
      if (sourceCode === targetCode) sourceCode = "USD";
    } else if (codes.length === 1) {
      targetCode = codes[0];
      sourceCode = targetCode === "USD" ? "EUR" : "USD";
    } else {
      // Last resort: strip non-letters and try as a code
      targetCode = raw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
    }

    if (!targetCode || !CURRENCY_NAMES[targetCode]) {
      return new Response(
        JSON.stringify({
          error: `Could not detect a currency in "${raw}". Try "CAD to EUR" or a country like "Mexico".`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Always fetch USD-based rates and compute cross-rates from them.
    const rateRes = await fetch(`https://open.er-api.com/v6/latest/USD`);
    if (!rateRes.ok) throw new Error("Exchange rate API unavailable");
    const rateData = await rateRes.json();

    const rates = rateData.rates || {};
    const sourceUsd = sourceCode === "USD" ? 1 : rates[sourceCode];
    const targetUsd = targetCode === "USD" ? 1 : rates[targetCode];

    if (!sourceUsd || !targetUsd) {
      return new Response(
        JSON.stringify({
          error: `Currency "${!sourceUsd ? sourceCode : targetCode}" not supported.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Cross rate: 1 source = (targetUsd / sourceUsd) target
    const rate = targetUsd / sourceUsd;
    const inverseRate = sourceUsd / targetUsd;

    const sourceName = CURRENCY_NAMES[sourceCode] || sourceCode;
    const targetName = CURRENCY_NAMES[targetCode] || targetCode;

    // Travel money tips for the TARGET currency
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    let tips: string[] = [];
    if (PERPLEXITY_API_KEY) {
      try {
        const tipRes = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              {
                role: "user",
                content: `Give 5 short practical travel money tips for someone visiting a country that uses ${targetName} (${targetCode}). Cover ATM advice, tipping norms, card acceptance, and bargaining. Return only a JSON array of strings, no other text.`,
              },
            ],
          }),
        });
        const tipData = await tipRes.json();
        const rawTips = tipData.choices?.[0]?.message?.content || "[]";
        const match = rawTips.match(/\[[\s\S]*\]/);
        if (match) tips = JSON.parse(match[0]);
      } catch { /* tips are optional */ }
    }

    const baseAmounts = [1, 5, 10, 20, 50, 100, 500];

    const result = {
      // New, accurate fields
      sourceCode,
      sourceName,
      targetCode,
      targetName,
      rate: parseFloat(rate.toFixed(4)),
      inverseRate: parseFloat(inverseRate.toFixed(6)),
      lastUpdated: rateData.time_last_update_utc || new Date().toISOString(),
      tips,
      conversions: baseAmounts.map((amount) => ({
        source: amount,
        target: parseFloat((amount * rate).toFixed(2)),
      })),

      // Backwards compatibility (older UI fields)
      currencyCode: targetCode,
      currencyName: targetName,
    };

    await supabase.from("tool_search_cache").upsert({
      tool_name: TOOL_NAME, cache_key: cacheKey, query: raw, result_data: result,
      expires_at: new Date(Date.now() + TTL_MS).toISOString(), hit_count: 0,
    }, { onConflict: "tool_name,cache_key" });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

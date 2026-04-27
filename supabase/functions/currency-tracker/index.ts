import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Country/region to currency code mapping
const COUNTRY_CURRENCY: Record<string, string> = {
  mexico: "MXN", japan: "JPY", uk: "GBP", "united kingdom": "GBP", europe: "EUR",
  france: "EUR", germany: "EUR", italy: "EUR", spain: "EUR", portugal: "EUR",
  greece: "EUR", netherlands: "EUR", canada: "CAD", australia: "AUD",
  thailand: "THB", india: "INR", turkey: "TRY", brazil: "BRL", colombia: "COP",
  "costa rica": "CRC", "south korea": "KRW", china: "CNY", "hong kong": "HKD",
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
  MXN: "Mexican Peso", JPY: "Japanese Yen", GBP: "British Pound", EUR: "Euro",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const raw = String(query).trim();
    const lower = raw.toLowerCase();

    // 1) Try direct country/region match (e.g. "Mexico", "Bali")
    let currencyCode: string | undefined = COUNTRY_CURRENCY[lower];

    // 2) If not, look for a 3-letter currency code anywhere in the query.
    //    For "USD to MXN" or "100 USD to MXN" pick the LAST code (target),
    //    falling back to the first if only one is present and it isn't USD.
    if (!currencyCode) {
      const codeMatches = raw.toUpperCase().match(/\b[A-Z]{3}\b/g) || [];
      const knownCodes = codeMatches.filter((c) => CURRENCY_NAMES[c]);
      if (knownCodes.length >= 2) {
        // last one is typically the target ("USD to MXN" -> MXN)
        currencyCode = knownCodes[knownCodes.length - 1];
      } else if (knownCodes.length === 1) {
        currencyCode = knownCodes[0];
      }
    }

    // 3) Last resort: scan tokens against the country/currency map
    //    (handles "convert to mexico", "100 euros in yen", etc.)
    if (!currencyCode) {
      const cleaned = lower.replace(/[^a-z\s]/g, " ");
      const tokens = cleaned.split(/\s+/).filter(Boolean);
      const yenMap: Record<string, string> = { yen: "JPY", euros: "EUR", euro: "EUR", pounds: "GBP", pound: "GBP", dollars: "USD", dollar: "USD", peso: "MXN", pesos: "MXN", baht: "THB", rupee: "INR", rupees: "INR", lira: "TRY", real: "BRL", reais: "BRL", won: "KRW", yuan: "CNY", dirham: "AED", shekel: "ILS" };
      for (const t of tokens) {
        if (yenMap[t]) { currencyCode = yenMap[t]; break; }
        if (COUNTRY_CURRENCY[t]) { currencyCode = COUNTRY_CURRENCY[t]; break; }
      }
      // try multi-word country names
      if (!currencyCode) {
        for (const country of Object.keys(COUNTRY_CURRENCY)) {
          if (country.includes(" ") && lower.includes(country)) {
            currencyCode = COUNTRY_CURRENCY[country];
            break;
          }
        }
      }
    }

    if (!currencyCode) {
      currencyCode = raw.toUpperCase().replace(/[^A-Z]/g, "");
    }

    const currencyName = CURRENCY_NAMES[currencyCode] || currencyCode;

    // Fetch from open exchange rates API (free, no key needed)
    const rateRes = await fetch(`https://open.er-api.com/v6/latest/USD`);
    if (!rateRes.ok) throw new Error("Exchange rate API unavailable");
    const rateData = await rateRes.json();

    const rate = rateData.rates?.[currencyCode];
    if (!rate) {
      return new Response(
        JSON.stringify({ error: `Currency "${currencyCode}" not found. Try a country name like "Mexico" or currency code like "MXN".` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate travel tips via Perplexity
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
                content: `Give me 5 short practical travel money tips for someone visiting a country that uses ${currencyName} (${currencyCode}). Include ATM advice, tipping norms, card acceptance, and bargaining tips. Return as a JSON array of strings. Only the JSON array, no other text.`,
              },
            ],
          }),
        });
        const tipData = await tipRes.json();
        const raw = tipData.choices?.[0]?.message?.content || "[]";
        const match = raw.match(/\[[\s\S]*\]/);
        if (match) tips = JSON.parse(match[0]);
      } catch { /* tips are optional */ }
    }

    const result = {
      currencyCode,
      currencyName,
      rate: parseFloat(rate.toFixed(4)),
      inverseRate: parseFloat((1 / rate).toFixed(6)),
      lastUpdated: rateData.time_last_update_utc || new Date().toISOString(),
      tips,
      conversions: [1, 5, 10, 20, 50, 100, 500].map((usd) => ({
        usd,
        local: parseFloat((usd * rate).toFixed(2)),
      })),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

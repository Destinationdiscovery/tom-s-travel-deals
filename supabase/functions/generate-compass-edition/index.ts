// Compass newsletter generation orchestrator
// 11-step pipeline: Gemini 2.5 Pro for editorial, Perplexity Sonar for research
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TONE_BLOCK = `
TONE RULES (strict):
- Smart, honest, enthusiastic but never hypey.
- Like advice from a well travelled friend who reads the news.
- Never use: stunning, breathtaking, amazing, incredible, world-class, nestled, vibrant, picturesque, charming, quaint.
- NEVER use em-dashes (—) or en-dashes (–). Use periods, commas, hyphens, or the word "to" instead.
- Be specific. Name actual places, streets, dishes, landmarks.
- Short paragraphs, maximum 3 sentences each. No fluff.
`;

const today = () => new Date().toISOString().slice(0, 10);

// ---- Gemini via Lovable AI Gateway ----
async function callGemini(prompt: string, jsonMode = true): Promise<string> {
  const messages = [
    { role: "system", content: jsonMode
      ? `You return ONLY valid JSON. No markdown, no code fences, no preamble. ${TONE_BLOCK}`
      : `You write polished newsletter copy. ${TONE_BLOCK}` },
    { role: "user", content: prompt },
  ];
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJson<T>(text: string): T {
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as T;
}

async function callGeminiJSON<T>(prompt: string): Promise<T> {
  const raw = await callGemini(prompt, true);
  return parseJson<T>(raw);
}

// ---- Perplexity Sonar ----
const PPLX_UNIVERSAL_RULE = `
CRITICAL: You have live web search. You MUST return real, specific, current results.
Never say "no data", "no reviews available", "information not found", "no current deals", "data unavailable", or return empty arrays / null values for required fields.
If your first search yields thin results, broaden the query: nearby city, similar property class, comparable route, regional or global news. Always return the best real, verifiable data you can find.
Every required field must be populated with a real answer drawn from your search.`;

async function callPerplexity(prompt: string, recency: "day" | "week" | "month" | null = "month") {
  const body: any = {
    model: "sonar",
    messages: [
      { role: "system", content: `You are a travel intelligence researcher. Return ONLY valid JSON. No markdown, no code fences, no preamble. The response must be parseable by JSON.parse directly.${PPLX_UNIVERSAL_RULE}` },
      { role: "user", content: prompt },
    ],
    return_citations: true,
  };
  if (recency) body.search_recency_filter = recency;
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Perplexity ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const citations: string[] = data.citations ?? [];
  return { text, citations };
}

async function callPerplexityJSON<T>(prompt: string, recency: "day" | "week" | "month" | null = "month") {
  const { text, citations } = await callPerplexity(prompt, recency);
  return { data: parseJson<T>(text), citations };
}

// Retry once with broadened scope if the first result fails a sufficiency check.
async function callPerplexityWithRetry<T>(
  prompt: string,
  recency: "day" | "week" | "month" | null,
  isSufficient: (d: T) => boolean,
  broadenSuffix: string,
): Promise<{ data: T; citations: string[] }> {
  const first = await callPerplexityJSON<T>(prompt, recency);
  if (isSufficient(first.data)) return first;
  const broadened = `${prompt}\n\nBROADEN SCOPE: ${broadenSuffix}\nReturn the same JSON shape with real, populated values. Do not return empty arrays or null values.`;
  return await callPerplexityJSON<T>(broadened, null);
}

// ---- Progress broadcast ----
function makeProgress(supabase: any, runId: string) {
  const channel = supabase.channel(`compass:gen:${runId}`);
  let ready: Promise<unknown> = channel.subscribe();
  return async (step: number, status: "running" | "ok" | "failed", label: string, error?: string) => {
    try {
      await ready;
      await channel.send({
        type: "broadcast",
        event: "step",
        payload: { step, status, label, error, ts: Date.now() },
      });
    } catch (_) { /* ignore */ }
  };
}

// ---- Step prompts ----
function step1Prompt(recent: string[]) {
  return `You are the editor of The Compass, a biweekly travel intelligence newsletter for ReviewThenGo.com. Readers are primarily American and Canadian travellers who plan carefully.

Select ONE destination for this edition's Trip of the Week. It must:
- Appeal broadly to US and Canadian travellers
- NOT appear in this recent list: ${JSON.stringify(recent)}
- Be timely for travel season. Today: ${today()}
- Be specific (e.g. "Dordogne Valley, France" not just "France")

Return JSON: {"destination":"...", "destination_short":"...", "country":"...", "region":"...", "reason_selected":"..."}`;
}

function step2Prompt(destination: string) {
  return `Create the Trip of the Week section for ${destination}. Today: ${today()}.
Be specific. Name actual places, neighbourhoods, restaurants, landmarks. No generic phrases.

Return JSON: {"hook":"two sentence opening", "itinerary":[{"day":"Day 1-2","location":"...","activities":"..."},{"day":"Day 3-4","location":"...","activities":"..."},{"day":"Day 5","location":"...","activities":"..."},{"day":"Day 6","location":"...","activities":"..."},{"day":"Day 7","location":"...","activities":"..."}], "reviewers_love":["...","...","..."], "honest_warnings":["...","..."], "verdict":"one honest sentence"}`;
}

function step3Prompt(destination: string) {
  return `Search for current safety info for travellers to ${destination}. Find latest US State Department and Canadian government travel advisories, recent traveller reports, current conditions. Today: ${today()}.

Return JSON: {"overall_score":8.2,"solo_female_score":7.9,"advisory_level_us":1,"advisory_level_canada":1,"advisory_note":"one sentence or null","considerations":["...","...","..."],"insider_tip":"...","last_updated":"Month Year"}`;
}

function step4Prompt(destination: string) {
  return `Search current exchange rates for ${destination} as of ${today()}. Find USD and CAD to local currency rates, card vs cash culture, ATM availability.

Return JSON: {"currency_name":"...","currency_code":"...","usd_rate":"1 USD = ...","cad_rate":"1 CAD = ...","rate_date":"...","cash_vs_card":"...","atm_availability":"Excellent | Good | Limited | Poor","money_tip":"...","disclaimer":"Rates approximate and change daily. Check ReviewThenGo currency tool for live rates before travel."}`;
}

function step5Prompt(destination: string) {
  return `Best time to visit ${destination}. Today: ${today()}.
Return JSON: {"best_months":"...","best_reason":"...","avoid_months":"...","avoid_reason":"...","current_month_rating":"Great | Good | Shoulder Season | Avoid","current_month_note":"one honest sentence about visiting right now","insider_timing_tip":"..."}`;
}

function step6Prompt(destination: string) {
  return `Search current flight deals available this week from major US and Canadian cities (YYZ, YVR, JFK, EWR, LAX, ORD). Include one deal to ${destination} if available. Today: ${today()}.

Return JSON: {"deals":[{"route":"YYZ to FCO","price":"$499 return","airline":"...","travel_window":"...","book_by":"... or null","savings":"...","highlight":"...","source":"..."}],"disclaimer":"Prices change rapidly. Always verify current pricing directly with the airline or booking platform before purchasing. ReviewThenGo is not responsible for price changes or availability."}`;
}

function step7Prompt(destination: string) {
  return `Search current traveller reviews for well known hotels or resorts in ${destination}. Pick one with significant recent review activity on TripAdvisor, Google, Booking.com, and Reddit. Summarize what real travellers are saying right now. Today: ${today()}.

Return JSON: {"hotel_name":"...","hotel_type":"...","location_detail":"...","overall_score":8.4,"price_range":"$ | $$ | $$$ | $$$$","what_reviewers_love":["...","...","..."],"what_reviewers_flag":["...","..."],"reddit_consensus":"...","best_for":"...","verdict":"one honest sentence","review_sources":"TripAdvisor, Google, Booking.com, Reddit","disclaimer":"Review summary based on aggregated public review data. Always check current reviews before booking."}`;
}

function step8Prompt() {
  return `Search the most important travel news from the past two weeks affecting US and Canadian travellers. Visa changes, entry rules, advisory updates, airline policy, currency news, safety updates. Today: ${today()}.
Find 3 to 4 genuinely newsworthy items. No generic evergreen tips.

Return JSON: {"items":[{"flag_emoji":"🇪🇺","country_or_region":"...","headline":"short under 8 words","body":"2 to 3 sentences","action_required":true,"affects":"...","tool_link":"travel-intel | safety | currency | best-time | itinerary","source":"..."}]}`;
}

function step9Prompt(editionNumber: number, data: any) {
  return `You are the editor of The Compass, ReviewThenGo's biweekly travel intelligence newsletter.
TODAY: ${today()}. EDITION: #${editionNumber}.

ALL RESEARCH DATA:
${JSON.stringify(data, null, 2)}

Write the complete newsletter. Return JSON:
{
  "subject_options": ["under 60 chars with emoji", "under 60 chars with emoji", "under 60 chars with emoji"],
  "full_text": "the complete plain-text newsletter following the structure below",
  "sections": {
    "trip": "Trip of the Week section as markdown",
    "flights": "Flight Deal of the Week section as markdown",
    "hotel": "Honest Hotel Pick section as markdown",
    "intel": "Travel Intel Briefing section as markdown"
  }
}

Structure for full_text:
THE COMPASS | Issue #${editionNumber} | ${today()} | Your biweekly travel intelligence briefing

TRIP OF THE WEEK. ${data.destination?.destination_short?.toUpperCase() ?? ""}
[hook 2 sentences]
BEST TIME TO GO: [best_months]. [best_reason in one line]
RIGHT NOW: [current_month_rating]. [current_month_note]
SAFETY: [score]/10 overall. [one line context]
CURRENCY: [USD and CAD rates in one line]

YOUR 7 DAY ITINERARY:
[day by day clean bullets]

WHAT TRAVELLERS LOVE:
[3 bullets]

HONEST WARNINGS:
[2 bullets]

VERDICT: [verdict]

CTA: Run your own ${data.destination?.destination_short ?? "trip"} itinerary on ReviewThenGo.

FLIGHT DEAL OF THE WEEK
[strongest deal in bold first]
[remaining deals as bullets]
[disclaimer in italics]
CTA: Check current flights on ReviewThenGo.

HONEST HOTEL PICK. [HOTEL NAME]
[type and location one line]
Overall score: [score]/10

WHAT TRAVELLERS LOVE:
[3 checkmarks]

WHAT TO KNOW BEFORE YOU BOOK:
[2 warnings]

REDDIT SAYS: [reddit_consensus]
BEST FOR: [best_for]
VERDICT: [verdict]
[disclaimer]
CTA: See the full [hotel] review on ReviewThenGo.

TRAVEL INTEL BRIEFING
What changed in the last two weeks.
[each item: flag headline body, plus action warning if needed]
CTA: Check visa requirements and travel advisories for any destination.

Until next issue,
Tom from ReviewThenGo
reviewthengo.com`;
}

function renderHTML(editionNumber: number, fullText: string, sections: any, destinationShort: string): string {
  // Convert plain-text full_text to a styled HTML email. Simple line-based renderer
  // following the design spec in the plan. Inline CSS only, max 600px.
  const lines = fullText.split("\n");
  const blocks: string[] = [];
  let buffer: string[] = [];
  const flushPara = () => {
    if (buffer.length) {
      blocks.push(`<p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#374151">${buffer.join("<br>")}</p>`);
      buffer = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); continue; }
    if (/^(TRIP OF THE WEEK|FLIGHT DEAL OF THE WEEK|HONEST HOTEL PICK|TRAVEL INTEL BRIEFING)/i.test(line)) {
      flushPara();
      blocks.push(`<div style="border-top:2px solid #00c9a7;margin:32px 0 16px"></div><div style="font-family:Arial,sans-serif;font-size:11px;font-weight:bold;color:#00c9a7;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">${line}</div>`);
    } else if (/^CTA:/i.test(line)) {
      flushPara();
      const txt = line.replace(/^CTA:\s*/i, "");
      blocks.push(`<div style="text-align:center;margin:24px 0"><a href="https://www.reviewthengo.com" style="background:#00c9a7;color:#0a0f1a;font-weight:bold;padding:14px 28px;border-radius:8px;text-decoration:none;display:inline-block;font-family:Arial,sans-serif;font-size:15px">${txt}</a></div>`);
    } else if (/^VERDICT:/i.test(line)) {
      flushPara();
      blocks.push(`<p style="margin:8px 0 16px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#0a0f1a">${line}</p>`);
    } else if (line.startsWith("-") || line.startsWith("•")) {
      buffer.push(`<span style="color:#00c9a7">✓</span> ${line.replace(/^[-•]\s*/, "")}`);
    } else {
      buffer.push(line);
    }
  }
  flushPara();

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Compass #${editionNumber}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden">
  <div style="background:#0a0f1a;padding:32px;text-align:center">
    <div style="font-family:Georgia,serif;font-size:28px;color:#00c9a7;letter-spacing:4px">THE COMPASS</div>
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#8b9ab0;margin-top:8px">Issue #${editionNumber} . ${today()}</div>
  </div>
  <div style="padding:32px">
    ${blocks.join("\n")}
  </div>
  <div style="background:#0a0f1a;padding:32px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#8b9ab0">
    Until next issue. Tom from <a href="https://www.reviewthengo.com" style="color:#00c9a7;text-decoration:none">ReviewThenGo</a><br>
    <a href="#" style="color:#00c9a7">Unsubscribe</a> . <a href="#" style="color:#00c9a7">View in browser</a>
  </div>
</div>
</body></html>`;
}

// ---- Step runner with fallback ----
async function runStep<T>(
  stepNo: number,
  label: string,
  progress: (s: number, st: "running"|"ok"|"failed", l: string, e?: string) => Promise<void>,
  fn: () => Promise<T>,
  fallback: T,
): Promise<{ ok: boolean; data: T; error?: string }> {
  await progress(stepNo, "running", label);
  try {
    const data = await fn();
    await progress(stepNo, "ok", label);
    return { ok: true, data };
  } catch (err: any) {
    console.error(`Step ${stepNo} failed:`, err);
    await progress(stepNo, "failed", label, err?.message);
    return { ok: false, data: fallback, error: err?.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { only_step, edition_id } = body as { only_step?: number; edition_id?: string };

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Single-step regeneration path
    if (only_step && edition_id) {
      return await regenerateStep(supabase, edition_id, only_step);
    }

    const runId = crypto.randomUUID();
    const progress = makeProgress(supabase, runId);

    // Insert generating row early so client can correlate
    const { data: editionRow, error: insErr } = await supabase
      .from("compass_editions")
      .insert({ status: "generating", run_id: runId })
      .select("id, edition_number")
      .single();
    if (insErr) throw insErr;

    // Recent destinations (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString();
    const { data: recentRows } = await supabase
      .from("compass_destinations_log")
      .select("destination")
      .gte("used_at", sixMonthsAgo);
    const recent = (recentRows ?? []).map((r: any) => r.destination);

    // Fire-and-forget: respond immediately with run_id, continue work in background
    const work = (async () => {
      const meta: Record<string, any> = { generated_at: new Date().toISOString() };
      const allCitations: any[] = [];

      // Step 1: destination
      const s1 = await runStep(1, "Selecting destination...", progress,
        () => callGeminiJSON<any>(step1Prompt(recent)),
        { destination: "Lisbon, Portugal", destination_short: "Lisbon", country: "Portugal", region: "Europe", reason_selected: "Fallback destination." });
      meta.step_1_api = "gemini-2.5-pro"; meta.step_1_status = s1.ok ? "ok" : "failed";
      const destination = s1.data;

      // Log destination
      await supabase.from("compass_destinations_log").insert({
        destination: destination.destination,
        used_in_edition: editionRow.edition_number,
      });

      // Steps 2 through 8 in parallel
      const [s2, s3, s4, s5, s6, s7, s8] = await Promise.all([
        runStep(2, "Generating trip itinerary...", progress,
          () => callGeminiJSON<any>(step2Prompt(destination.destination)),
          { hook: "", itinerary: [], reviewers_love: [], honest_warnings: [], verdict: "" }),
        runStep(3, "Running safety analysis...", progress,
          async () => { const r = await callPerplexityJSON<any>(step3Prompt(destination.destination), "month"); allCitations.push({ step: 3, urls: r.citations }); return r.data; },
          { overall_score: null, considerations: [], insider_tip: "", last_updated: "" }),
        runStep(4, "Fetching live currency data...", progress,
          async () => { const r = await callPerplexityJSON<any>(step4Prompt(destination.destination), "week"); allCitations.push({ step: 4, urls: r.citations }); return r.data; },
          { currency_name: "", currency_code: "", disclaimer: "" }),
        runStep(5, "Finding best time to visit...", progress,
          () => callGeminiJSON<any>(step5Prompt(destination.destination)),
          { best_months: "", best_reason: "" }),
        runStep(6, "Sourcing current flight deals...", progress,
          async () => { const r = await callPerplexityJSON<any>(step6Prompt(destination.destination), "week"); allCitations.push({ step: 6, urls: r.citations }); return r.data; },
          { deals: [], disclaimer: "" }),
        runStep(7, "Selecting hotel pick...", progress,
          async () => { const r = await callPerplexityJSON<any>(step7Prompt(destination.destination), "month"); allCitations.push({ step: 7, urls: r.citations }); return r.data; },
          { hotel_name: "", what_reviewers_love: [], what_reviewers_flag: [], verdict: "", disclaimer: "" }),
        runStep(8, "Generating travel intel briefing...", progress,
          async () => { const r = await callPerplexityJSON<any>(step8Prompt(), "week"); allCitations.push({ step: 8, urls: r.citations }); return r.data; },
          { items: [] }),
      ]);
      meta.step_2_api = "gemini-2.5-pro"; meta.step_2_status = s2.ok ? "ok" : "failed";
      meta.step_3_api = "perplexity-sonar"; meta.step_3_status = s3.ok ? "ok" : "failed";
      meta.step_4_api = "perplexity-sonar"; meta.step_4_status = s4.ok ? "ok" : "failed";
      meta.step_5_api = "gemini-2.5-pro"; meta.step_5_status = s5.ok ? "ok" : "failed";
      meta.step_6_api = "perplexity-sonar"; meta.step_6_status = s6.ok ? "ok" : "failed";
      meta.step_7_api = "perplexity-sonar"; meta.step_7_status = s7.ok ? "ok" : "failed";
      meta.step_8_api = "perplexity-sonar"; meta.step_8_status = s8.ok ? "ok" : "failed";

      const dataBundle = {
        destination,
        itinerary: s2.data,
        safety: s3.data,
        currency: s4.data,
        best_time: s5.data,
        flight_deals: s6.data,
        hotel: s7.data,
        travel_intel: s8.data,
      };

      // Step 9: copy
      const s9 = await runStep(9, "Writing newsletter copy...", progress,
        () => callGeminiJSON<any>(step9Prompt(editionRow.edition_number, dataBundle)),
        { subject_options: [`The Compass #${editionRow.edition_number}`, "Your biweekly briefing", "New edition"], full_text: "Generation failed.", sections: {} });
      meta.step_9_api = "gemini-2.5-pro"; meta.step_9_status = s9.ok ? "ok" : "failed";

      // Step 10: HTML render
      await progress(10, "running", "Rendering HTML edition...");
      const html = renderHTML(editionRow.edition_number, s9.data.full_text, s9.data.sections, destination.destination_short);
      await progress(10, "ok", "Rendering HTML edition...");
      meta.step_10_api = "renderer"; meta.step_10_status = "ok";

      // Subscriber count snapshot
      const { count: subCount } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Step 11: save
      await progress(11, "running", "Saving to dashboard...");
      const { error: updErr } = await supabase
        .from("compass_editions")
        .update({
          status: "draft",
          destination: destination.destination,
          destination_data: destination,
          itinerary_data: s2.data,
          safety_data: s3.data,
          currency_data: s4.data,
          best_time_data: s5.data,
          flight_deals_data: s6.data,
          hotel_data: s7.data,
          travel_intel_data: s8.data,
          subject_line_options: s9.data.subject_options ?? [],
          subject_line: s9.data.subject_options?.[0] ?? null,
          full_text: s9.data.full_text,
          full_html: html,
          generation_metadata: meta,
          perplexity_citations: allCitations,
          subscriber_count: subCount ?? 0,
        })
        .eq("id", editionRow.id);
      if (updErr) {
        await progress(11, "failed", "Saving to dashboard...", updErr.message);
      } else {
        await progress(11, "ok", "Saving to dashboard...");
      }
    })();

    // Use EdgeRuntime.waitUntil if available so the background work finishes
    // even after the HTTP response returns.
    // deno-lint-ignore no-explicit-any
    const er: any = (globalThis as any).EdgeRuntime;
    if (er?.waitUntil) er.waitUntil(work);

    return new Response(JSON.stringify({ run_id: runId, edition_id: editionRow.id, edition_number: editionRow.edition_number }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Compass generation error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function regenerateStep(supabase: any, editionId: string, step: number): Promise<Response> {
  const { data: edition, error } = await supabase
    .from("compass_editions")
    .select("*")
    .eq("id", editionId)
    .single();
  if (error || !edition) {
    return new Response(JSON.stringify({ error: "Edition not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const dest = edition.destination_data?.destination ?? edition.destination;
  const update: Record<string, any> = {};
  const meta = edition.generation_metadata ?? {};
  try {
    if (step === 2) update.itinerary_data = await callGeminiJSON<any>(step2Prompt(dest));
    else if (step === 3) update.safety_data = (await callPerplexityJSON<any>(step3Prompt(dest), "month")).data;
    else if (step === 4) update.currency_data = (await callPerplexityJSON<any>(step4Prompt(dest), "week")).data;
    else if (step === 5) update.best_time_data = await callGeminiJSON<any>(step5Prompt(dest));
    else if (step === 6) update.flight_deals_data = (await callPerplexityJSON<any>(step6Prompt(dest), "week")).data;
    else if (step === 7) update.hotel_data = (await callPerplexityJSON<any>(step7Prompt(dest), "month")).data;
    else if (step === 8) update.travel_intel_data = (await callPerplexityJSON<any>(step8Prompt(), "week")).data;
    else if (step === 9) {
      const bundle = {
        destination: edition.destination_data,
        itinerary: edition.itinerary_data, safety: edition.safety_data,
        currency: edition.currency_data, best_time: edition.best_time_data,
        flight_deals: edition.flight_deals_data, hotel: edition.hotel_data,
        travel_intel: edition.travel_intel_data,
      };
      const copy = await callGeminiJSON<any>(step9Prompt(edition.edition_number, bundle));
      update.full_text = copy.full_text;
      update.subject_line_options = copy.subject_options ?? edition.subject_line_options;
      update.full_html = renderHTML(edition.edition_number, copy.full_text, copy.sections, edition.destination_data?.destination_short ?? "");
    } else {
      return new Response(JSON.stringify({ error: "Step not regeneratable" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    meta[`step_${step}_status`] = "ok";
    meta[`step_${step}_regenerated_at`] = new Date().toISOString();
    update.generation_metadata = meta;
    const { error: uerr } = await supabase.from("compass_editions").update(update).eq("id", editionId);
    if (uerr) throw uerr;
    return new Response(JSON.stringify({ ok: true, step }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}

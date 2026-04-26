## Goal

Upgrade the AI blog generator (`supabase/functions/generate-blog-post/index.ts`) so every article:

1. **Is AEO-optimized**: answers the core question fully in the first ~400 words, then transitions into a natural CTA linking to the most relevant ReviewThenGo tool.
2. **Uses our own tools as the primary research source** when the topic is about a hotel, packing/gear, best time to visit, safety, visa/entry, currency, or itinerary, instead of relying on a single generic Perplexity research blob.

## Critical lens / pushback before building

A couple of things worth flagging before we change the function:

- **Hard "first 400 words" rules backfire if applied blindly.** If we force a fully self-contained answer in 400 words for an article like *"10 best things to do in Rome"*, it will feel like the article is over before it starts. The rule should be: **front-load a complete direct answer to the article's core question** (the AEO snippet), not "summarize the entire article in 400 words". I'll write the prompt that way.
- **Avoid CTA fatigue.** If every section ends with "Use ReviewThenGo's [Tool] to…", the article reads like an ad. Plan: exactly **one** prominent in-content CTA after the AEO answer block, plus the existing related-tool internal links naturally woven later. The existing end-of-article `CompassArticleToolsCTA` card stays as the final CTA, so we don't need 3 of them.
- **Tool-as-research has latency + failure cost.** Calling `generate-review` for a hotel article can take 20-40 seconds and occasionally fails. We need: (a) topic detection that only invokes the relevant tool(s), (b) graceful fallback to Perplexity-only research if the tool call errors or times out, (c) parallel calls when more than one tool is relevant.
- **Topic detection should be deterministic, not vibes.** Doing it with another LLM call adds cost and flakiness. I'll use a lightweight classifier: a small Lovable AI tool-call (Gemini Flash) that returns a structured `{ topicType, entities }` object in one cheap call, with regex fallbacks.

If you'd rather skip the LLM classifier and use pure keyword matching (cheaper, dumber), say so and I'll swap it.

## What changes

### 1. New "topic detection" step (before research)

A short Gemini Flash call with tool-calling that returns:

```ts
{
  topicType: "hotel_review" | "gear_packing" | "best_time" | "safety" | "entry_requirements" | "currency" | "itinerary" | "destination_general" | "other",
  primaryEntity: string,        // e.g. "Hyatt Ziva Cancun" or "Bali" or "Japan"
  secondaryEntity?: string,     // e.g. "beach trip" for gear, "USD to JPY" for currency
  primaryTool: { name, path, label } | null,  // best matching tool
  coreQuestion: string,         // The single user question this article answers (for AEO)
}
```

This is one cheap call, ~1s, with a hard timeout fallback to `topicType: "other"`.

### 2. Tool-driven research (replaces / augments Perplexity)

Based on `topicType`, the function invokes the corresponding internal edge function in parallel with Perplexity (kept as supplementary context):

| topicType | Tool invoked | Data fed into article |
|---|---|---|
| hotel_review | `generate-review` | Ratings, summary, pros/cons, things to do |
| gear_packing | `travel-gear-intel` | Recommended gear list + categories |
| best_time | `best-time-intel` | Seasons table, events, avoid months |
| safety | `safety-intel` | Safety scores, scams, emergency numbers |
| entry_requirements | `travel-intel` (type=requirements) | Visa/docs/health |
| currency | `currency-tracker` | Live rate + trend |
| itinerary | `generate-itinerary` | Day-by-day skeleton |
| destination_general / other | Perplexity only (current behavior) | Same as today |

All tool calls run with `Promise.allSettled` and a ~25s per-call timeout. If a tool fails, we log it and fall back to Perplexity-only research, so generation never breaks.

The tool's structured output is serialized into the `RESEARCH DATA` section of the existing AI prompt, replacing/augmenting the Perplexity blob:

```
TOOL RESEARCH (authoritative, prefer these facts):
{toolName}: {JSON of tool output}

SUPPLEMENTARY WEB RESEARCH (use only to add color, never to contradict TOOL RESEARCH):
{perplexity content + citations}
```

This gives us a real moat: ratings, packing lists, season tables, etc., come from our own tools, not scraped from the open web.

### 3. New AEO front-loading rule in the system prompt

Add a non-negotiable structural rule to the existing system prompt:

```
AEO STRUCTURE (NON-NEGOTIABLE):
1. The first heading must be an H2 phrased as the user's core question (e.g. "Is the Hyatt Ziva Cancun Worth It in 2026?").
2. The first 350-450 words after that H2 must be a complete, plain-text answer to the core question. No bullet lists. No marketing fluff. This is what AI search engines will quote.
3. After that answer block, insert exactly ONE transition sentence + CTA in this format, on its own paragraph:
   "Want a personalized answer? Use ReviewThenGo's [Tool Label](/tool-path) to {benefit} in seconds."
4. Then continue with the rest of the article (deep-dive sections, comparisons, FAQ, etc.).
```

The `coreQuestion` and `primaryTool` from step 1 are passed into the prompt so the model has the exact heading and CTA target.

### 4. Post-processing guardrails

After the AI returns the structured article, we verify:

- The first content block is a heading that contains a `?`. If not, log a warning (don't fail).
- The text blocks before the first non-AEO heading total ≥300 words. If not, log a warning.
- Exactly one occurrence of the CTA phrase pattern `Use ReviewThenGo's ... to ... in seconds`. Strip duplicates if the model overshoots.
- Existing em-dash / empty-anchor / affiliate-link guardrails stay unchanged.

### 5. No frontend changes required

`BlogPostCreator.tsx` keeps the same payload. The new logic is fully server-side. Optional follow-up: surface a small "Tool used as source: X" label in the editor — easy add if you want it.

## Technical details (for the code change)

- File: `supabase/functions/generate-blog-post/index.ts` (single file edit, ~120 new lines).
- Add helper `detectTopic(prompt)` → Lovable AI Gemini Flash tool call, 6s timeout, falls back to `{ topicType: "other" }`.
- Add helper `runToolResearch(topicType, entities)` → invokes the matching edge function via `fetch` to `https://${PROJECT_REF}.supabase.co/functions/v1/${name}` using `SUPABASE_SERVICE_ROLE_KEY`. 25s timeout, returns `null` on failure.
- Insert tool research block above existing `RESEARCH DATA` in the user message.
- Append AEO STRUCTURE block to the system prompt.
- Pass `coreQuestion` and `primaryTool` into the user message so the model uses them verbatim in the H2 + CTA.
- Add the post-processing CTA-dedupe and AEO-shape soft validators.
- Logging at every step (`console.log("Topic detected:", ...)`, `console.log("Tool research:", toolName, ok)`).

## Out of scope

- Changing the blog editor UI.
- Backfilling old articles.
- Adding new tools to the directory.

If you approve, I'll implement this in one pass and confirm with a redeploy of `generate-blog-post`.
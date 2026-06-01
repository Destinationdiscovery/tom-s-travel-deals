# Compass Newsletter: Delete + Anti-Empty Prompts

Two fixes to `CompassDashboard.tsx` and `supabase/functions/generate-compass-edition/index.ts`.

## 1. Delete editions

**File:** `src/components/dashboard/compass/CompassDashboard.tsx`

- Add a trash icon button to each row in the editions table, next to Duplicate.
- Wrap in `AlertDialog` confirmation ("Delete edition #N? This cannot be undone.").
- On confirm: `supabase.from("compass_editions").delete().eq("id", id)`, toast success, reload list.
- Admin RLS already allows DELETE; no migration needed.

## 2. Rewrite prompts so sections never come back empty

**Problem:** Current prompts let the model say "no reviews available" or return empty arrays for steps 6 (flight deals), 7 (honest hotel pick), and 8 (travel intel). These three already call Perplexity Sonar, which always finds something. The fix is in the prompt language plus stricter fallback behavior.

**File:** `supabase/functions/generate-compass-edition/index.ts`

Rewrite the three research prompts with these new rules baked in:

- **Universal rule (added to all Perplexity prompts):** "You have live web search. You MUST return real, specific results. Never say 'no data', 'no reviews available', 'information not found', or return empty arrays. If your first search yields nothing, broaden the query (nearby city, similar property class, comparable route, regional news) and return the best real data you can find. Every field must be populated with a real, current, verifiable answer."

- **Step 6 (flights):** require at least 3 real deals. If no current sale to the exact destination, return the cheapest current published fares from major US/Canadian hubs to that destination plus 2 comparable regional routes. Never "no deals found".

- **Step 7 (hotel):** require one well-reviewed property in the destination region with aggregated traveller sentiment from TripAdvisor, Google, Booking.com, and Reddit. If the exact destination has thin coverage, pick the most reviewed notable property within 100 km and label location accordingly. `what_reviewers_love` must have 3 items, `what_reviewers_flag` must have 2, `reddit_consensus` must be a real sentence. Never empty.

- **Step 8 (travel intel):** require 3 to 4 real news items from the past 2 weeks. If destination-specific news is thin, broaden to regional or global traveller-relevant news (advisories, airline policy, visa rules, currency shifts). Never fewer than 3 items.

- **Step 9 (final assembly):** add instruction "Never write phrases like 'no reviews found', 'data unavailable', 'no current deals'. If a research field looks thin, write around it using what is available. Always present confident, specific copy."

- **Fallback hardening:** change the `runStep` fallbacks for steps 6, 7, 8 so that on failure the orchestrator retries Perplexity once with a broader query (drop `search_recency_filter`, widen scope to country/region) before accepting an empty fallback. If still empty, omit the section header in step 9 rather than render an empty block.

No schema changes, no new tools. Only prompt text, one retry helper, and the delete UI.

## Technical notes

- Delete uses existing admin RLS policy (`ALL` on `compass_editions`).
- Retry helper: a small `callPerplexityWithRetry(prompt, recency)` that runs once, checks the parsed JSON has the required non-empty fields, and if not re-runs without recency filter and with a broadened prompt suffix.
- No changes to Gemini-only steps (1, 2, 5, 9, 10) beyond the step-9 anti-empty clause.

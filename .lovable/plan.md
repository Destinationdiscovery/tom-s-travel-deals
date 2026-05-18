
## Goal

Stop paying Perplexity for repeat searches, and stop paying at all for queries that don't need live web data.

## Part 1 — Cache every AI tool search (7-day TTL)

Today only 3 of 9 AI functions cache results. Add a shared cache pattern to the rest. Caches are global (any user benefits from any prior user's identical search), keyed by normalized query.

### New table: `tool_search_cache`

```
- id           uuid
- tool_name    text       (best_time | itinerary | safety | flights | currency | travel_search | gear_intel)
- cache_key    text       (lowercased + trimmed query + tool_name)
- query        text       (original)
- result_data  jsonb
- created_at   timestamptz
- expires_at   timestamptz
- hit_count    int        (for analytics, increments on read)

Unique index on (tool_name, cache_key)
Index on expires_at (for cleanup)
RLS: public SELECT (read), no public writes — edge functions write via service role.
```

TTLs per tool:
- Best Time, Itinerary, Safety, Travel Search, Gear Intel → **7 days**
- Flights → **1 hour** (prices move)
- Currency → **1 hour** (rates move)

### Edge function changes

Each function gets a small `checkCache(toolName, key)` / `writeCache(...)` helper using the service role client. Flow:
1. Normalize query → `cache_key`
2. SELECT where `expires_at > now()`. Hit → return immediately, increment `hit_count`, set response header `X-Cache: HIT`.
3. Miss → call AI, write result with `expires_at = now() + interval`.

Functions to update: `best-time-intel`, `safety-intel`, `generate-itinerary`, `flight-deals`, `currency-tracker`, `travel-search`. (`travel-gear-intel`, `travel-intel`, `generate-review` already cache — leave them; optionally migrate to the unified table later.)

`dashboard-search` (admin streaming chat) stays uncached — it's conversational and admin-only.

### Per-user search history (bonus)

Optional small table `user_tool_searches` (user_id, tool_name, query, created_at) so logged-in users can see "Recent searches" and re-open prior results without re-querying. Cheap, optional.

## Part 2 — Move evergreen tools off Perplexity

Replace Perplexity with **Lovable AI Gateway → `google/gemini-2.5-flash`** for:

1. **Best Time to Visit** (`best-time-intel`) — Full swap. Climate, seasons, events are stable knowledge. Gemini has it.
2. **Itinerary Generator** (`generate-itinerary`) — Full swap. Activity recommendations are evergreen.
3. **Safety** (`safety-intel`) — **Hybrid**: Gemini Flash returns the baseline scores, scams, emergency numbers, areas (stable). Keep one Perplexity call for the `travelAdvisory` field only (this changes). Or simpler: Gemini-only, with a small "Advisory levels can change. Check your government's travel site." disclaimer card. Recommend the simpler version unless you want the live advisory text.

Stays on Perplexity (needs live data + citations):
- Currency, Flights, Travel Search, Travel Intel (visa/news), Generate Review, Gear Intel, Compare Reviews, Dashboard Search.

### Implementation pattern

Each migrated function uses the Lovable AI Gateway via the OpenAI-compatible adapter (already documented in project knowledge). Same JSON schema response. No client changes needed — response shape stays identical. We just drop the `citations` field for Gemini-backed tools (or set empty array) and the UI already handles that.

## Expected impact

Rough estimate, depends on traffic:
- Caching alone: 60-80% reduction in Perplexity calls once cache warms up (travel queries are heavily power-law distributed — "Tokyo", "Paris" etc. dominate).
- Model swap on Best Time + Itinerary + Safety: those three tools become essentially free (Gemini Flash is ~1/20th the cost and you have $1/month free balance).
- Combined: likely 85%+ reduction in Perplexity spend.

## File changes

**Migration (new table + RLS):**
- `tool_search_cache` table with policies

**Edge functions edited:**
- `supabase/functions/best-time-intel/index.ts` — Gemini Flash + cache
- `supabase/functions/safety-intel/index.ts` — Gemini Flash + cache (with disclaimer)
- `supabase/functions/generate-itinerary/index.ts` — Gemini Flash + cache
- `supabase/functions/flight-deals/index.ts` — cache only (1h)
- `supabase/functions/currency-tracker/index.ts` — cache only (1h)
- `supabase/functions/travel-search/index.ts` — cache only (7d)
- New shared helper inlined in each (no shared dir per Lovable convention)

**No frontend changes required.** Response shapes stay the same. Optionally add a tiny "Cached result" badge on the UI later.

## Risks

- Gemini may be slightly less current on niche destinations than Perplexity. Mitigation: 7-day cache means rare destinations rarely re-query anyway; Best Time data is genuinely stable.
- Safety scores without a live advisory could feel stale. Mitigation: add a small "Verify current advisory at [gov link]" line in the Safety result card.
- Cache invalidation: if AI prompt is changed, old cached rows become stale. Mitigation: include a `prompt_version` in `cache_key` (e.g. `best_time:v2:tokyo`) so bumping a version naturally invalidates.

Approve and I'll implement.

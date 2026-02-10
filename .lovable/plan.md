

# Travel Intel: Requirements, Advisories & News

A new `/travel-intel` page combining visa/entry requirements, travel advisories, and destination news -- all powered by the existing Perplexity API connection.

---

## What Gets Built

### 1. Edge Function: `travel-intel`

A new backend function at `supabase/functions/travel-intel/index.ts` that accepts a JSON body with `citizenship`, `destination`, and `type` (one of `"requirements"`, `"advisories"`, or `"news"`).

Each type uses a different Perplexity prompt:

| Type | Model | Prompt Focus | Recency Filter |
|------|-------|-------------|----------------|
| `requirements` | `sonar` | Visa types, documents, health requirements, customs rules, local laws | None (evergreen) |
| `advisories` | `sonar` | Government travel advisories, safety alerts, health warnings, risk level | `month` |
| `news` | `sonar` | Latest travel news, trending stories, destination updates | `week` |

All responses return structured JSON with citations from Perplexity. The function includes a simple in-database cache (`travel_intel_cache` table) with a 7-day TTL to avoid redundant API calls.

**Structured output format per type:**

- **Requirements**: `{ visaRequired, visaTypes[], documents[], healthRequirements[], customsRules[], localLaws[], importantNotes[] }`
- **Advisories**: `{ advisoryLevel (1-4 with color), advisories[{ source, level, summary, details }], healthAlerts[], safetyTips[] }`
- **News**: `{ articles[{ title, summary, source, date, category }] }`

---

### 2. Database: `travel_intel_cache` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto-generated |
| `cache_key` | text | Unique, e.g. `"requirements:canada:cuba"` |
| `intel_type` | text | `requirements`, `advisories`, or `news` |
| `citizenship` | text | Nullable (only for requirements) |
| `destination` | text | |
| `result_data` | jsonb | Full Perplexity response |
| `created_at` | timestamptz | Default `now()` |

RLS: public SELECT only (same pattern as `cached_reviews`). Inserts happen via service role in the edge function.

---

### 3. Frontend: `/travel-intel` page

**File:** `src/pages/TravelIntel.tsx`

Layout follows the existing site patterns (Header + hero + content + Footer):

- **Hero section** with a travel-themed background and the headline "Travel Intel"
- **Three-tab interface** using existing Radix tabs: Requirements | Advisories | News
- **Requirements tab**: Two inputs (citizenship country + destination country) and a "Check Requirements" button
- **Advisories tab**: Single destination input and a "Check Advisories" button
- **News tab**: Single destination input and a "Get Latest News" button
- Results render below the form in styled cards matching the site's design system
- Each section reuses the `ReviewLoadingStages`-style staged loading (simpler version with 2-3 stages)
- Citations displayed as source links at the bottom of results

---

### 4. Navigation Update

Add "Travel Intel" link to both desktop and mobile nav in `Header.tsx`, and to the hero nav links in `HeroSection.tsx`.

---

### 5. Config Update

Add the new edge function to `supabase/config.toml`:
```toml
[functions.travel-intel]
verify_jwt = false
```

---

## Files

| Action | File |
|--------|------|
| Create | `supabase/functions/travel-intel/index.ts` |
| Create | `src/pages/TravelIntel.tsx` |
| Create | `src/hooks/useTravelIntel.ts` |
| Modify | `src/App.tsx` -- add `/travel-intel` route |
| Modify | `src/components/Header.tsx` -- add nav link |
| Modify | `src/components/HeroSection.tsx` -- add hero nav link |
| Modify | `supabase/config.toml` -- register function |
| Migration | Create `travel_intel_cache` table with RLS |

---

## Technical Details

- The edge function follows the exact same pattern as `generate-review`: CORS headers, Perplexity API call, cache-first strategy, service role for DB writes
- The `PERPLEXITY_API_KEY` secret is already configured -- no new secrets needed
- Input validation: citizenship and destination are trimmed, length-checked (2-100 chars), and sanitized before being passed to the prompt
- The hook (`useTravelIntel.ts`) manages loading state, error handling, and calls `supabase.functions.invoke("travel-intel", { body: ... })`
- News results use `search_recency_filter: 'week'` to ensure freshness
- Advisory levels are color-coded: Level 1 (green), Level 2 (yellow), Level 3 (orange), Level 4 (red)


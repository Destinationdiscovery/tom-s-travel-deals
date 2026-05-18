# Admin Access (quick reference)

1. Click the **compass icon** in the site header (top right area).
2. Sign in with your admin email/password in the popover.
3. Go to **`/gear-admin`** ("Agent HQ"). The sidebar has the Site Analytics tab where new stats will live.

Only `jclindustries@outlook.com` (in `user_roles` as `admin`) can access it.

# Stats to add

Extending **`SiteAnalyticsDashboard`** with three new sections, plus a small data-logging addition so per-tool searches are actually countable.

## 1. Registered Users
- **Total signups** (count of `profiles`)
- **New this week / last 30 days** (filtered by `profiles.created_at`)
- **Daily signup line chart** for the selected time range
- New summary card: "Registered Users"
- New tab: **Users** with the trend chart and a small table of recent signup dates

Source: `profiles` table (already has `created_at`). No schema change needed.

## 2. Tool Searches (per tool)
Currently `tool_search_cache` stores one row per unique query with a `hit_count`. That gives us cache size but not how many times users actually triggered each tool, and time filtering is awkward.

**Add a lightweight events table** `tool_search_events`:
- `tool_name` (text), `query` (text), `cache_hit` (bool), `created_at`

Each tool edge function (`best-time-intel`, `generate-itinerary`, `safety-intel`, `travel-search`/gear, `currency-tracker`, `flight-deals`) will insert one row per call. Admin-only RLS for SELECT; service-role inserts.

Dashboard additions:
- New summary card: **Tool Searches** (total in range)
- New **Tools** tab with:
  - Bar chart: searches per tool
  - Stacked bar: cache hits vs misses per tool (shows cost savings)
  - Top 10 queries per tool
  - Daily search trend line

## 3. Review Generations & Views
- **Review generations**: count of `cached_reviews` rows (new this week, total). Daily trend from `cached_reviews.created_at`.
- **Review views**: already shown. Add a small "Top generated reviews this period" list alongside top viewed.
- New summary card: **Reviews Generated**

# Placement

All three sit inside the existing `SiteAnalyticsDashboard` component:
- Three new summary cards added to the top grid (grid auto-expands to ~11 cards, will become `lg:grid-cols-6` rows)
- Three new tabs: **Users**, **Tools**, **Reviews** (alongside existing Views/Clicks/Searches/Platforms/Reactions/Subscribers/Performance)
- All respect the existing time-range filter (Today / 7d / 30d / All)

# Technical changes

```text
DB migration:
  - CREATE TABLE public.tool_search_events
      (id, tool_name, query, cache_hit, created_at)
  - RLS: admin SELECT only (service role inserts bypass RLS)
  - Index on (tool_name, created_at)

Edge functions (6 files, ~3 lines each):
  - best-time-intel, generate-itinerary, safety-intel,
    travel-search, currency-tracker, flight-deals
  - After cache check, insert into tool_search_events
    with cache_hit boolean

Frontend:
  - src/components/dashboard/SiteAnalyticsDashboard.tsx
    - Add 3 queries (profiles, tool_search_events, cached_reviews)
      to the Promise.all in fetchAll
    - Add state for signupCount, recentSignups, dailySignups,
      toolSearchTotals, toolDailyTrend, reviewGenCount, reviewGenTrend
    - Add 3 summary cards
    - Add 3 TabsTrigger + TabsContent blocks
```

No changes to existing tabs or to the auth flow. Refresh interval and time filter logic stay as-is.

# Out of scope (ask if wanted)
- Per-user activity (which user ran which search). Tools are anonymous today.
- Funnel: signup to first search to first save. Possible later once events table exists.
- Email export of registered users.

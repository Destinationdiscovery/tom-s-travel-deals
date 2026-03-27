

# Analytics Enhancements + Blog Hero Image Change

## 1. Exclude Dashboard Views from Analytics

**Problem**: Admin browsing the dashboard triggers page view tracking, inflating stats.

**Fix in `supabase/functions/track-review-view/index.ts`**: Add a bot detection + dashboard exclusion check before inserting view events:
- Reject slugs starting with `gear-admin` or `dashboard`
- Check `User-Agent` against common bot patterns (Googlebot, bingbot, Bytespider, AhrefsBot, SemrushBot, etc.) — if bot detected, skip the insert and return success silently

## 2. Session Tracking, Duration, and Bounce Rate

**Problem**: No session data exists — can't track unique sessions, time on site, or bounce rate.

### Database Migration
Create a `sessions` table:
```sql
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  first_page text NOT NULL,
  page_count integer DEFAULT 1,
  started_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  duration_seconds integer DEFAULT 0,
  is_bounce boolean DEFAULT true
);
CREATE INDEX idx_sessions_started_at ON public.sessions(started_at);
CREATE INDEX idx_sessions_session_id ON public.sessions(session_id);
```
RLS: read-only for authenticated (admin), insert/update via service role in edge function.

### Edge Function Update (`track-review-view`)
Add a `session` action that:
- Receives `session_id`, `page`, `duration` from the client
- Upserts the session row: increment `page_count`, update `last_activity_at` and `duration_seconds`
- Set `is_bounce = false` when `page_count > 1`

### Client-Side Session Tracking
Create `src/lib/sessionTracker.ts`:
- Generate a session ID (sessionStorage-based, same as existing `rtg-session-id`)
- On each page navigation, send a heartbeat to the edge function with page slug and accumulated duration
- Use `visibilitychange` and `beforeunload` events to send final duration
- Skip tracking when path starts with `/gear-admin`

Initialize in `src/main.tsx`.

### Dashboard Display
Add a **Sessions** summary card to the Views tab in `SiteAnalyticsDashboard.tsx`:
- Total sessions, avg duration, bounce rate (% of sessions with `page_count = 1`)
- Query the `sessions` table with same time-range filter

## 3. Bot Filtering

In the edge function, before inserting any view event, check `User-Agent`:
```
const BOT_PATTERNS = /bot|crawl|spider|slurp|mediapartners|adsbot|ahref|semrush|bytespider|gptbot|claude/i;
```
If matched, return success but don't insert. This applies to all view tracking, not just the new session tracking.

## 4. Blog Hero Image Change

**Problem**: You don't like the cherry blossoms hero image on the Compass/Blog page.

**Fix**: Replace the import in `src/pages/Compass.tsx` from `japan-cherry-blossoms.webp` to `hero-tripreviews.jpg` — a travel-themed hero image already in the assets folder. Update the alt text accordingly.

## Files

| File | Change |
|------|--------|
| DB migration | Create `sessions` table |
| `supabase/functions/track-review-view/index.ts` | Bot filtering, dashboard exclusion, session upsert action |
| `src/lib/sessionTracker.ts` | New — client-side session heartbeat |
| `src/main.tsx` | Initialize session tracker |
| `src/components/dashboard/SiteAnalyticsDashboard.tsx` | Add sessions/bounce rate/avg duration cards |
| `src/pages/Compass.tsx` | Swap hero image import |

## Build Order
1. Database migration (sessions table)
2. Edge function (bot filter + dashboard exclusion + session action)
3. Session tracker client lib + main.tsx init
4. Dashboard sessions display
5. Blog hero image swap


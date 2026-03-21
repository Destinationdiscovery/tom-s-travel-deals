

# Expand Site Activity into Full Analytics Dashboard

## Current State
The `SiteActivityWidget` is a small card with 3 tabs (Searches, Clicks, Views) showing top-10 lists. The data sources are:
- `search_suggestions` (name, search_count)
- `affiliate_clicks` (platform, page, position, user_agent, country, created_at)
- `review_views` (slug, view_count, last_viewed_at)
- `web_vitals` (metric_name, value, page, created_at)
- `review_reactions` (slug, reaction, session_id, created_at)
- `subscribers` (email, source_slug, interests, created_at)

## Plan: Replace Small Widget with Full-Page Analytics Section

Replace `SiteActivityWidget` with a new `SiteAnalyticsDashboard` component that takes the full width of the dashboard (not squeezed into a 2-col grid). It becomes its own rich section with multiple sub-panels.

### New Component: `src/components/dashboard/SiteAnalyticsDashboard.tsx`

**Summary Stat Cards Row** (top of section):
- Total Page Views (sum of all review_views.view_count)
- Total Affiliate Clicks (count of affiliate_clicks)
- Total Searches (sum of search_suggestions.search_count)
- Subscribers Count (count of subscribers)
- Total Reactions (count of review_reactions)

**Tabs with 7 views:**

1. **Views** (existing, enhanced)
   - Top 10 most-viewed properties (existing)
   - Bar chart showing view distribution across top properties
   - "Last viewed" timestamp for each

2. **Clicks** (existing, enhanced)
   - Clicks by page (existing)
   - Clicks by platform (Expedia, VRBO, etc.) with counts
   - Clicks by position (sidebar, footer, inline CTA, etc.)
   - Daily click trend (group by date from created_at, last 30 days line chart)

3. **Searches** (existing, enhanced)
   - Top searched terms (existing)
   - Total unique search terms count

4. **Platforms** (NEW)
   - Group affiliate_clicks by `platform` column
   - Shows which affiliate partner gets the most clicks (Expedia vs VRBO vs Hotels.com etc.)
   - Pie-chart-style breakdown using simple colored bars

5. **Reactions** (NEW)
   - Group review_reactions by reaction type (thumbs up, fire, etc.)
   - Show which properties get the most engagement
   - Top reacted slugs

6. **Subscribers** (NEW)
   - Total count + recent signups (last 7 days)
   - Signups by source_slug (which page drove the signup)
   - Interests breakdown

7. **Performance** (NEW)
   - Web Vitals averages: LCP, CLS, INP, TTFB
   - Grouped by page (which pages are slowest)
   - Color-coded: green (good), amber (needs improvement), red (poor) based on Google thresholds

### Update: `src/components/dashboard/DashboardOverview.tsx`
- Remove `SiteActivityWidget` from the 2-col grid with `ClientInsights`
- Add `SiteAnalyticsDashboard` as a full-width section between the Charts Row and the Intel Pinboard row
- Keep `ClientInsights` in its own row or merge into the pinboard row

## Files

| File | Action |
|------|--------|
| `src/components/dashboard/SiteAnalyticsDashboard.tsx` | New full analytics component |
| `src/components/dashboard/DashboardOverview.tsx` | Replace SiteActivityWidget with new component, reflow layout |
| `src/components/dashboard/SiteActivityWidget.tsx` | Delete (replaced) |

## Build Order
1. Create `SiteAnalyticsDashboard.tsx` with all 7 tabs + summary cards
2. Update `DashboardOverview.tsx` layout
3. Remove old widget file


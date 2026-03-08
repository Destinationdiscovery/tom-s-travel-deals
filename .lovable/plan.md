

# Dashboard Enhancement Plan — All 8 Widgets

## Overview

Enhance `DashboardOverview.tsx` with 8 new widgets/improvements, keeping all existing functionality. No new database tables needed for most — we leverage existing data. One new table for Quick Links, one for the Pinboard.

## 1. Visual Refresh

Upgrade stat cards to match the dark card aesthetic from your reference screenshots:
- Gradient accent borders (left-side color bar per card)
- Slightly larger icons with subtle glow backgrounds
- Tighter spacing, more contrast on numbers
- Section dividers between widget groups

**File:** `DashboardOverview.tsx` — restyle existing cards with accent borders and improved typography.

## 2. Conversion Funnel

A horizontal funnel showing: **Quotes → Sent → Booked → Departed**

Data source: `client_quotes` (status field has draft/sent/booked) + `bookings` (departed = past trip_start events).

Display as a stepped bar or funnel graphic with counts and percentages at each stage.

**File:** New component `DashboardFunnel.tsx`, rendered in `DashboardOverview.tsx`.

## 3. Revenue Over Time Chart

Monthly bar chart comparing Quoted vs Booked revenue over the last 6-12 months.

Data source: `client_quotes` — group by `created_at` month, sum `total_price`, split by status.

Uses recharts (already installed).

**File:** New component `RevenueChart.tsx`, rendered in `DashboardOverview.tsx`.

## 4. Configurable Quick Links

Replace the hardcoded Quick Links section with a database-backed list. You can add/edit/remove supplier portal links (Sirev, Expedia TAAP, Air Canada, Sunwing, etc.) from the dashboard itself without code changes.

**New table:** `agent_quick_links` (id, label, url, icon_name, sort_order, created_at)
- RLS: admin-only CRUD
- Pre-seed with current 3 links

**Files:**
- DB migration for `agent_quick_links`
- New component `QuickLinksManager.tsx` (inline edit mode)
- Update `DashboardOverview.tsx` to fetch from DB

## 5. Agent Intel Pinboard

A simple sticky-note widget where you can manually pin travel news, reminders, or intel. Not an RSS feed — just your own notes that persist.

**New table:** `agent_notes` (id, content, color, is_pinned, created_at)
- RLS: admin-only CRUD
- Max ~20 notes displayed

**Files:**
- DB migration for `agent_notes`
- New component `AgentPinboard.tsx`
- Rendered in `DashboardOverview.tsx`

## 6. Destination Advisory Flags (Quote Builder)

Add an optional "Travel Advisory" toggle in the Quote Builder. When enabled, lets you type a short advisory note (e.g., "Hurricane season — travel insurance recommended") that appears as a highlighted banner in the generated quote.

**No new table** — store as a field in the quote generation request body and include in the AI prompt output.

**Files:**
- `QuoteBuilder.tsx` — add advisory text input + toggle
- `generate-quote/index.ts` — include advisory in prompt when provided

## 7. Site Activity Widgets (Two Mini-Widgets)

### 7a. "What Visitors Search" 
Query `search_suggestions` ordered by `search_count` desc, top 10. Shows what people are typing into your site's search bar.

### 7b. "What Visitors Click"
Query `affiliate_clicks` grouped by `page`, top 10. Shows which pages drive the most affiliate engagement.

Also show `review_views` top 5 most-viewed reviews.

All three data sources already exist and are populated.

**File:** New component `SiteActivityWidget.tsx` with tabs for Searches / Clicks / Views. Rendered in `DashboardOverview.tsx`.

## 8. Repeat Client Rate KPI

Query `client_quotes` grouped by `client_name`, count how many clients have 2+ quotes. Display as:
- "X% repeat clients" gauge/badge
- Total unique clients count
- Top repeat clients list (name + quote count)

**No new table** — pure query on `client_quotes`.

**File:** New component `ClientInsights.tsx`, rendered in `DashboardOverview.tsx`.

---

## New Database Tables

### `agent_quick_links`
```sql
CREATE TABLE agent_quick_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  icon_name text DEFAULT 'ExternalLink',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agent_quick_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage quick links" ON agent_quick_links FOR ALL
  TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

### `agent_notes`
```sql
CREATE TABLE agent_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  color text DEFAULT 'default',
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agent_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage notes" ON agent_notes FOR ALL
  TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

## Files Summary

| File | Action |
|------|--------|
| `DashboardOverview.tsx` | Restyle cards, integrate all new widgets |
| `DashboardFunnel.tsx` | New — conversion funnel |
| `RevenueChart.tsx` | New — monthly revenue bar chart |
| `QuickLinksManager.tsx` | New — DB-backed quick links with inline edit |
| `AgentPinboard.tsx` | New — sticky notes widget |
| `SiteActivityWidget.tsx` | New — searches/clicks/views tabs |
| `ClientInsights.tsx` | New — repeat client KPI |
| `QuoteBuilder.tsx` | Add advisory toggle + text input |
| `generate-quote/index.ts` | Include advisory in prompt |
| DB migration | Two new tables |

## Implementation Order

I'd suggest building in this order to see progress quickly:
1. Visual refresh (immediate visual impact)
2. Revenue chart + Funnel (uses existing data, no migrations)
3. Client insights KPI (existing data)
4. Site activity widget (existing data)
5. Quick Links + Pinboard (require migrations)
6. Advisory flags in quotes (edge function update)

This keeps the first 4 items deployable without any database changes.


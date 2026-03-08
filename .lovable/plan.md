

# Dashboard Overhaul Plan

## Summary

Eight changes: add Travel Intel search to dashboard, rename Blog to Content Studio, remove Deal Maker, add client notes, remove Revenue tab, and apply the dark card UI refresh to all remaining tabs. Also group the three marketing managers (Featured Deals, Banner Deals, Featured Reviews) under a "Marketing" section header in the sidebar for cleaner navigation.

## Changes

### 1. Sidebar Updates (`DashboardSidebar.tsx`)
- Remove `"deals"` (Deal Maker) and `"revenue"` from tabs array and `DashboardTab` type
- Rename `"blog"` label from "Blog" to "Content Studio" (keep `BookOpen` icon or switch to `Palette`/`PenTool`)
- Add a visual section divider before the marketing group (Featured Deals, Banner Deals, Featured Reviews, Featured Gear) with a small "SITE MANAGEMENT" label
- Add a divider before the CRM group (Quote Builder, Clients, Bookings, Calendar, Emails) with "CRM" label

### 2. Remove Deal Maker
- Remove `DealMaker` import and rendering from `GearAdmin.tsx`
- Delete `src/components/dashboard/DealMaker.tsx`

### 3. Remove Revenue Tab
- Remove `RevenueInsights` route from `App.tsx`
- Delete `src/pages/RevenueInsights.tsx`
- The revenue data is already shown in the dashboard overview via `RevenueChart.tsx`

### 4. Travel Intel Search on Dashboard (`DashboardOverview.tsx`)
- Add a compact "Quick Intel Lookup" card with a single destination input, a dropdown for type (Requirements / Advisories / News), and a Search button
- Uses the existing `useTravelIntel` hook
- Results render inline using the existing `IntelResults` components (`RequirementsResult`, `AdvisoriesResult`, `NewsResult`)
- Citizenship field shown only when "Requirements" is selected

### 5. Client Notes (`ClientList.tsx`)
- Add a `notes` textarea field to the Add Client dialog (already exists as `newNotes`)
- In the expanded client view, show a persistent "Notes" section with an inline-editable textarea
- Notes are stored on the `client_quotes` table's existing `notes` field (on the "General Inquiry" placeholder quote created when adding a client)
- No schema change needed

### 6. UI Refresh — All Tabs
Apply the same dark card aesthetic (gradient accent left-border, glow icons, section headers) to:

| Tab | File | Key Changes |
|-----|------|-------------|
| Quote Builder | `QuoteBuilder.tsx` | Accent-bordered section cards, styled step indicators |
| Clients | `ClientList.tsx` | Accent-bordered client cards, improved expanded view |
| Bookings | `BookingManager.tsx` | Status badges with accent colors, styled table headers |
| Calendar | `BookingCalendar.tsx` | Styled month header, accent-colored event dots |
| Emails | `EmailComposer.tsx` | Accent-bordered compose card, styled email log |
| Content Studio | `BlogPostCreator.tsx` | Accent-bordered editor card, styled post list |
| Featured Deals | `FeaturedDealsManager.tsx` | Styled slot cards |
| Banner Deals | `BannerDealsManager.tsx` | Styled slot cards |
| Featured Reviews | `FeaturedReviewsManager.tsx` | Styled slot cards |
| Featured Gear | `GearImageManager.tsx` | Styled slot cards |

The refresh pattern for each: wrap main cards with `border-l-4 border-l-{accent}` classes, add consistent section headers (`font-display text-2xl font-bold`), and use the same glow-icon pattern from the dashboard overview.

### 7. Sidebar Section Labels
Group tabs visually:

```text
── Agent HQ ──────────
  Dashboard

── CRM ───────────────
  Quote Builder
  Clients
  Bookings
  Calendar
  Emails

── SITE MANAGEMENT ───
  Content Studio
  Featured Deals
  Banner Deals
  Featured Reviews
  Featured Gear
```

## Files Modified

| File | Action |
|------|--------|
| `DashboardSidebar.tsx` | Remove deals/revenue, rename blog, add section labels |
| `GearAdmin.tsx` | Remove DealMaker import/render, remove revenue |
| `App.tsx` | Remove `/admin/revenue` route |
| `DashboardOverview.tsx` | Add Travel Intel search widget |
| `ClientList.tsx` | Add inline notes display/edit in expanded view |
| `DealMaker.tsx` | Delete file |
| `RevenueInsights.tsx` | Delete file |
| `QuoteBuilder.tsx` | UI refresh |
| `BookingManager.tsx` | UI refresh |
| `BookingCalendar.tsx` | UI refresh |
| `EmailComposer.tsx` | UI refresh |
| `BlogPostCreator.tsx` | UI refresh |
| `FeaturedDealsManager.tsx` | UI refresh |
| `BannerDealsManager.tsx` | UI refresh |
| `FeaturedReviewsManager.tsx` | UI refresh |
| `GearImageManager.tsx` | UI refresh |

## Implementation Order

1. Sidebar restructure + remove Deal Maker + Revenue (structural cleanup first)
2. Travel Intel widget on dashboard
3. Client notes feature
4. UI refresh across all tabs (batch)

No database migrations needed.


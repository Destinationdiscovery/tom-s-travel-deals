

# Fix Quote Preview Sidebar & Upgrade Embedded Review

## Problem 1: Sidebar visible in preview/print
The dashboard sidebar shows alongside the quote preview (step 4) and appears in the printed PDF. The quote preview should take the full width without the sidebar.

## Problem 2: Review looks too simple
The current `QuoteReviewSection` is a condensed flat list. You want it to match the rich layout from the client-facing review page (photos, ratings card, location map, what travelers say, things to do, travel tips, best for tags) -- minus all affiliate links, "Ready to Book?" cards, "Search on Expedia" banners, and "Save" buttons.

---

## Changes

### 1. Hide sidebar when on Preview step (`GearAdmin.tsx`)
- When the Quote Builder is on step 4 (Preview), hide the sidebar entirely and let the main content go full-width
- Pass a `fullWidth` flag from `QuoteBuilder` up to `GearAdmin` so it knows to hide the sidebar
- Add `print:hidden` to the sidebar so it never appears in PDF output

### 2. QuoteBuilder tells parent about preview mode (`QuoteBuilder.tsx`)
- Accept an optional `onPreviewMode?: (active: boolean) => void` callback
- Call it whenever `step` changes to/from 4
- GearAdmin uses this to toggle sidebar visibility

### 3. Rebuild `QuoteReviewSection` to match `AIReviewResult` layout (`QuoteReviewSection.tsx`)
Replace the current condensed layout with the full rich review, reusing the same sub-components from `AIReviewResult`:
- **Header**: Property name, location, star rating, "Compiled from Real Traveler Reviews" badge
- **Summary card**: Overall rating stars + summary text (no Expedia banner)
- **Photo gallery**: Using `PhotoGallery` component with lightbox (if `photoReferences` exist in review data)
- **Rating Breakdown card**: With rating bars and "Best For" tags
- **What Travelers Say**: Full paragraphs
- **Things to Do Nearby**: Activity cards with photos (no "Book this" links, no "Explore more" Expedia link)
- **Travel Tips**: Numbered list
- **Location Map**: Embedded Google Maps iframe

**Stripped out** (not shown in quote):
- All `InlineAffiliateCTA` / "Planning a trip?" / "Search on Expedia" banners
- `AffiliateLinks` sidebar ("Ready to Book?" with Expedia, Hotels.com, VRBO links)
- `SaveReviewButton` / "Search Another Property" button
- Any external booking links on Things to Do cards

### 4. Public quote page review (`PublicQuote.tsx`)
- Update `PublicQuote.tsx` to use the same upgraded `QuoteReviewSection` so clients see the rich review too

---

## Technical Details

### `src/pages/GearAdmin.tsx`
- Add `previewMode` state
- Pass `onPreviewMode` to `QuoteBuilder`
- Conditionally hide `DashboardSidebar` when `previewMode` is true
- Add `print:hidden` class to sidebar wrapper

### `src/components/dashboard/QuoteBuilder.tsx`
- Accept `onPreviewMode` prop
- `useEffect` on `step` to call `onPreviewMode(step === 4)`

### `src/components/dashboard/QuoteReviewSection.tsx`
- Full rewrite to render the rich review layout matching `AIReviewResult`
- Import `PhotoGallery` and render photos
- Render `RatingBar` components for rating breakdown
- Render "What Travelers Say" paragraphs
- Render Things to Do cards (without affiliate links)
- Render Travel Tips numbered list
- Render Location Map iframe
- Render "Best For" tags
- Compute `functionUrl` from `VITE_SUPABASE_URL` for photo proxying

### `src/pages/PublicQuote.tsx`
- No structural changes needed -- it already uses `QuoteReviewSection`, so it inherits the upgrade automatically

### Files modified
- `src/pages/GearAdmin.tsx`
- `src/components/dashboard/QuoteBuilder.tsx`
- `src/components/dashboard/QuoteReviewSection.tsx`

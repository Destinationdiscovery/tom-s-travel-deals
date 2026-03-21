

# Next Phase: Date Stamps, Schema, FAQ on Hotel Cards + Sidebar Text Fix

## What's Changing

### 1. Shorten BookingSidebar CTA Text
**File: `src/components/reviews/BookingSidebar.tsx`**
- Change each platform link to just show "Save Now" with an external link icon (instead of verbose taglines like "Bundle hotel + flight")
- Keep affiliate disclosure line

### 2. Date Stamps on Hotel Cards
**File: `src/components/reviews/HotelResultCard.tsx`**
- Add "Reviews as of March 2026" italic gray text below the sources line
- Show source breakdown: "Google · TripAdvisor · Booking.com · VRBO" with simulated per-source scores

### 3. AggregateRating Schema on Reviews Page
**File: `src/pages/Reviews.tsx`**
- Add per-hotel JSON-LD `Hotel` + `AggregateRating` schema blocks injected via `<Helmet>` for each result
- Dynamic: uses each hotel's name, rating, location

### 4. FAQ Accordion on Each Hotel Card
**File: `src/components/reviews/HotelResultCard.tsx`**
- Add a collapsible "Frequently Asked" section below "Worth Booking If" with 3-4 auto-generated Q&As (best time to visit, family or couples, hidden fees, cancellation)
- Uses the existing `Accordion` UI component
- Wrap with FAQPage JSON-LD per card

### 5. Light Mode Palette Tuning
**File: `src/index.css`**
- Adjust `:root` (light mode) CSS variables to match the requested palette:
  - Background: `#F8FAFC` (210 40% 98%)
  - Cards: `#FFFFFF`
  - Primary text: `#1E293B` (222 47% 17%)
  - Primary blue: `#1E3A8A` (224 71% 33%)
  - CTA orange stays (already secondary)
  - Success green / destructive red already set
- Dark mode: no changes (already good)

## Files

| File | Action |
|------|--------|
| `src/components/reviews/BookingSidebar.tsx` | Shorten CTA to "Save Now" |
| `src/components/reviews/HotelResultCard.tsx` | Add date stamp + FAQ accordion |
| `src/pages/Reviews.tsx` | Add per-hotel AggregateRating JSON-LD |
| `src/index.css` | Tune light mode palette |

## Order
1. BookingSidebar text fix
2. HotelResultCard: date stamp + FAQ
3. Reviews.tsx: schema injection
4. index.css: light mode palette




# Professional Trip Details Card in Quote Preview

## What Changes

Replace the current plain layout of trip details (dates, flights, pricing, inclusions, notes) in the Quote Preview and Public Quote with a single, professionally styled "Booking Details" card -- inspired by the Expedia confirmation screenshots you shared. This card sits directly after the review section (below the map), creating one seamless document: review + trip details card.

## Design

The card will feature:
- A colored header bar with the resort name, destination, and room type
- Bordered date boxes in a row: **Check-in** | **Check-out** | **Nights** (like the Expedia date layout)
- Traveller count and room type below dates
- Flight details section (if any flights entered)
- Pricing table with category labels, line items, and bold total row
- Per-person breakdown (when multiple travellers)
- Inclusion badges
- Notes section
- Clean dividers between sections

## Technical Details

### New file: `src/components/dashboard/TripDetailsCard.tsx`

A presentational component that receives `QuoteData` and `totalPrice` and renders the styled card. Uses existing Card/Badge primitives, date-fns for formatting, and Plane/Users/Calendar icons from lucide-react.

### Updated files:

**`src/components/dashboard/QuotePreview.tsx`** -- Replace the existing trip details grid (lines 178-274: dates grid, flights, pricing, inclusions, notes, attachments) with a single `<TripDetailsCard>` component rendered after the review section.

**`src/pages/PublicQuote.tsx`** -- Same replacement: swap the flat details grid, flights, pricing, inclusions, and notes sections with `<TripDetailsCard>`, keeping it consistent with the builder preview.

### What stays the same
- The hero image, header/branding, and review section remain untouched
- The "Valid Until" footer and agent contact info stay at the bottom
- Attachments section stays (moved inside the card)
- All action buttons (Save, Print, Email, Copy Link) remain unchanged


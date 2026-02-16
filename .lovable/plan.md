

# Replace "Recently Reviewed" with "Travel Deals" Section

## Overview

Replace the `RecentlyReviewedSection` component with a new `TravelDealsSection` that displays a hero banner image (the Expedia vacation sale screenshot) linked to the affiliate URL. The white overlay box text will be updated to say "Expedia's Annual Vacation Sale" with the rest of the copy kept as-is.

## Changes

### 1. Copy the uploaded banner image into the project

Copy `user-uploads://Screenshot_from_2026-02-15_21-51-18.png` to `src/assets/deal-expedia-vacation-sale.png` so it can be imported as an ES6 module.

### 2. Rewrite `src/components/RecentlyReviewedSection.tsx` as `TravelDealsSection`

- Remove all the Supabase query logic, star ratings, review cards, etc.
- Replace with a simple section containing:
  - A section title: "Travel Deals"
  - A subtitle: something like "Exclusive deals and savings from our partners"
  - A full-width clickable banner image (rounded corners) that links to `https://expedia.com/affiliate/7ymxnWK` (opens in new tab)
  - A white overlay box positioned bottom-left (matching the reference screenshot) with:
    - Title: **"Expedia's Annual Vacation Sale"**
    - Body: "Members save up to 40% on selected hotels and vacation rentals. Plan this year's big trip and save."
- The entire banner is wrapped in an `<a>` tag so clicking anywhere on it goes to the affiliate link

### 3. Update `src/pages/Index.tsx`

- Change the import from `RecentlyReviewedSection` to `TravelDealsSection`
- Update the JSX reference accordingly
- The conditional rendering logic stays the same (show when no search results are active)

## Technical Details

- The component will import the image via `import dealBanner from "@/assets/deal-expedia-vacation-sale.png"`
- The banner will use `object-cover` for responsive sizing with a max height (~300-350px)
- The white overlay box uses `absolute` positioning within a `relative` container
- `target="_blank"` and `rel="noopener noreferrer"` on the affiliate link
- No database or backend changes needed


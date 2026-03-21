

# Fix Destination Review Cards

## Problem
The "Book on Expedia — Save Now" button text is getting cut off on the left side of the cards in the "Real Destination Reviews" section on the homepage.

## Fix

### `src/components/RecentReviewsHomepage.tsx`
- Shorten button text from "Book on Expedia — Save Now" to "Book on Expedia"
- Add `truncate` class as safety net for long text
- Reduce font size slightly with `text-xs` to prevent overflow on narrow cards


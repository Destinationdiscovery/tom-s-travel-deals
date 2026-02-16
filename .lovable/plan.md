

# Replace Hotels.com Banner Image

## Problem
The current Hotels.com banner has the "save up to 40%" badge cut off even with `object-right` positioning.

## Solution
Replace the banner image file (`src/assets/deal-hotels-spring-sale-banner.png`) with the new uploaded image that shows "Members save up to 40%" fully visible. No code changes needed -- same file name, same sizing.

## Steps
1. Copy `user-uploads://Screenshot_from_2026-02-16_12-05-38.png` to `src/assets/deal-hotels-spring-sale-banner.png`, overwriting the existing file
2. No changes to `TravelDealsSection.tsx` since it already references this file with the correct sizing


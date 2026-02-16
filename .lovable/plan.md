

# Add "ReviewThenGo Deals" Section Header

## Overview
Add a branded section title above the deal banners and restyle the individual deal titles to match site typography.

## Changes

**`src/components/TravelDealsSection.tsx`**
1. Add a new heading at the top of the section: "ReviewThenGo Deals" using the tri-color brand scheme:
   - "Review" in sky-600
   - "Then" in amber-500
   - "Go" in emerald-600
   - " Deals" in standard foreground
   - Uses `font-display text-2xl md:text-3xl font-bold` for prominence

2. Restyle the two existing deal titles ("Expedia's Annual Vacation Sale..." and "Hotels.com Big Spring Sale...") to use `font-display` with a slightly smaller size (`text-base md:text-lg font-semibold text-muted-foreground`) so they sit visually beneath the new section header


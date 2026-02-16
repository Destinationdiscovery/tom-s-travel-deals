

# Add Pricing to Featured Deal Cards

Adding original (crossed-out) and sale prices to each deal card as a visual CTA to drive clicks.

## What Changes

Each deal card will show a price block below the location, displaying:
- The original price in a smaller, crossed-out style (e.g. ~~$289~~)
- The sale price in bold green (e.g. **$189/night**)
- A "View Deal" text prompt beside the price

## Placeholder Prices

| Deal | Original | Sale |
|------|----------|------|
| Temptation Cancun Resort | $389/night | $249/night |
| Hotel Riu Plaza Toronto | $279/night | $179/night |
| OUTRIGGER Honua Kai Resort | $499/night | $329/night |
| Flights to Top Destinations | $650 | $399 |
| Garza Blanca Resort & Spa | $459/night | $299/night |
| Phuket Moonlit Bay Resort | $199/night | $119/night |

You can update these to real prices anytime.

## Technical Details

**File: `src/components/TravelDealsSection.tsx`**

1. Add `originalPrice` and `salePrice` fields to the `FeaturedDeal` interface
2. Populate each deal entry with placeholder pricing
3. Update the card template to render a price row:
   - Original price with `line-through` styling in muted text
   - Sale price in bold `text-emerald-600`
   - A small "View Deal" arrow prompt on the right side

The pricing row will sit below the location text inside each card's padding area, acting as the primary CTA.


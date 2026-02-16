

# Featured Deals Section

## Overview
Add a "Featured Deals" card grid below the Hotels.com banner in the Travel Deals section. Each card displays a cropped resort image, resort name, location, and links to an affiliate URL.

## Layout
- **Desktop (lg+):** 3 cards per row
- **Tablet (md):** 2 cards per row  
- **Mobile:** 1 card per row

This matches the existing Destinations page grid and keeps the layout consistent across the site.

## Card Design
Each card will include:
- A cropped resort image (landscape aspect ratio, ~16:9 or similar)
- Resort/deal name (bold, 1-2 lines)
- Location subtitle
- The entire card is a clickable link to the affiliate URL (opens in new tab)
- Subtle hover effect (scale + shadow lift) matching existing card patterns

## Workflow for Adding Deals
For each deal you want to add:
1. You provide the image file and affiliate link
2. I crop/optimize the image and save it to `src/assets/`
3. I add the deal entry to a data array in the component

## Technical Details

### File changes
- **`src/components/TravelDealsSection.tsx`** -- Add a `featuredDeals` data array and render a responsive grid of deal cards below the existing banners. Each entry contains: `image`, `name`, `location`, `affiliateUrl`.

### Card structure (per card)
```
[  Cropped Resort Image (h-48, object-cover)  ]
[  Resort Name (font-display, bold)            ]
[  Location (text-sm, muted)                   ]
```

- Cards use `rounded-2xl`, `shadow-soft`, `hover:shadow-elevated`, and `hover:-translate-y-1` for the same feel as the destination cards.
- The grid uses `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.

### No new dependencies needed
Uses existing Tailwind utilities and component patterns already in the project.

## Next Steps
Once approved, provide your first deal image + affiliate link and I will set it up. You can add as many deals as you like -- the grid will wrap naturally.


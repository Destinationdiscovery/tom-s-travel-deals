

# Plan: Add Background Images to Travel Intel Cards

## Overview
Add contextually appropriate background images to the three Travel Intel category cards (Entry Requirements, Safety Advisories, Travel News) to make them visually richer.

## Approach
Use stock-style images already in the project assets or source appropriate ones. Each card will have a background image with a dark gradient overlay so the text remains readable.

### Image Choices
- **Entry Requirements**: Use `src/assets/hero-beach.jpg` — evokes travel/destinations (passport + travel vibes)
- **Safety Advisories**: Use `src/assets/snowbird-caribbean-aerial.jpg` — aerial travel view suggesting awareness/overview
- **Travel News**: Use `src/assets/snowbird-times-square.jpg` — busy cityscape suggesting news/activity

### File: `src/components/IntelPreviewSection.tsx`

**Changes to the `intelCards` array (lines 8-31):**
- Add an `image` property to each card object with the appropriate import

**Changes to card rendering (lines 148-166):**
- Add `relative overflow-hidden` to the card button
- Add an `<img>` element as background with `absolute inset-0 w-full h-full object-cover`
- Add a dark gradient overlay div (`absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30`)
- Make card content `relative z-10` so it sits above the overlay
- Change text colors to white variants since they'll be on a dark background (`text-white`, `text-white/80`)
- Increase card height with `min-h-[200px]` and use `flex flex-col justify-end` to push content to the bottom for a modern card look

**Imports to add:**
```typescript
import heroBeach from "@/assets/hero-beach.jpg";
import aerialView from "@/assets/snowbird-caribbean-aerial.jpg";
import timesSquare from "@/assets/snowbird-times-square.jpg";
```

The result will be cards with full-bleed background images, a dark gradient overlay for readability, and the icon + text positioned at the bottom of each card.




# Fix Bottom Row Deal Card Images

The bottom three deal cards (Flights, Garza Blanca, Phuket Moonlit Bay) are currently showing the resort name text in the image instead of the actual resort scenery. Since the resort name is already displayed below the image in text, the image should focus on the visual appeal of the property.

## Problem

The images for the bottom row are screenshots from booking sites that include large text overlays with the resort name and location. The top row images show clean resort photography, creating an inconsistent look.

## Solution

Use CSS `object-position` to shift the visible crop area of each bottom-row image upward, focusing on the resort/scenery portion rather than the text overlay area. Each image needs a different position:

- **Flights**: Crop to show the airplane window area — use `object-position: center top`
- **Garza Blanca**: Crop to show the resort building/pool at the top of the image — use `object-position: center top`
- **Phuket Moonlit Bay**: Crop to show the beach/water scenery at the top — use `object-position: center top`

## Technical Details

**File: `src/components/TravelDealsSection.tsx`**

1. Add an optional `imagePosition` field to the `FeaturedDeal` interface (defaults to `center`)
2. Set `imagePosition: "top"` on the three bottom-row deals (Flights, Garza Blanca, Phuket)
3. Apply the `objectPosition` style inline on the `<img>` tag using this field

This is a CSS-only fix — no new images needed. If the cropping still doesn't look right after this change, we can replace those three images with cleaner resort photos.


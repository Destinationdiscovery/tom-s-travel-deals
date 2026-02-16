

# Replace Bottom Row Deal Card Images with AI-Generated Photos

## Problem

All 6 deal card images are screenshots from booking sites. The top 3 happened to have full-bleed resort photography that crops cleanly, but the bottom 3 have white backgrounds, UI elements (badges, arrows, hearts), and text overlays that no amount of CSS cropping can fix.

## Solution

Use AI image generation to create 3 clean, professional travel photos and replace the problematic source files:

1. **Flights** -- View from an airplane window showing clouds and sky at golden hour
2. **Garza Blanca Cancun** -- Tropical beachfront resort with infinity pool overlooking turquoise water
3. **Phuket Moonlit Bay** -- Thai coastal resort with ocean view, palm trees, and white sand beach

## Steps

1. Create a backend function that calls the Lovable AI image generation endpoint (google/gemini-2.5-flash-image) to generate 3 images with specific prompts
2. Save the generated images as base64 data URLs or upload to storage
3. For simplicity and speed: generate the images, convert to files, and save them as new assets in `src/assets/`
4. Update the imports and deal entries in `TravelDealsSection.tsx` to use the new images
5. Remove `imagePosition: "top"` from those 3 deals since the new images won't need special cropping

## Technical Details

**New edge function: `generate-deal-images`**
- Calls the Lovable AI gateway with image generation prompts for each of the 3 cards
- Returns base64 image data

**However, the simpler approach**: Since we only need 3 static images, I will create an edge function to generate them, download the base64 results, save them as static assets, and wire them into the component. This is a one-time generation, not a recurring feature.

**Alternative simpler approach**: Rather than an edge function, I can directly embed the generated images. But since AI image generation requires an API call, the most practical path is:

1. Update `src/components/TravelDealsSection.tsx`:
   - Replace the 3 image imports (`dealFlights`, `dealGarza`, `dealPhuket`) with new clean image files
   - Remove `imagePosition: "top"` from those entries

2. Create 3 new image assets by using the AI image generation through an edge function that stores results in Lovable Cloud file storage, then reference those URLs in the component.

**File changes:**
- `supabase/functions/generate-deal-images/index.ts` -- New one-time-use edge function to generate 3 images and store in storage bucket
- `src/components/TravelDealsSection.tsx` -- Update bottom 3 deal entries to use storage URLs instead of local imports, remove `imagePosition: "top"`


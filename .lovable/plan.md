

# Fix Hotels.com Banner Cropping

## Problem
The Hotels.com banner's "save up to 40%" badge on the right side is being cut off because `object-cover` crops the image to fit the fixed height, cutting from the top and bottom equally.

## Change

**`src/components/TravelDealsSection.tsx`** (line 41)
- Add `object-position: right center` (`object-right`) to the Hotels.com banner image so the crop prioritizes showing the right side where the "40%" sale badge is
- This keeps the same image size and dimensions but shifts the visible crop area to ensure the sale details remain visible


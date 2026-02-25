

# Fix: Gear Card Images to Match Featured Deals Style

## Problem
The gear cards use `object-contain` which leaves empty space around images. The featured deals cards use `object-cover` which fills the image area edge-to-edge — that's the look we want.

## Changes

### 1. `src/components/GearPreviewSection.tsx` (line ~162)
Change `object-contain bg-muted` back to `object-cover` on the gear card images.

### 2. `src/pages/Gear.tsx` (line ~183)
Same change — `object-contain bg-muted` → `object-cover`.

### 3. `src/components/dashboard/GearImageManager.tsx` (line ~146)
Same change for the admin preview cards — `object-contain bg-muted` → `object-cover`.

## Why This Works
The featured deals cards use `object-cover` which crops images to fill the container while maintaining aspect ratio. This is what makes them look polished. The previous `object-contain` fix was overcorrecting — `object-cover` is the standard approach for card imagery.


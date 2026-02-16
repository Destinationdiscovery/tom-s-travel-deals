

# Revert Banner Image to Original Display

## Problem
The CSS cropping attempts to hide the baked-in title text have made the banner look bad. The user wants to go back to the original uncropped image.

## Change

**`src/components/TravelDealsSection.tsx`**
- Remove the extra `<div>` wrapper with `overflow-hidden`
- Revert the image back to a simple `<img>` tag with standard `object-cover` styling (no `object-position` tricks, no negative margins, no extra height calculations)
- Keep the white overlay box as-is (both titles will be visible -- the baked-in one and the overlay one -- but the image will at least look clean)


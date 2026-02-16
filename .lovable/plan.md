

# Remove Old Title from Banner Image

## Problem
The Expedia banner image has "The Annual Vacation Sale" text baked into the top of the image itself. Since we already have our own white overlay box with the title, this old text is redundant and should be hidden.

## Solution
Use CSS `object-position` on the banner `<img>` to shift the visible area downward, cropping out the text at the top of the image. This avoids needing to edit the actual image file.

## Change

**`src/components/TravelDealsSection.tsx`** (line 23)

Add `object-[center_80%]` (or similar) to the image's className so the visible portion starts below the baked-in text, showing only the ocean/scenic part of the banner.


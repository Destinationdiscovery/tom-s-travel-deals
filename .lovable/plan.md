

# Fix Double Title on Travel Deals Banner

## Problem
The CSS `object-position` trick didn't fully hide the original "The Annual Vacation Sale" text baked into the banner image. Two titles are now visible, which looks unprofessional.

## Solution
Crop the top of the image more aggressively by combining a taller `object-position` offset with increased height constraint, or use a CSS clip approach. Specifically:

### `src/components/TravelDealsSection.tsx`
- Change `object-[center_80%]` to a more aggressive value like `object-[center_100%]` to push the image further down, fully hiding the baked-in title text at the top
- If that still shows the text, wrap the image in a container with `overflow-hidden` and use a negative `margin-top` or `translate-y` on the image itself to physically shift it upward out of view

The white overlay box with "Expedia's Annual Vacation Sale" remains as the sole title.


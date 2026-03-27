

# Replace Blog Hero Image with Starry Night Sky

## Change
Replace the current `hero-tripreviews.jpg` hero image on the Compass/Blog page with the uploaded starry night sky mountain image.

## Steps
1. Copy `user-uploads://Screenshot_from_2026-03-26_21-18-01.png` to `src/assets/blog-hero-nightsky.png`
2. Update `src/pages/Compass.tsx` — change import from `hero-tripreviews.jpg` to `blog-hero-nightsky.png`, update alt text

| File | Change |
|------|--------|
| `src/assets/blog-hero-nightsky.png` | New — copied from upload |
| `src/pages/Compass.tsx` | Swap hero image import + alt text |


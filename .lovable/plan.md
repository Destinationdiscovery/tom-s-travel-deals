

## Add Hero Images to Destinations, Gear, and Travel Blog Pages

### Overview

Transform the plain-background hero sections on all three pages into immersive, full-width image heroes that match the homepage style -- background photo, dark gradient overlay, and white text with the sky-300 accent color.

### Image Selections

| Page | Image File | Why |
|------|-----------|-----|
| **My Reviews** (Destinations) | `snowbird-caribbean-aerial.jpg` | Aerial beach/ocean shot -- wide, scenic, and perfectly represents a travel destinations page |
| **Gear Reviews** | `gear-packing-cubes-features.jpg` | Travel gear in context -- relevant to the page topic and works well as a background |
| **Travel Blog** (Compass) | `japan-cherry-blossoms.webp` | Beautiful, atmospheric cherry blossoms -- aspirational and editorial, perfect for a blog page |

### Visual Style (matching homepage)

Each hero will follow the same pattern as the homepage `HeroSection.tsx`:

- Full-width `<img>` tag positioned absolutely behind the content
- Dark gradient overlay: `bg-gradient-to-b from-black/40 via-black/30 to-black/60`
- White heading text using the `font-display` family
- Light white/80 subtitle text
- Height sized to look dramatic but not full-screen (approximately `h-[40vh] min-h-[320px]`)
- Proper padding to clear the fixed header

### File Changes

| File | What Changes |
|------|-------------|
| `src/pages/Destinations.tsx` | Import `snowbird-caribbean-aerial.jpg`. Replace the plain `bg-warm-gradient` hero with an image-backed hero section. Text changes to white with `text-sky-300` accent on key words. |
| `src/pages/Gear.tsx` | Import `gear-packing-cubes-features.jpg`. Replace the plain `bg-muted/30` hero with an image-backed hero section. Same white text treatment. |
| `src/pages/Compass.tsx` | Import `japan-cherry-blossoms.webp`. Replace the plain `bg-warm-gradient` hero with an image-backed hero section. The "Travel Intel" badge will become a semi-transparent pill on the image. Same white text treatment. |

### Example Structure (same for all three)

```text
<section className="relative h-[40vh] min-h-[320px] flex items-center justify-center pt-20">
  <img src={heroImage} className="absolute inset-0 w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
  <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
    <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
      Page Title
    </h1>
    <p className="text-white/80 text-lg max-w-2xl mx-auto">
      Subtitle text
    </p>
  </div>
</section>
```

### Text Styling Per Page

- **My Reviews**: "My" in `text-sky-300`, "Reviews" in white
- **Gear Reviews**: "Gear" in `text-sky-300`, "Reviews" in white
- **Travel Blog**: "Travel" in `text-sky-300`, "Blog" in white -- the "Travel Intel" badge becomes `bg-white/20 text-white` to sit nicely on the image

This keeps the branding consistent with the homepage's "REVIEW. THEN GO." color split.




## Strip Down Homepage to Hero-Only Design

### Overview

Rebuild the homepage to show only a stunning full-screen hero section matching your reference image -- a tropical resort background photo with overlaid text ("REVIEW. THEN GO." headline, "Know what to expect before you go." tagline) and a search bar with an "Explore reviews" button. Everything else (Destination Discovery, Gear Reviews, Compass sections) gets removed from the homepage. Navigation tabs stay as-is so those pages remain accessible.

This is the clean starting point we will build back up from.

---

### What the New Hero Looks Like

Based on your reference image:

- **Full-screen background**: A high-quality tropical resort/overwater villa photo covering the entire viewport height
- **Site name**: "TripReviews.ca" displayed small at the top center (replaces the old branded hero image)
- **Main headline**: "REVIEW. THEN GO." in large bold text -- "REVIEW." in a lighter blue, "THEN" in light/white, "GO." in dark navy bold
- **Tagline**: "Know what to expect before you go." in white/light text below the headline
- **Search bar**: A wide input field with placeholder text "Search destinations, hotels, or experiences" and a dark "Explore reviews" button beside it
- **Dark overlay gradient**: A subtle gradient over the background image so text remains readable

The search bar will be non-functional for now (just the visual design). We will wire it up when we build the Perplexity integration.

---

### What Changes

| Area | Before | After |
|------|--------|-------|
| Hero section | Static branded image (hero-tripreviews.jpg) | Full-viewport background photo with overlaid text and search bar |
| Homepage content | 4 sections (Hero, Destinations, Gear, Compass) | Hero only + Footer |
| Header navigation | Stays the same | Stays the same (Destinations, Gear, Compass, About, Contact still work) |
| Footer | Stays the same | Stays the same |
| Background photo | hero-tripreviews.jpg | New tropical resort photo (from your uploaded reference or a suitable existing asset) |

---

### Background Image

We need a beautiful tropical/resort background photo. Looking at your existing assets, you have several good candidates (like `deal-maldives.jpg` or `hero-beach.jpg`). We can use one of those, or I can use your uploaded reference image directly as the background. Since the reference image already has text baked in, using an existing clean photo (like `hero-beach.jpg`) as the background and overlaying our own text would give the cleanest result.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/HeroSection.tsx` | Complete rewrite: full-viewport hero with background image, overlaid headline, tagline, and search bar |
| `src/pages/Index.tsx` | Remove TravelStoriesSection, GearReviewsSection, and CompassSection imports and usage -- keep only Header, HeroSection, and Footer |

### No New Files Needed

This is a simplification -- we are removing content, not adding complexity.

---

### Technical Details

**HeroSection.tsx** will be rebuilt as:
- A full-viewport-height section (`min-h-screen`) with a background image using `object-cover`
- A dark gradient overlay (`bg-gradient-to-b` or similar) for text readability
- Centered content block containing:
  - Small "TripReviews.ca" text at top
  - Large headline with mixed styling: "REVIEW." (light blue), "THEN" (white/light), "GO." (dark navy bold)
  - Tagline paragraph below
  - Search bar container with an input and styled button (non-functional for now)
- `pt-20` maintained to clear the fixed header

**Index.tsx** will be stripped to:
```
Header -> HeroSection -> Footer
```

All removed sections (TravelStoriesSection, GearReviewsSection, CompassSection) remain available on their dedicated pages via navigation -- nothing is deleted, just removed from the homepage.


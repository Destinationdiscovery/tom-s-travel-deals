

# SEO & E-E-A-T Improvements for ReviewThenGo

Identical to the previous plan with one change: all author references use **"Tom"** only — no last name.

## Changes

### 1. Header H1 Fix
`src/components/Header.tsx` — change `<h1>` to `<span>` for the logo text. Biggest single SEO win.

### 2. Author Bio Component (E-E-A-T)
Create `src/components/AuthorBio.tsx`:
- **"Tom — Travel Consultant & Founder"**
- Bio: "With over a decade of experience in travel consulting and thousands of destinations researched, Tom built ReviewThenGo to help travelers make confident booking decisions."
- Add to `CompassArticle.tsx` (before comments) and `About.tsx`

### 3. Testimonials Section
Create `src/components/TestimonialsSection.tsx` with 4 traveler testimonials. Add to `Index.tsx` homepage.

### 4. Trust Badges Update
`src/components/TrustBadges.tsx` — update date to April 2026, add "10+ Years Travel Expertise" badge.

### 5. Schema Enhancements
`src/pages/Index.tsx` — add `aggregateRating` to existing WebApplication schema.

### 6. Meta Title Updates
- `Compass.tsx`: "Travel Blog | Trip Planning Tips & Guides | ReviewThenGo"
- `Destinations.tsx`: "Hotel & Resort Reviews | Compare 10+ Sources | ReviewThenGo"
- `BestTime.tsx`: "Best Time to Visit Any Destination | Weather & Crowds | ReviewThenGo"

### 7. Lazy Loading Pass
Add `loading="lazy"` to remaining non-above-fold images in `About.tsx` and `Destinations.tsx`.

## Files

| File | Change |
|------|--------|
| `src/components/Header.tsx` | `<h1>` → `<span>` |
| `src/components/AuthorBio.tsx` | New — author bio with "Tom" |
| `src/components/TestimonialsSection.tsx` | New — traveler testimonials |
| `src/pages/CompassArticle.tsx` | Add AuthorBio before comments |
| `src/pages/About.tsx` | Add AuthorBio, lazy load hero |
| `src/pages/Index.tsx` | Add TestimonialsSection, aggregateRating schema |
| `src/components/TrustBadges.tsx` | Update date + expertise badge |
| `src/pages/Compass.tsx` | Update meta title |
| `src/pages/Destinations.tsx` | Update meta title, lazy load |
| `src/pages/BestTime.tsx` | Update meta title |


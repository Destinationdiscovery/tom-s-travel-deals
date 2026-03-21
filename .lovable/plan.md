

# Add "Most Saved by Travelers" Public Section to Homepage

## Concept
A new homepage preview section showing the most-saved/most-reviewed destinations from the `cached_reviews` database. This is different from "Recently Reviewed" (which shows newest). This section highlights popular picks based on view counts or save activity, giving SEO value through internal links and social proof.

## Approach

### New Component: `src/components/PopularSavesSection.tsx`
- H2: "Most Saved by Travelers" (keyword-rich for SEO)
- Subtitle: "The destinations and properties travelers save and compare the most on ReviewThenGo"
- Query `cached_reviews` ordered by `view_count` DESC, limit 6
- Each card: property name, location, star rating, "X travelers saved this" badge (deterministic hash like HotelResultCard), and a link to `/review/:slug`
- Style matches existing preview sections (rounded cards, grid layout)
- Add `ItemList` JSON-LD schema listing properties for search engine rich results

### Update: `src/pages/Index.tsx`
- Import and place `PopularSavesSection` between `RecentReviewsHomepage` and the "Start Your Saves List" CTA
- This creates a natural flow: Recent Reviews → Popular Saves → Start Your Own Saves List

### Update: `index.html` noscript block
- Add an H2 "Most Saved by Travelers" entry with descriptive text so AI crawlers can see this section exists

## Section Order (updated area only)
```text
RecentReviewsHomepage
PopularSavesSection       ← NEW
Saves CTA
TravelDealsSection
BlogPreviewSection
HomepageFAQ
```

## Files

| File | Action |
|------|--------|
| `src/components/PopularSavesSection.tsx` | New component |
| `src/pages/Index.tsx` | Add section to layout |
| `index.html` | Add noscript entry |


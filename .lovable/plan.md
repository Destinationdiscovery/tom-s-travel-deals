

# Schema Upgrades: Organization serviceArea, TouristDestination, Article

## Current State
- **No LocalBusiness schema** exists anywhere (confirmed via search) — nothing to remove
- **Organization + TravelAgency** schema on homepage with `address` and `areaServed: "Worldwide"` — needs serviceArea upgrade
- **BlogPosting** schema on CompassArticle pages — needs upgrade to Article
- **No TouristDestination** schema on destination pages (TopDestinations, DestinationReview, AIReview)
- **Guides page** has no article schema at all

## Changes

### 1. Replace `address` + `areaServed` with `serviceArea` in Organization schema
**`src/pages/Index.tsx`** (lines 70-79)
- Remove `address: { "@type": "PostalAddress", addressRegion: "Ontario", addressCountry: "CA" }`
- Remove `areaServed: "Worldwide"`
- Add `serviceArea` array with key countries:
```json
"serviceArea": [
  {"@type": "Country", "name": "United States"},
  {"@type": "Country", "name": "Canada"},
  {"@type": "Country", "name": "United Kingdom"},
  {"@type": "Country", "name": "Australia"}
]
```

### 2. Add TouristDestination schema to review pages
**`src/pages/AIReview.tsx`** (around line 121)
- Add a `TouristDestination` JSON-LD block via the `jsonLd` prop on SEOHead, using the review's `location` field:
```json
{
  "@type": "TouristDestination",
  "name": "[location]",
  "description": "Travel reviews and planning tools for [location]"
}
```

**`src/pages/TopDestinations.tsx`**
- Import SEOHead, add it with TouristDestination schema using `displayLocation`

### 3. Upgrade BlogPosting → Article on guide pages
**`src/pages/CompassArticle.tsx`** (line 51)
- Change `"@type": "BlogPosting"` to `"@type": "Article"`
- Already has headline, author, datePublished, dateModified, publisher — all correct for Article

### 4. Add Article schema to Guides hub page
**`src/pages/Guides.tsx`**
- Add `jsonLd` prop to SEOHead with an `Article` schema for the hub page itself

## Files

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Replace address/areaServed with serviceArea array |
| `src/pages/AIReview.tsx` | Add TouristDestination JSON-LD via jsonLd prop |
| `src/pages/TopDestinations.tsx` | Add SEOHead with TouristDestination schema |
| `src/pages/CompassArticle.tsx` | BlogPosting → Article |
| `src/pages/Guides.tsx` | Add Article schema to hub |

All changes are schema-only — zero visual or functional impact.


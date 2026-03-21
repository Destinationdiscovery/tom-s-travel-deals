

# Phase 2: Guides Hub

## Overview
Create a `/guides` hub page and seed 5 evergreen AI-quotable guide articles. Guides reuse the existing `blog_posts` table (with category "Guide") and `CompassArticle` renderer, so no new DB tables are needed.

## Changes

### 1. New Page: `src/pages/Guides.tsx`
- Hero section with "Travel Guides" branding
- Fetches all `blog_posts` where `category = 'Guide'` (same pattern as Compass.tsx)
- Grid layout of guide cards with title, excerpt, read time
- Each card links to `/compass/:slug` (reuses existing article renderer)
- SEOHead with FAQPage schema for the hub page itself
- Header + Footer wrapper

### 2. Route: `src/App.tsx`
- Add lazy import for Guides page
- Add `<Route path="/guides" element={<Guides />} />`

### 3. Navigation Updates
- **Header.tsx**: Add "Guides" to `navLinks` array (between "Blog" and "Deals")
- **Footer.tsx**: Add "Guides" link to Explore nav list

### 4. Seed 5 Guide Articles via DB Insert
Insert 5 rows into `blog_posts` with category "Guide" and `rich_content` JSON. Each follows the AI-quotable format: direct answer intro, H2/H3 structure, FAQ at bottom.

Articles:
1. "How to Spot Fake Hotel Reviews" — Red flags, patterns, tools
2. "Best Way to Check Resort Reviews Before Booking" — Step-by-step process
3. "Airbnb vs Hotel: Real Reviews Compared" — Comparison with pros/cons table
4. "Top Golf Resorts Worldwide: Honest Reviews" — Curated list with verdicts
5. "Travel Review Mistakes to Avoid" — Common pitfalls and fixes

Each article: ~800-1200 words via rich_content blocks, category "Guide", category_color "bg-emerald-500", author "Tom".

## Files

| File | Action |
|------|--------|
| `src/pages/Guides.tsx` | New — guides hub page |
| `src/App.tsx` | Add `/guides` route |
| `src/components/Header.tsx` | Add "Guides" nav link |
| `src/components/Footer.tsx` | Add "Guides" footer link |
| `blog_posts` table | Insert 5 guide articles (DB insert, no migration) |

## Order
1. Create Guides.tsx page
2. Add route + nav links
3. Insert 5 guide articles into blog_posts


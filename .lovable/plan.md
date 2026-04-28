# Hero + SEO Refresh

Apply the approved headline and description, and align site-wide SEO meta tags so the new copy shows up in search and social shares.

## Approved copy

- **Headline (H1):** Every Travel Question, Answered Before You Book
- **Description:** Get instant answers about hotels, destinations, packing, and the best time to visit. Free AI travel planner powered by 10+ trusted review sources.

## Changes

### 1. `src/components/HeroSection.tsx` (lines 72-80)
- Replace H1 "Review. Plan. Go." with **"Every Travel Question, Answered Before You Book"**.
- Replace the description paragraph with the new description above.
- Keep the small attribution line ("By Travel Experts at ReviewThenGo | Aggregating 10M+ reviews...") for trust + brand mention.

### 2. `index.html` SEO tags
Sync the homepage SEO so search engines and AI crawlers see the same value prop as the hero:
- `<title>`: **ReviewThenGo: AI Travel Planner. Every Travel Question Answered Before You Book**
- `<meta name="description">`: **Get instant answers about hotels, destinations, packing, and the best time to visit. Free AI travel planner powered by 10+ trusted review sources.**
- `og:title` and `og:description`: match the new title and description above.

## Notes
- No changes to layout, fonts, or styling.
- Keeps brand name ReviewThenGo separated from the headline (no more "Review. Plan. Go." echo of the brand).
- New H1 is a strong AEO target: it phrases the value as a question/answer, which Perplexity, ChatGPT, and Google AI Overviews favor for travel queries.

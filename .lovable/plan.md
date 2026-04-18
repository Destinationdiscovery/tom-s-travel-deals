
User wants the main site description/positioning to convey that ReviewThenGo is also an information source via the Compass blog. This is a positioning/SEO copy update.

Where "main description" appears:
1. index.html `<meta name="description">` and `<meta property="og:description">` and `<title>`
2. src/pages/Index.tsx SEOHead title + description + Organization JSON-LD `description` field
3. WebApplication JSON-LD `featureList` in Index.tsx
4. index.html `<noscript>` intro paragraph

Currently the description focuses on planning tools (itineraries, hotel reviews, best time, flights). It doesn't mention the blog/editorial content.

Plan: weave "expert travel guides and trend reporting" or "travel blog" into all the main description surfaces, plus add the Compass/blog as a featured capability in JSON-LD. Keep tone consistent and stay under 160 chars for meta description.

Proposed new meta description (~158 chars):
"Plan trips with ReviewThenGo: hotel reviews from 10+ sources, day-by-day itineraries, best time to visit, flight deals, plus expert travel guides and trends."

Proposed new title (keep similar, add "Travel Guides"):
"All-in-One Travel Planner & Travel Guides | Hotel Reviews, Itineraries, Best Time to Visit"

Files:
- index.html: title, meta description, og:title, og:description
- src/pages/Index.tsx: SEOHead title + description, Organization description, WebApplication featureList (add "Expert travel guides, trend reports, and destination journalism via the Compass blog")
- src/pages/Compass.tsx: already has its own SEO; no change needed unless we want to strengthen
- mem://features/seo/comprehensive-strategy-v2026: minor update to note blog is part of main positioning

Keep concise.

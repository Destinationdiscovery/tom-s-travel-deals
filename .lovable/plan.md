

# Remaining Phases for ReviewThenGo

Here's what's been completed and what's still on the roadmap from your master prompt.

## Completed
- Homepage restructure (hero, trust badges, How It Works, FAQ, SEO)
- Guides hub + 5 evergreen articles
- Schema (AggregateRating, FAQPage, Quick Verdict on reviews)
- `/reviews/:query` dynamic pages with hotel cards, affiliate sidebar, sticky search
- Back navigation buttons
- Date stamps, FAQ accordions on hotel cards, light mode palette
- Review-first CTA flow across all sections
- Auto-generate reviews when not cached
- Renamed Gear → Trip Planner Toolkit
- Best Time to Visit tool (`/best-time`)
- Expanded homepage question cards (16 mixed types)
- Hero tagline → "Answer Engine" positioning

## Remaining Phases

### Phase 4: Quick Fix — Deploy Best Time Edge Function
The `best-time-intel` edge function was created but not added to `supabase/config.toml`, so it won't deploy. One-line fix.

### Phase 5: Itinerary Builder
New tool at `/itinerary` — user types "Tokyo 5 days budget" → gets a day-by-day plan with costs, activities, and restaurant picks. Powered by Perplexity. New edge function + page.

### Phase 6: Currency Tracker
New tool at `/currency` — user types a country → gets live exchange rate, 7-day trend, and tips. Uses a free exchange rate API (no key needed for basic rates).

### Phase 7: Flight Deals Finder
New tool at `/flights` — user types a route like "NYC to Paris" → gets best upcoming deals via Perplexity. Affiliate links to Expedia/Google Flights.

### Phase 8: Safety Scores
New tool at `/safety` — user types a destination → gets safety rating, common scams, health tips, emergency numbers. Perplexity-powered.

### Phase 9: Trending Queries + Dynamic Homepage
Auto-rotating "Trending Now" section on homepage. Start with 50 hardcoded evergreen queries that rotate, with infrastructure to add Google Trends integration later.

### Phase 10: Polish & SEO Hardening
- Sitemap auto-generation for all new tool pages
- Internal linking between tools (e.g. Best Time page links to related reviews)
- OpenGraph images for social sharing
- Performance audit

---

**Recommendation**: Start with Phase 4 (config fix — 30 seconds) then Phase 5 (Itinerary Builder — highest user value). Currency and Flights can follow. Safety Scores and Trending Queries are lower priority.

Want me to proceed with Phase 4 + 5 together?


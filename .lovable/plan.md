

# Remaining Phases for ReviewThenGo

## Completed So Far
- Homepage restructure, trust badges, How It Works, FAQ, SEO schema
- Guides hub + 5 evergreen articles
- Dynamic `/reviews/:query` pages with hotel cards, affiliate sidebar, sticky search
- Back navigation, date stamps, FAQ accordions, light mode palette
- Review-first CTA flow, auto-generate reviews when not cached
- Trip Planner Toolkit (renamed from Gear)
- Best Time to Visit tool (`/best-time`)
- Itinerary Builder (`/itinerary`)
- Expanded homepage question cards (16 mixed types)
- Hero "Answer Engine" positioning

## Remaining Phases

### Phase 6: Currency Tracker (`/currency`)
User types a country → live exchange rate, 7-day trend, travel tips. Uses free exchange rate API (no key needed for basic rates). New edge function + page.

### Phase 7: Flight Deals Finder (`/flights`)
User types a route like "NYC to Paris" → best upcoming deals via Perplexity. Affiliate links to Expedia/Google Flights. New edge function + page.

### Phase 8: Safety Scores (`/safety`)
User types a destination → safety rating, common scams, health tips, emergency numbers. Perplexity-powered. New edge function + page.

### Phase 9: Trending Queries + Dynamic Homepage
Auto-rotating "Trending Now" section on homepage. Start with 50 hardcoded evergreen queries that rotate, with infrastructure for future Google Trends integration.

### Phase 10: Polish & SEO Hardening
- Sitemap auto-generation for all tool pages
- Internal linking between tools (Best Time → related reviews, etc.)
- OpenGraph images for social sharing
- Performance audit

---

**Recommendation**: Phase 6 (Currency) and Phase 7 (Flights) add the most visible new tools. Phase 9 (Trending Queries) is low effort, high SEO value. Phase 8 (Safety) and Phase 10 (Polish) can follow.

Want me to proceed with Phase 6 + 7 together, or pick a different order?


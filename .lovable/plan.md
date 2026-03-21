

# AI SEO Revamp for ReviewThenGo.com

This is a large initiative. To keep it manageable and avoid breaking existing functionality, we will implement it in **3 phases** across multiple prompts. All existing tools, widgets, search bars, and admin dashboard remain untouched.

---

## Phase 1: Foundation (This Prompt)

### 1. Homepage Restructure
**File: `src/pages/Index.tsx`**
- Rewrite hero tagline: "Stop Wasting Hours on Reviews. Get Honest, Aggregated Insights Before You Book Anywhere."
- Add "How It Works" 3-step section below TrustBadges (Search > Read Verdict > Book with Confidence)
- Add "What Travelers Ask Us" section with 6 popular query cards linking to search (e.g. "Best hotels in Paris real reviews", "Is Bali worth it 2026?", "Golf resorts honest feedback")
- Add homepage FAQ accordion at bottom with FAQPage schema markup (How do you aggregate reviews? Is it free? How to spot fake reviews?)
- Keep all existing sections (RecentReviews, Deals, Gear, Intel, Blog) in place

### 2. Trust Badges — Global Focus
**File: `src/components/TrustBadges.tsx`**
- Change "Canadian Traveler Focused" → "Global Traveler Trusted"
- Change "10,000+ Travelers Helped" → "50,000+ Reviews Analyzed"
- Add badge: "10+ Review Sources Aggregated"

### 3. SEOHead Enhancements
**File: `src/components/SEOHead.tsx`**
- Add FAQPage JSON-LD support (new optional `faq` prop accepting Q&A pairs)
- Add AggregateRating JSON-LD support (new optional `aggregateRating` prop)
- Update homepage description to global positioning

### 4. Robots.txt — AI Bot Access
**File: `public/robots.txt`**
- Add explicit `Allow` for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, AppleBot
- Keep existing entries

### 5. About Page — Global Positioning
**File: `src/pages/About.tsx`**
- Update copy from Toronto-centric to "global travelers, real insights"
- Add "How We Aggregate" section explaining the multi-source review process
- Add "No Pay-for-Play" trust statement

---

## Phase 2: Guides Hub (Next Prompt)

### 6. New `/guides` Page + Route
- Create guides hub page listing all evergreen guides
- Add route to App.tsx
- Add to Header nav and Footer

### 7. Guide Content Pages
Create 5 initial guide articles (stored in DB via blog_posts table with category "Guide"):
- How to Spot Fake Hotel Reviews
- Best Way to Check Resort Reviews Before Booking
- Airbnb vs Hotel: Real Reviews Compared
- Top Golf Resorts Worldwide: Honest Reviews
- Travel Review Mistakes to Avoid

Each guide follows the AI-quotable format: direct answer first, H2/H3 structure, FAQ at bottom with schema.

---

## Phase 3: Schema & Structured Data (Following Prompt)

### 8. Review Pages — AggregateRating Schema
- Add Review/AggregateRating JSON-LD to AIReview.tsx and DestinationReview.tsx
- Add "Quick Verdict" block at top of each review (score, top pros, top cons, "worth booking if")

### 9. Property-Style URLs
- Add redirect support for `/properties/[city]/[name]` pattern to existing review slugs

### 10. Destinations Hub Enhancement
- Add A-Z browsing, region filters, featured destinations grid

---

## Files Changed in Phase 1

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Add HowItWorks, TravelersAsk, FAQ sections |
| `src/components/TrustBadges.tsx` | Update badges to global focus |
| `src/components/SEOHead.tsx` | Add `faq` and `aggregateRating` JSON-LD props |
| `src/components/HowItWorks.tsx` | New component — 3-step explainer |
| `src/components/TravelersAskSection.tsx` | New component — popular query cards |
| `src/components/HomepageFAQ.tsx` | New component — FAQ accordion with schema |
| `public/robots.txt` | Add AI bot directives |
| `src/pages/About.tsx` | Update to global positioning + aggregation explainer |

## Implementation Order
1. robots.txt (quick win)
2. TrustBadges update
3. SEOHead enhancements (faq/aggregateRating support)
4. New components (HowItWorks, TravelersAsk, HomepageFAQ)
5. Index.tsx integration
6. About.tsx update


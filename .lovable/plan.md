

# SEO Optimization: Nexus Analysis Fixes

## What Already Exists
- Canonical tag: SEOHead.tsx already outputs `<link rel="canonical">` on every page
- JSON-LD: Organization, WebSite, WebApplication, FAQPage schemas already on homepage
- robots meta: `index.html` already has no noindex; SEOHead handles per-page
- `<noscript>` block in index.html already has extensive content for AI crawlers
- FAQ schema already backed by `homepageFaqData`
- Keywords meta tag already set

## What Needs Changing

### 1. Title & Description Upgrade
**`index.html`** — Static meta tags:
- Title → "ReviewThenGo: All-in-One Travel Planner | Itineraries, Hotel Reviews, Best Time to Visit"
- Description → "Plan your perfect trip with ReviewThenGo — build day-by-day itineraries, compare hotel reviews from 10+ sources, find the best time to visit any destination, and book flights. Free all-in-one travel planning tool."

**`src/pages/Index.tsx`** — SEOHead props:
- Same title and description updates

### 2. E-E-A-T Credibility Banner
**`src/components/HeroSection.tsx`** — Below subtitle, add a small trust line:
- "By Travel Experts at ReviewThenGo | Aggregating 10M+ reviews from TripAdvisor, Booking.com, Google"
- Styled as subtle white/70 text, small font

### 3. Section H2s as Question-Format for AEO
Convert preview section headings to question/action format to match how users and AI search:

| Component | Current H2 | New H2 |
|-----------|-----------|--------|
| `BestTimePreviewSection` | "Best Time to Visit Any Destination" | "Find the Best Time to Visit Any Destination" |
| `ItineraryPreviewSection` | "Travel Itinerary Builder" | "How to Build a Day-by-Day Travel Itinerary" |
| `FlightsPreviewSection` | "Flight Deals and Cheap Flights" | "Find Cheap Flights and Flight Deals" |
| `RecentReviewsHomepage` | heading text | "Compare Hotel Reviews from Real Travelers" |

Also front-load each subtitle with a direct answer sentence.

### 4. Hero Image Alt Text
**`src/components/HeroSection.tsx`** — Carousel images currently have `alt=""`. Add descriptive alt text:
- "Beach destination for travel planning"
- "Caribbean aerial view of resort"
- "Santorini hotel with ocean views"
- "Tokyo skyline travel destination"
- etc.

### 5. "Last Updated" Date Display
**`src/components/TrustBadges.tsx`** — Add a "Last Updated March 2026" badge to the trust badges row. This signals freshness to both users and AI.

### 6. Enhanced Organization Schema
**`src/pages/Index.tsx`** — Update Organization JSON-LD:
- Add `"@type": ["Organization", "TravelAgency"]`
- Add `contactPoint` with URL to /contact
- Update logo URL to include `www.` variant for consistency

### 7. Noscript FAQ Content
**`index.html`** — The noscript block already has FAQ content. Add 2 more travel-specific questions:
- "What is the best time to visit any destination?" 
- "How do I build a day-by-day itinerary?"

## Files

| File | Action |
|------|--------|
| `index.html` | Update title, description, add noscript FAQ entries |
| `src/pages/Index.tsx` | Update SEOHead title/description, enhance Organization schema |
| `src/components/HeroSection.tsx` | Add E-E-A-T line, fix image alt text |
| `src/components/TrustBadges.tsx` | Add "Updated March 2026" badge |
| `src/components/BestTimePreviewSection.tsx` | Question-format H2 |
| `src/components/ItineraryPreviewSection.tsx` | Question-format H2 |
| `src/components/FlightsPreviewSection.tsx` | Question-format H2 |
| `src/components/RecentReviewsHomepage.tsx` | Question-format H2 |

## Build Order
1. index.html (title, description, noscript)
2. Index.tsx (SEOHead + schema)
3. HeroSection.tsx (E-E-A-T + alt text)
4. TrustBadges.tsx (freshness badge)
5. 4 preview section H2 updates


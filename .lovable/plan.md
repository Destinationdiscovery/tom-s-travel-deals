

# Homepage & Affiliate Redesign: Compact, Content-Rich, Click-Optimized

## What Changes

### 1. Shrink the Hero Section
The hero currently dominates the viewport. We'll cut it down significantly:
- Reduce from `min-h-[70vh]` to `min-h-[50vh]`
- Make the headline smaller (from `text-7xl` to `text-5xl` on desktop)
- Keep only **3 search categories** instead of 6: **Destination Review**, **Travel Gear**, and **Travel Intel** (which combines requirements, advisories, and news into one)
- Remove the separate "Travel Deals" button since deals are visible right below anyway

### 2. Consolidate Search Categories
Instead of 6 buttons (Destination Review, Destination Search, Travel Gear, Requirements, Advisories, News), simplify to 3:
- **Destination Review** -- keeps existing behavior
- **Travel Gear** -- keeps existing behavior
- **Travel Intel** -- a new combined category that replaces Requirements, Advisories, and News with a single search that lets the AI decide what type of intel to return

This reduces visual clutter and decision fatigue.

### 3. Add Inline Affiliate Links Throughout

This is the biggest change. Currently affiliate links only appear:
- In the sidebar of review pages (one "Ready to Book?" card)
- In the "Things to Do" section footer

After this change, affiliate links will appear:

**a) Recent Reviews cards on homepage** -- each card gets a small "Book on Expedia" link beneath the star rating

**b) Blog preview cards on homepage** -- any travel article mentioning a bookable destination gets a subtle "Find deals" affiliate link

**c) AI Review pages (`AIReviewResult.tsx`)** -- add an inline affiliate CTA after the summary card AND after the travel tips section (2 placements instead of just sidebar)

**d) Manual review pages (`DestinationReview.tsx`)** -- add an inline affiliate CTA after the "My Experience" section and after the Tips section

**e) Blog article pages (`CompassArticle.tsx`)** -- add a contextual "Planning a trip?" affiliate banner between the article content and the comments section

**f) Things To Do cards** -- each activity card gets a small "Book this" Expedia link (not just the section footer)

### 4. Homepage Section Previews
Keep the current 3-section layout but make each more prominent:
- **Recent Reviews** -- increase from 4 cards to showing rating + location more prominently, add "Book Now" affiliate micro-links
- **Travel Deals** -- keep as-is (already strong)
- **Blog Preview** -- add destination-aware affiliate links to cards

### 5. Fix Double Footer
There's a bug on line 378-379 of `Index.tsx` -- the Footer component is rendered twice. We'll remove the duplicate.

## Files Changed

| File | Change |
|------|--------|
| `src/components/HeroSection.tsx` | Reduce height, remove 3 search types, shrink headline |
| `src/pages/Index.tsx` | Remove duplicate Footer, pass affiliate context to sections |
| `src/components/RecentReviewsHomepage.tsx` | Add inline Expedia affiliate links per card |
| `src/components/BlogPreviewSection.tsx` | Add "Find deals" affiliate links on destination articles |
| `src/components/AIReviewResult.tsx` | Add 2 additional inline affiliate CTAs (after summary, after tips) |
| `src/pages/DestinationReview.tsx` | Add inline affiliate CTA after "My Experience" and after Tips |
| `src/pages/CompassArticle.tsx` | Add "Planning a trip?" affiliate banner before comments |
| `src/components/review/ThingsToDoSection.tsx` | Add per-activity "Book this" link |

## Technical Details

- The `buildDeepLinks` and `detectCountry` functions from `AffiliateLinks.tsx` will be reused everywhere -- no new affiliate logic needed
- For the combined "Travel Intel" category, the edge function call will use the existing `travel-intel` function but the frontend will auto-detect the query type (contains "to" = requirements, otherwise = advisories/news combo)
- Inline affiliate components will be lightweight -- just an anchor tag with the Expedia deep link, not the full 3-platform card. The full card stays in the sidebar only
- The `RecentReviewsHomepage` cards will use `buildDeepLinks(country, review.property_name).expedia` to generate per-property Expedia links
- No new dependencies required
- No database changes needed


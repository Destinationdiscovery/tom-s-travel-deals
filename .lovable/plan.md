

# Fix Blog Back Navigation + Remove All Em-dashes Site-wide

## Three Tasks

### 1. Blog Article Back Button → "Back to Home"
**File: `src/pages/CompassArticle.tsx`**
- Change both instances of "Back to The Compass" to "Back to Home"
- Change the link target from `/compass` to `/`
- This matches the pattern used on all other tool/content pages (Reviews, Flights, Currency, Safety, etc.)

### 2. Remove All Em-dashes (—) and En-dashes (–) Site-wide
Sweep through all ~51 files and replace dashes with appropriate alternatives (commas, "to", hyphens, or rewording). Key files with user-facing content:

| File | Example Fix |
|------|-------------|
| `src/components/HeroSection.tsx` | "and more — all powered" → "and more. All powered" |
| `src/components/HomepageFAQ.tsx` | "Yes — ReviewThenGo" → "Yes. ReviewThenGo" |
| `src/components/HowItWorks.tsx` | "no fluff" line, "in three simple steps" line |
| `src/components/ReviewLoadingStages.tsx` | "4–8%" → "4 to 8%", "trip — worth" → "trip. Worth" |
| `src/components/SearchLoadingStages.tsx` | Same as above |
| `src/pages/Reviews.tsx` | FAQ schema "March–May" → "March to May" |
| `src/components/reviews/HotelResultCard.tsx` | FAQ "March–May" → "March to May" |
| `src/pages/Safety.tsx` | Subtitle line |
| `src/pages/Install.tsx` | Multiple instances |
| `src/pages/Gear.tsx` | SEO description + featured gear subtitle |
| `src/pages/Guides.tsx` | "coming soon — check back" |
| `src/components/AIReviewResult.tsx` | Code comments only (LEFT COLUMN –) — cosmetic but included |
| `src/components/SaveReviewButton.tsx` | Toast message |
| `src/pages/BookingReport.tsx` | Title + ship name display |
| `src/data/compassArticles.ts` | Scan article text blocks for any dashes |
| Dashboard files | `QuoteBuilder`, `EmailTemplates`, `BookingManager`, `DashboardOverview`, `EmailComposer` — internal but still cleaned |
| Edge functions | `generate-booking-report`, `booking-assistant`, `format-blog-post` — prompts and templates |

**Replacement rules:**
- "— " in prose → ". " or ", " depending on context
- "–" in ranges → " to " (e.g., "4 to 8%", "March to May")
- "— " as placeholder/empty state → "-" or remove
- Code comments with dashes → regular hyphen

### 3. Verify Blog Content Exists
The 8 DB blog posts all have rich content (15-27 blocks each). The "From the Blog" homepage section correctly renders the 3 newest. No content generation needed — articles are already written and displaying.

## Files (estimated 30+ files touched, all dash replacements)

## Build Order
1. CompassArticle.tsx — back button fix
2. All user-facing components — dash removal (hero, FAQ, loading stages, hotel cards, etc.)
3. All page files — dash removal
4. Data files — compassArticles.ts
5. Dashboard/internal components — dash removal
6. Edge functions — dash removal in prompts/templates


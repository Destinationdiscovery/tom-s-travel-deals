

## Phase 2: Autocomplete Search + AI Review Page

### Overview

Wire up the search bar on the homepage so users can type a hotel/resort/destination name, see autocomplete suggestions, and click "Explore reviews" to get a Perplexity-powered AI review displayed right on the same page -- below the hero section. No new route needed; the review appears inline beneath the search bar on the homepage.

This requires connecting Perplexity, creating two database tables, building an edge function, and adding frontend components.

---

### Setup Steps (done first)

1. **Connect Perplexity** -- Link the Perplexity connector to the project so the API key is available as an environment variable in edge functions

2. **Create two database tables** via Lovable Cloud:

   **cached_reviews**
   | Column | Type | Purpose |
   |--------|------|---------|
   | id | uuid (PK) | Primary key |
   | property_name | text (indexed) | Original search term |
   | slug | text (unique) | URL-friendly version for future linking |
   | location | text | Extracted location info |
   | property_type | text | hotel, resort, villa, destination |
   | review_data | jsonb | Ratings, summary, tips, best-for tags |
   | created_at | timestamptz | When first generated |

   **search_suggestions**
   | Column | Type | Purpose |
   |--------|------|---------|
   | id | uuid (PK) | Primary key |
   | name | text (indexed) | Property/destination name |
   | property_type | text | hotel, resort, villa, destination |
   | search_count | integer (default 1) | For ranking popular searches |
   | created_at | timestamptz | First searched |

---

### Edge Function: generate-review

**New file:** `supabase/functions/generate-review/index.ts`

- Accepts `{ propertyName: string }` in the request body
- Checks `cached_reviews` table first -- if found, returns cached data instantly (free)
- If not cached, calls Perplexity API (`sonar` model) with a structured prompt that asks for:
  - Overall rating and category breakdowns (Rooms, Food, Service, Location, Value) as numbers out of 5
  - A summary paragraph
  - 4-6 detailed review paragraphs synthesized from real traveler experiences
  - 5-6 practical travel tips
  - "Best For" tags
  - Property type and location
- Parses Perplexity's response into structured JSON
- Saves to `cached_reviews` table
- Upserts into `search_suggestions` (increments search_count if already exists)
- Returns the structured review data to the frontend

---

### Frontend Changes

**Modified: `src/components/HeroSection.tsx`**
- Make the search bar functional (remove `readOnly`)
- Add state management for search query, suggestions dropdown, loading state, and review results
- As user types, query `search_suggestions` table for matching names (debounced)
- Show a dropdown of matching suggestions below the input
- On clicking "Explore reviews" (or selecting a suggestion), call the edge function
- Display a loading skeleton below the hero while Perplexity generates the review
- Once ready, show the full AI review inline below the hero section

**Modified: `src/pages/Index.tsx`**
- Add state to hold the current review data (lifted from HeroSection or passed via callback)
- Render a new `AIReviewResult` component between HeroSection and Footer when review data exists

**New: `src/components/AIReviewResult.tsx`**
- Displays the AI-generated review in the same visual style as the existing DestinationReview page:
  - Property name and location header
  - Star ratings with category breakdowns (sidebar or inline on mobile)
  - Summary card
  - Detailed review paragraphs under "What Travelers Say"
  - Travel Tips section (numbered list)
  - "Best For" tags
  - Affiliate links bar at the bottom (Expedia.ca, VRBO, Hotels.com)
  - Comments section (reuses existing CommentsSection component with page_type "review")
- Uses skeleton loading states while data is being fetched
- Smooth scroll-to animation when the review appears

**New: `src/components/AffiliateLinks.tsx`**
- Displays three branded buttons: Expedia.ca, VRBO, Hotels.com
- Each constructs a search URL using the property name
- Placeholder affiliate IDs for now (you will provide real ones later)
- Opens links in new tabs

**New: `src/hooks/useSearchSuggestions.ts`**
- Custom hook that queries `search_suggestions` table
- Uses `ilike` filter for partial matching as user types
- Orders by `search_count` descending (most popular first)
- Debounced to avoid excessive database calls

**New: `src/hooks/useGenerateReview.ts`**
- Custom hook wrapping a TanStack Query mutation
- Calls the `generate-review` edge function
- Handles loading, error, and success states
- Returns structured review data

---

### How It Works End-to-End

```text
User types "Bellagio Las Vegas" in the search bar
    |
    v
Autocomplete dropdown shows matching suggestions
(from search_suggestions table, ranked by popularity)
    |
    v
User clicks "Explore reviews" or selects a suggestion
    |
    v
Loading skeleton appears below hero
    |
    v
Edge function checks cached_reviews table
    |
    +-- Cached? Return instantly
    |
    +-- Not cached? Call Perplexity API (~2-4 seconds)
        Perplexity searches TripAdvisor, Google, travel blogs
        Returns synthesized structured review
        Saves to cache for future free lookups
    |
    v
Review card appears below hero with smooth scroll
(ratings, summary, detailed review, tips, best-for tags, affiliate links)
```

---

### Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Create | `supabase/functions/generate-review/index.ts` | Edge function calling Perplexity |
| Create | `src/components/AIReviewResult.tsx` | Review display component |
| Create | `src/components/AffiliateLinks.tsx` | Expedia/VRBO/Hotels.com buttons |
| Create | `src/hooks/useSearchSuggestions.ts` | Autocomplete query hook |
| Create | `src/hooks/useGenerateReview.ts` | Review generation mutation hook |
| Modify | `src/components/HeroSection.tsx` | Wire up search bar with autocomplete and review trigger |
| Modify | `src/pages/Index.tsx` | Add AIReviewResult rendering below hero |

---

### What You Need to Provide

- **Perplexity API key** -- You will be prompted to connect it via the Perplexity connector during implementation
- **Affiliate IDs** -- Your Expedia.ca, VRBO, and Hotels.com tracking IDs (can be added later; placeholder links will work for now)


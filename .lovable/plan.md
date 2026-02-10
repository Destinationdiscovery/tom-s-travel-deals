

## Implementation: Gear Overhaul + Know Before You Go Rename

Everything is ready to build. The database table and secret are already in place.

---

### Step 1: Rename "Travel Intel" to "Know Before You Go"

Three files need label updates (routes stay the same):

- **Header.tsx** (line 27): Change `"Travel Intel"` to `"Know Before You Go"`
- **HeroSection.tsx** (line 12): Change `"Travel Intel"` to `"Know Before You Go"`
- **TravelIntel.tsx**: Update document title and hero heading text

---

### Step 2: Update GearReviewsSection

- **GearReviewsSection.tsx** (line 25): Change `"Gear Reviews"` to `"Travel Gear"`
- Also update the "View All Gear Reviews" button text to "View All Travel Gear"

---

### Step 3: Create the `travel-gear-intel` edge function

**New file**: `supabase/functions/travel-gear-intel/index.ts`

Follows the same pattern as `travel-intel`:
- Accepts `{ query, type, country }` where type is `"trending"` or `"must-haves"`
- Checks `gear_intel_cache` with 7-day TTL
- Calls Perplexity sonar model with tailored prompts
- Reads `AMAZON_ASSOCIATE_TAGS` secret, parses JSON, picks correct regional tag
- Builds Amazon search URLs using correct domain (`.ca`, `.com`, `.co.uk`)
- Caches and returns results

Add `[functions.travel-gear-intel]` with `verify_jwt = false` to config.

---

### Step 4: Create `useGearIntel` hook

**New file**: `src/hooks/useGearIntel.ts`

Mirrors `useTravelIntel` pattern — manages loading/error/data state, calls the edge function via `supabase.functions.invoke("travel-gear-intel", ...)`.

---

### Step 5: Rewrite Gear page

**Modified file**: `src/pages/Gear.tsx`

- New hero image: `gear-water-hammock-main.jpg`, title changed to "Travel Gear"
- Three-tab layout using existing `Tabs` component:
  - **My Reviews**: Current category filter + gear card grid (unchanged)
  - **Trending**: Search input + AI results with Amazon affiliate buttons
  - **Must-Haves**: Search input + AI checklist with Amazon affiliate buttons
- Uses `detectCountry()` from `AffiliateLinks.tsx` for country detection
- Each result card shows: product name, brand, price range, reason, "View on Amazon" button
- Affiliate disclaimer at bottom of AI tabs

---

### Technical Details

**Perplexity prompts**:
- Trending: "What are the top 6-8 trending travel gear items for {query}?" with structured JSON response
- Must-Haves: "What are the 8-12 must-have items for {query}?" with structured JSON response

**Amazon URL construction**:
```
CA: https://www.amazon.ca/s?k={encoded_name}&tag=gen80s01-20
US: https://www.amazon.com/s?k={encoded_name}&tag=destinati0a78-20
GB: https://www.amazon.co.uk/s?k={encoded_name}&tag=uktripreviews-21
```

**Files changed**:
| Action | File |
|--------|------|
| Modify | `src/components/Header.tsx` |
| Modify | `src/components/HeroSection.tsx` |
| Modify | `src/pages/TravelIntel.tsx` |
| Modify | `src/components/GearReviewsSection.tsx` |
| Modify | `src/pages/Gear.tsx` |
| Create | `supabase/functions/travel-gear-intel/index.ts` |
| Create | `src/hooks/useGearIntel.ts` |


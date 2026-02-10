

## Gear Section Overhaul + Know Before You Go Rename

Three parts: rename Travel Intel, store Amazon tags, and transform the Gear page into a search-driven hub.

---

### 1. Rename "Travel Intel" to "Know Before You Go"

Update display text across the site (route stays `/travel-intel`):

| File | Change |
|------|--------|
| `src/pages/TravelIntel.tsx` | Hero heading and document title |
| `src/components/Header.tsx` | Nav label |
| `src/components/HeroSection.tsx` | Bottom nav link label |

---

### 2. Store Amazon Associates tags as a secret

Store all three regional tags as a single JSON secret named `AMAZON_ASSOCIATE_TAGS`:

```json
{"CA":"gen80s01-20","US":"destinati0a78-20","GB":"uktripreviews-21"}
```

The edge function will parse this and select the correct tag based on a `country` parameter sent from the frontend (using the existing `detectCountry()` logic from `AffiliateLinks.tsx`).

---

### 3. Database: `gear_intel_cache` table

New table mirroring the existing `travel_intel_cache` pattern:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, default gen_random_uuid() |
| cache_key | text | Unique, e.g. `trending:beach+accessories` |
| intel_type | text | `trending` or `must-haves` |
| query | text | User's search query |
| result_data | jsonb | AI response data |
| created_at | timestamptz | Default now(), used for 7-day TTL |

RLS disabled (public read via edge function, writes via service role key).

---

### 4. New edge function: `travel-gear-intel`

**File**: `supabase/functions/travel-gear-intel/index.ts`

Mirrors the `travel-intel` edge function pattern:

- Accepts `{ query: string, type: "trending" | "must-haves", country: "CA" | "US" | "GB" }`
- Validates input, builds cache key, checks `gear_intel_cache`
- Calls Perplexity sonar model with tailored prompts
- Parses JSON, injects Amazon affiliate links using the regional tag from `AMAZON_ASSOCIATE_TAGS` secret
- Amazon link format: `https://www.amazon.com/s?k={encoded+product+name}&tag={regional-tag}` (`.ca` domain for Canada, `.co.uk` for UK)
- Caches result and returns

**Perplexity prompts**:

- **Trending**: Returns 6-8 items with name, brand, price range, reason it's popular, and a product category
- **Must-Haves**: Returns 8-12 checklist items with name, brand, price range, why it's needed, and priority level

**Response item schema**:
```text
{
  name: "Product Name",
  brand: "Brand",
  priceRange: "$30-50",
  reason: "Why this is recommended",
  category: "Beach Accessories",
  amazonUrl: "https://www.amazon.com/s?k=product+name&tag=destinati0a78-20"
}
```

Amazon domain mapping:
- CA -> amazon.ca
- US -> amazon.com
- GB -> amazon.co.uk

---

### 5. Transform the Gear page

**File**: `src/pages/Gear.tsx` (major rewrite)

**Hero**: Replace `gear-packing-cubes-features.jpg` with `gear-water-hammock-main.jpg`. Change title to "Travel Gear".

**Tab layout** (three tabs below hero):

| Tab | Content |
|-----|---------|
| **My Reviews** | Existing category filter buttons + gear card grid (unchanged design from current page) |
| **Trending** | Search input ("Search trending gear...") + AI-powered results with Amazon affiliate buttons |
| **Must-Haves** | Search input ("What trip are you packing for?") + AI-powered checklist with Amazon affiliate buttons |

**Trending / Must-Haves tab UI**:
- Search input + "Search" button (same layout as Know Before You Go tabs)
- Loading state with skeleton cards
- Results displayed as cards showing: product name, brand, price range, recommendation reason
- Each card has a prominent "View on Amazon" button linking to the affiliate search URL
- Small disclaimer at bottom: "Links may earn us a commission at no extra cost to you."
- Results use the `detectCountry()` function from `AffiliateLinks.tsx` to pass the correct country code to the edge function

---

### 6. Update GearReviewsSection

**File**: `src/components/GearReviewsSection.tsx`

Update section title from "Gear Reviews" to "Travel Gear".

---

### Config

**File**: `supabase/config.toml` — add `[functions.travel-gear-intel]` with `verify_jwt = false`

---

### Files summary

| Action | File |
|--------|------|
| Create | `supabase/functions/travel-gear-intel/index.ts` |
| Modify | `src/pages/Gear.tsx` |
| Modify | `src/pages/TravelIntel.tsx` |
| Modify | `src/components/Header.tsx` |
| Modify | `src/components/HeroSection.tsx` |
| Modify | `src/components/GearReviewsSection.tsx` |
| Migration | Create `gear_intel_cache` table |
| Secret | Store `AMAZON_ASSOCIATE_TAGS` |


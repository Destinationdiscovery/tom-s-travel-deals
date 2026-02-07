

## Fix Autocomplete: Seed Data + Search Cached Reviews

### Root Cause

The autocomplete is technically working -- it queries the database and returns results. But the `search_suggestions` table is nearly empty (only 1 test entry: "Four Seasons Resort Maui at Wailea"). When you type "bella" or "be", there are no matching entries, so nothing appears.

This happened because the edge function was crashing before the fix, so no searches ever got saved to the suggestions table.

### Solution (Two Parts)

**1. Seed the database with popular destinations**

Run a migration to pre-populate `search_suggestions` with ~20 popular hotels, resorts, and destinations so autocomplete has data to show immediately.

Examples: Bellagio Las Vegas, Sandals Royal Caribbean, Atlantis Paradise Island, Four Seasons Bora Bora, Hotel & Spa & Resort Cancun, Ritz-Carlton Maui, etc.

**2. Also search cached_reviews as a fallback**

Update the `useSearchSuggestions` hook to query both `search_suggestions` AND `cached_reviews` tables. This way, any property that has already been reviewed will also appear in autocomplete, even if it wasn't saved to suggestions due to the earlier bug.

### Changes

| Action | File / Resource | What Changes |
|--------|----------------|--------------|
| Migration | Database | Insert ~20 popular destination/hotel names into `search_suggestions` |
| Modify | `src/hooks/useSearchSuggestions.ts` | Add a parallel query to `cached_reviews` table, merge and deduplicate results from both tables |

### Technical Detail

The updated `useSearchSuggestions` hook will:

```text
User types "bell" (>= 2 chars)
    |
    v
Two parallel queries fire (debounced 300ms):
  1. search_suggestions WHERE name ILIKE '%bell%' ORDER BY search_count DESC LIMIT 6
  2. cached_reviews WHERE property_name ILIKE '%bell%' LIMIT 6
    |
    v
Merge results, deduplicate by lowercase name, cap at 6
    |
    v
Show dropdown: "Bellagio Las Vegas" (hotel), etc.
```

The seeded data will include a mix of:
- Popular Las Vegas hotels (Bellagio, Venetian, Wynn, Caesars Palace)
- Caribbean resorts (Sandals, Atlantis, Beaches)
- Luxury destinations (Four Seasons Bora Bora, Ritz-Carlton, Aman Tokyo)
- Popular destinations (Cancun, Maldives, Santorini, Bali)

This ensures that from day one, users will see suggestions as they type.



# Destination Search: Add "Things to Do" Results

## Overview

Expand the Destination Search to also return activities/experiences when the query warrants it. For example, "hidden gems in Rome" would return both hidden gem hotels AND hidden gem things to do. Queries like "adults only resorts in Punta Cana" would return only properties as before.

## Approach: Single Request, Dual Results

One Perplexity API call returns both property results and optional activity results based on query intent.

## Technical Changes

### 1. `supabase/functions/travel-search/index.ts`

Update the system prompt to request two arrays:
- `results` -- properties (same as today)
- `activities` -- things to do (only when the query implies experiences, sightseeing, or general exploration)

Each activity object:
- `name`: string (e.g., "Trastevere Food Tour")
- `location`: string (neighborhood/area)
- `category`: string (e.g., "Food & Drink", "Sightseeing", "Adventure")
- `rating`: number (out of 5)
- `description`: string (1-2 sentences)
- `bestFor`: string[] (e.g., "Couples", "Foodies", "History Buffs")
- `priceRange`: string ("$" to "$$$$")

Update the response parsing to extract both `results` and `activities` from the parsed JSON and return them.

### 2. `src/hooks/useTravelSearch.ts`

- Add a new `SearchActivity` interface matching the activity shape above
- Add `activities` state alongside existing `results`
- Parse `data.activities` from the edge function response
- Include activities in `clearResults`

### 3. `src/pages/Index.tsx`

- After the property result cards grid, render an "Things to Do" section when `travelSearch.activities.length > 0`
- Use a similar card layout: name, location, category badge, rating stars, description, and bestFor tags
- No "Review It" button on activities (they aren't properties)
- Update `hasSearchResults` to also check `travelSearch.activities.length`

### 4. Clearing behavior

No changes needed beyond the hook -- `clearResults` already gets called by `clearAllResults`, and it will now also reset the activities array.

## What the user sees

- Search "hidden gems in Rome" -> property cards appear, followed by a "Things to Do" section with activity cards
- Search "adults only resorts Punta Cana" -> only property cards appear (no activities section)
- Perplexity decides based on query intent whether to include activities

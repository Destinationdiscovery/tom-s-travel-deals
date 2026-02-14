

# Fix: Destination Search Showing Only Activities, No Properties

## Problem

When searching "hidden gems in Rome", Perplexity returned the `results` field as an **object** (containing only activities) instead of an **array** of properties. The edge function line `const results = parsed.results || parsed` passed that object through, and the frontend's `Array.isArray` check turned it into an empty array -- so no property cards appeared.

The API response looked like:
```text
{
  "results": { "activities": [...] },   // <-- object, not array!
  "activities": [...],
  "citations": [...]
}
```

## Fix

### 1. `supabase/functions/travel-search/index.ts`

Update the parsing logic after JSON is parsed:

- If `parsed.results` is an array, use it as properties
- If `parsed.results` is an object (not an array), check if it contains a nested `activities` array and merge that into the top-level activities
- Fall back: if `parsed.results` isn't an array, also check if `parsed` itself is an array (legacy format)
- Ensure `activities` is collected from both `parsed.activities` and any nested `parsed.results.activities`

Updated parsing (replacing lines 107-108):
```typescript
let results = [];
let activities = [];

if (Array.isArray(parsed.results)) {
  results = parsed.results;
} else if (Array.isArray(parsed)) {
  results = parsed;
}

if (Array.isArray(parsed.activities)) {
  activities = parsed.activities;
}

// Handle case where Perplexity nests activities inside results object
if (!Array.isArray(parsed.results) && parsed.results?.activities) {
  const nested = parsed.results.activities;
  if (Array.isArray(nested)) {
    activities = [...activities, ...nested];
  }
}
```

### 2. Prompt clarification (same file)

Add a line to the system prompt emphasizing:
- `results` MUST always be an array (empty array `[]` if no properties match)
- `activities` MUST always be an array (empty array `[]` if not applicable)

This is a belt-and-suspenders approach: the prompt tells Perplexity to use arrays, and the parsing handles it gracefully if it doesn't.

No frontend changes needed -- the hook already handles arrays correctly after the previous fix.

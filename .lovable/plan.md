

# Fix: Comprehensive Result Clearing Across All Search Types

## Problem

When switching between search types (destination, gear, requirements, advisories, news), previous results from other types are not fully cleared, causing stale content to remain visible alongside new results.

### Specific gaps found

| Scenario | What stays on screen |
|----------|---------------------|
| Do a destination review, then search gear | Destination review stays visible |
| Do a gear search, then search advisories | Packing list stays visible |
| Do any intel search, then search a destination | Intel results stay visible |
| Switch search type via dropdown | Only destination review is cleared, intel and gear remain |

## Root causes

1. The gear hook's `clearReview()` only clears the product review — not the packing list or error state
2. `handleInlineSearch` doesn't clear destination reviews
3. `handleSearch` (destination) doesn't clear intel or gear
4. `clearAllResults` only clears destination reviews

## Solution

### 1. `src/hooks/useGearIntel.ts`
- Add a `clearAll()` method that resets `packingData`, `reviewData`, and `error` to null

### 2. `src/pages/Index.tsx`
- Create a single `clearAllResults()` function that clears everything: `clearReview()` (destination), `intel.clearAll()`, and `gear.clearAll()`
- Call `clearAllResults()` at the start of both `handleSearch` and `handleInlineSearch`
- Call `clearAllResults()` in `handleSearchTypeChange`

This ensures that no matter which search type you use, all previous results from any other type are wiped first.


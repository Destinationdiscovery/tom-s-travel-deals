

# Fix Search Bar Layout + Execute All Searches Inline on Homepage

## Two Problems to Solve

1. **Layout**: The search button sits below the selector and input on desktop. It should be on the same row as the dropdown and input field -- all three elements in one horizontal line.

2. **Navigation problem**: When a user picks "Travel Advisories" and searches "Cuba", they get navigated away to the /travel-intel page where they have to search again. All search types should execute right on the homepage and show results below the hero, just like destination reviews already do.

---

## 1. Search Bar Layout Fix

**File: `src/components/HeroSection.tsx`**

Move the search button into the same flex row as the type selector and input. Change the layout from:

```text
[ Selector ] [ Input       ]
                [ Button ]
```

To:

```text
[ Selector ] [ Input       ] [ Button ]
```

On mobile, all three stack vertically (full width each). On desktop (sm+), they sit in one row.

- Move the `<Button>` inside the existing `flex-row` container (lines 134-212)
- Remove the outer `flex-col gap-3` wrapper since everything is now in one row
- The button gets `shrink-0` to prevent it from compressing

---

## 2. Execute All Searches Inline on the Homepage

Instead of navigating to /gear or /travel-intel, all search types will execute on the homepage and render their results below the hero section.

### Index.tsx Changes

- Import `useTravelIntel` and `useGearIntel` hooks
- Import the result display components (or create lightweight inline versions)
- Replace `handleNavigateSearch` (which uses `navigate()`) with inline handlers that call the appropriate hook functions
- Render gear results, travel intel results (advisories/requirements/news) below the hero, in the same spot where `AIReviewResult` appears
- When search type changes, clear all result states (destination review, gear, and intel)

### New rendering logic in Index.tsx

The results area below the hero will conditionally show:
- **Destination Review**: existing `AIReviewResult` component (no change)
- **Travel Gear**: gear packing list results with the `PackingResultCard` cards + product review panel
- **Travel Requirements**: requirements result card (reuse `RequirementsResult` from TravelIntel.tsx)
- **Travel Advisories**: advisories result card (reuse `AdvisoriesResult` from TravelIntel.tsx)
- **Travel News**: news result cards (reuse `NewsResult` from TravelIntel.tsx)

Only one result type is visible at a time, determined by the current search type.

### Component Extraction

To avoid duplicating code, extract the result display components from `TravelIntel.tsx` and `Gear.tsx` into shared files:
- **`src/components/intel/IntelResults.tsx`** -- exports `RequirementsResult`, `AdvisoriesResult`, `NewsResult`, `IntelLoading`, and `Citations` (moved from TravelIntel.tsx)
- **`src/components/gear/GearResults.tsx`** -- exports `PackingResultCard`, `ProductReviewPanel`, `GearLoading`, and helper functions (moved from Gear.tsx)

Both `TravelIntel.tsx` and `Gear.tsx` will import from these new shared files (no visual change on those pages).

### Requirements Special Case

Travel Requirements needs a citizenship field. When the user selects "Travel Requirements" and submits:
- Parse the query for "X to Y" pattern (e.g., "Canada to Cuba")
- If pattern matches: auto-set citizenship=X, destination=Y, and execute immediately
- If pattern doesn't match: treat the full query as destination and show a citizenship input prompt inline below the hero before executing

### HeroSection.tsx Props Update

- Add `onInlineSearch` prop: `(type: SearchType, query: string) => void`
- Non-destination searches call `onInlineSearch` instead of `onNavigateSearch`
- Remove `onNavigateSearch` prop

---

## Technical Summary

| File | Change |
|------|--------|
| `src/components/HeroSection.tsx` | Move button into same row as selector + input |
| `src/components/intel/IntelResults.tsx` | New file -- extracted intel result components |
| `src/components/gear/GearResults.tsx` | New file -- extracted gear result components |
| `src/pages/Index.tsx` | Add useTravelIntel + useGearIntel hooks, render all results inline |
| `src/pages/TravelIntel.tsx` | Import from shared intel components (no visual change) |
| `src/pages/Gear.tsx` | Import from shared gear components (no visual change) |


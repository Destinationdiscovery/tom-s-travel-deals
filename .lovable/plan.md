
# Fix: Clear Previous Results When Starting a New Search

## Problem

The `useTravelIntel` hook stores results in three separate state variables (`requirementsData`, `advisoriesData`, `newsData`). When you search for requirements and then search for advisories, the requirements data stays in state and both render on screen.

## Solution

Two small changes:

### 1. `src/hooks/useTravelIntel.ts`

Add a `clearAll` function that resets all three result states to `null`, and export it from the hook.

### 2. `src/pages/Index.tsx`

In `handleInlineSearch`, call `intel.clearAll()` at the top before dispatching the new search. This ensures previous intel results are wiped before new ones load.

Similarly, clear gear results when doing an intel search, and clear intel results when doing a gear search -- so only one result type is ever visible.

| File | Change |
|------|--------|
| `src/hooks/useTravelIntel.ts` | Add `clearAll()` method that sets all three data states to `null` |
| `src/pages/Index.tsx` | Call `intel.clearAll()` and `gear.clearReview()` + clear packing data at start of `handleInlineSearch` |

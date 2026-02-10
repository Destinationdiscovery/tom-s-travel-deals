

## Phase 3: Multi-Step Loading Experience

Replace the plain skeleton loader with a polished, staged progress indicator that walks users through what's happening while their AI review generates.

---

### New File: `src/components/ReviewLoadingStages.tsx`

A self-contained component that cycles through 5 stages on timed intervals:

| Stage | Label | Icon | Timing |
|-------|-------|------|--------|
| 1 | Searching traveler reviews... | Search | 0-3s |
| 2 | Analyzing ratings and feedback... | Star | 3-7s |
| 3 | Finding things to do nearby... | MapPin | 7-12s |
| 4 | Loading destination photos... | Camera | 12-18s |
| 5 | Compiling your review... | Sparkles | 18s+ |

**Behavior:**
- A progress bar at the top fills gradually (using timed intervals, not real backend progress)
- Each stage shows a spinner icon when active, a green checkmark when complete, and is dimmed when pending
- The component auto-advances through stages on a timer
- Stays on stage 5 indefinitely until the real review arrives
- Styled with the existing card/shadow design to match the site

---

### Modified File: `src/components/AIReviewResult.tsx`

- Import `ReviewLoadingStages`
- Replace the `<LoadingSkeleton />` call (lines 34-57) with `<ReviewLoadingStages />`
- The `LoadingSkeleton` component can be removed entirely

---

### No database changes, no new dependencies needed.

This is a small, self-contained change -- one new component and a one-line swap in `AIReviewResult.tsx`.


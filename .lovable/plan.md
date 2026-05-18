# Plan

## Task 1 — Packing checklist on /gear

Add a new section that appears on the packing results page, slotted **between `PackingNarrative` (Your Trip Briefing) and the product card grid**. Product cards stay untouched.

### New component: `src/components/gear/PackingChecklist.tsx`

Props: `items: GearItem[]` (existing type from `useGearIntel`).

Behavior:
- Derives a checklist from the same `packingData.items` already rendered as cards. Each item becomes one checkbox row using `item.name`.
- Groups rows by `item.category`, ordered as: **Packing, Clothing, Beach, Tech, Health**, then any other category last.
- Checked state lives in local component state: `Record<string, boolean>` keyed by item name. Persisted to `localStorage` under `rtg:packing-checklist:<searchSlug>` so a refresh keeps state. (Slug derived from the same query that produced the list, passed in as a prop alongside items.)
- Header: title "Your Packing Checklist", small counter underneath `"X of Y items packed"` that updates live.
- Top-right controls: text buttons **Check all** / **Uncheck all**.
- Row UI: shadcn `Checkbox` + label. When checked: label gets `line-through text-muted-foreground`.
- Category subheaders use the existing `categoryColors` / `categoryIcons` maps already defined in `GearResults.tsx` (export them, or duplicate locally).
- Wrapped in the same card shell used by `PackingNarrative` (`bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border/50`) for visual consistency.

### Wiring

In `src/pages/Gear.tsx`, inside the `packingData && !reviewData && !reviewLoading` branch, render `<PackingChecklist items={packingData.items} querySlug={searchQuery} />` directly after `<PackingNarrative />` and before the product grid.

No backend writes. (Logged-in persistence to `trip_packing_items` is out of scope here; Task 2's save bar covers the broader trip-save flow.)

---

## Task 2 — Sticky save action bar across tool result pages

Pages: `/gear`, `/itinerary`, `/best-time`, `/safety`, `/travel-intel`, `/currency`, `/flights`, `/destinations`.

### New component: `src/components/tools/ToolSaveBar.tsx`

Props:
```
{
  toolType: "gear" | "itinerary" | "best-time" | "safety" | "travel-intel" | "currency" | "flights" | "destinations";
  label: string;                       // left-zone summary, e.g. "Cancun beach trip · 18 packing items"
  destination?: string;                // used to seed trip name / SaveMomentPrompt
  payload: Record<string, any>;        // tool result data, serialized for save + export
  onExportPdf: () => void;             // page-supplied (uses window.print scoped or html2pdf if needed)
  onCopy: () => Promise<string>;       // returns plain-text version for clipboard
}
```

Behavior — three states driven by `useAuth()` + `useActiveTrip()`:

1. **Logged in + active trip exists** → primary button `Add to {trip.name}`. Click writes the payload into the matching child table for that trip:
   - gear → `trip_gear_items` (one row per item; reuses existing schema)
   - itinerary → `trip_itinerary_days`
   - best-time / safety / travel-intel (visa) / currency → `trip_logistics` (jsonb columns + matching `*_checked` flag)
   - flights → store under `trip_logistics` as new `flights` jsonb (small migration adding nullable column, see Technical notes)
   - destinations → `trip_hotels` (reuse existing AddToTripButton pattern)
   On success: toast "Added to {trip name}" with link to `/my-trips/{slug}`.

2. **Logged in, no active trip** → primary button `Save to a trip`. Click opens a popover/dropdown listing the user's trips (same query AddToTripButton uses) plus an inline "+ New trip" name field. Selecting one or creating a new one then runs the same insert as state 1.

3. **Logged out** → primary button `Save this to a trip plan`. Click opens the existing `SaveMomentPrompt` in a `Dialog` (it already handles trip-name + email + magic link). After the magic-link is sent, the payload is stashed in `sessionStorage` under `rtg:pending-save` so it can be flushed into the new trip after the user lands on `/my-trips` post-auth (handled by a tiny `useEffect` in `MyTrips.tsx`).

### Layout

- Fixed bar: `fixed inset-x-0 bottom-0 z-40 bg-card/95 backdrop-blur border-t shadow-[0_-4px_20px_rgba(0,0,0,0.06)]`.
- Inner container: `container mx-auto px-4 py-3 flex items-center gap-4`.
- Desktop zones: left label (flex-1, truncate), center primary button, right two text links `Export PDF` and `Copy to clipboard` (`text-sm text-muted-foreground hover:text-primary`).
- Mobile (`< sm`): stacks. Label on top row, primary button full-width on next row, two text links centered below.
- Visibility: bar only mounts once results exist on the page (each tool page passes `visible={hasResults}`). To avoid covering the footer, page main wrappers get `pb-28 md:pb-24` when the bar is shown.

### Per-page integration

Each page already has a `hasResults` style flag. Add at end of page (before `<Footer />`):
```
{hasResults && (
  <ToolSaveBar toolType="…" label={summaryLabel} destination={…} payload={…}
               onExportPdf={…} onCopy={…} />
)}
```
- `summaryLabel` is computed per tool, e.g. gear: `${query} · ${items.length} packing items`; itinerary: `${destination} itinerary · ${days.length} days planned`; safety: `${destination} safety score generated`; etc.
- `onExportPdf`: simplest path is `window.print()` with a print-only CSS rule that hides the save bar + chrome and shows the results section. (Site already has print optimization for #quote-preview; we'll add a `.tool-print-region` class wrapping each tool's results card and a matching print rule in `index.css`.)
- `onCopy`: each page builds a markdown / plain-text summary from its result data and writes via `navigator.clipboard.writeText`. Show a toast on success.

### Technical notes

- New util: `src/lib/pendingToolSave.ts` with `stash(payload)` / `consumeAndApply(tripId)` to flush logged-out saves after magic-link sign-in.
- `MyTrips.tsx` gets a `useEffect` that, on auth land with a `pending-save`, looks up the newest trip and applies the payload, then clears storage.
- Migration (small): add nullable `flights jsonb` column to `trip_logistics` so flights tool can save. No other schema changes needed (gear/itinerary/hotels/packing already exist; intel uses existing jsonb columns).
- Reuse `useActiveTrip` hook for the "active trip" detection (already returns most-recently-updated trip).
- Reuse `SaveMomentPrompt` verbatim — render it inside a `Dialog` from `ToolSaveBar` for the logged-out flow.
- Punctuation rule respected (no em/en dashes; use `·` separator as shown in the examples).

### Files

New:
- `src/components/gear/PackingChecklist.tsx`
- `src/components/tools/ToolSaveBar.tsx`
- `src/lib/pendingToolSave.ts`

Edited:
- `src/pages/Gear.tsx` (insert checklist + save bar)
- `src/pages/Itinerary.tsx`, `BestTime.tsx`, `Safety.tsx`, `TravelIntel.tsx`, `Currency.tsx`, `Flights.tsx`, `Destinations.tsx` (mount save bar + provide payload/label/handlers)
- `src/pages/MyTrips.tsx` (consume pending save)
- `src/index.css` (print rule for `.tool-print-region`)
- Migration: add `flights jsonb` to `trip_logistics`.

No changes to product card markup, no other UI shifts.

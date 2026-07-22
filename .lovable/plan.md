## Goal

In Agent HQ, generating a Featured Packing List should feel exactly like using the public /gear tool: type a query ("Sorrento beach August"), the AI builds the packing list with narrative + checklist + product cards, and you can then edit, add notes, add/remove items, and publish it as a featured list.

## What changes

Rework `FeaturedPackingListsManager.tsx` so it becomes a two-mode panel:

1. **List browser** (default): shows all existing featured lists (draft/live) with edit / publish / delete / view actions.
2. **Editor view** (opens when you Create or click a list): renders the same components the /gear tool uses, plus admin controls.

### Editor view layout (reuses public tool)

```text
[ Search box: "Where are you going? e.g. Sorrento beach August" ] [Generate]
   ↓ (calls the same useGearIntel.fetchPackingList)
─────────────────────────────────────────────
Title  [inline editable]        Season / Trip types  [inline]
Cover image  [upload / URL]     Live toggle · Save · View
─────────────────────────────────────────────
<PackingNarrative>              ← from GearResults, editable textarea overlay
<PackingChecklist>              ← from PackingChecklist (visual parity)
<PackingResultCard grid>        ← from GearResults, with per-card Notes textarea + Remove
[ + Add item manually ]         ← name / category / affiliate URL / notes
```

- The generate step calls `useGearIntel().fetchPackingList(query)` (same hook the public tool uses), so admins see the identical output.
- On "Save to list", we persist the AI narrative into `featured_packing_lists.description` (or a new `narrative` column, see Technical) and each item into `featured_packing_list_items` with `label`, `category`, `amazon_url` (from `amazonUrl`), `image_url` (from `imageUrl`), `notes`.
- After save, editor stays open and switches into "loaded list" mode: same UI, but items come from the DB and every edit (label, category, notes, url, add, delete) autosaves like the trip workspace notes do today.
- "Import from trip" and "Create blank curated list" remain available as secondary entry points into the same editor.

### Admin extras on top of the public tool

- Per-item **Notes** textarea (autosaves) directly under each product card.
- Per-item **Edit** for label, category and affiliate URL.
- **Add item** row (manual entry) at the end of the grid.
- **Regenerate** button to rerun the AI for the same query without losing already-saved manual items (new AI items are appended, duplicates by name are skipped).
- **Live/Draft** toggle and public **View** link.

### Public `/packing-lists/:slug` page

Update `PackingListDetail.tsx` to render using the same visual pieces (`PackingNarrative`, `PackingChecklist`, `PackingResultCard`) so what admins preview matches what visitors see. Review-this / affiliate CTA behavior stays.

## Technical notes

- Add optional `narrative TEXT` column to `featured_packing_lists` (migration) so the AI briefing survives across sessions. Existing rows unaffected.
- No new tables. Existing `featured_packing_list_items` already has `label`, `category`, `notes`, `amazon_url`, `image_url` — enough to store /gear items.
- `useGearIntel` is client-side only, no changes needed; reuse as-is.
- Autosave pattern: debounce 500ms per field, same as trip workspace item notes.
- `PackingResultCard`'s "Review This" button (product reviews) is left interactive in admin so you can vet items before saving.

## Out of scope

- No changes to the /gear public tool itself.
- No changes to gear reviews manager.
- No changes to the discovery hub cards.

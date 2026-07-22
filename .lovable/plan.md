## Simplify Packing List (client + admin)

Strip the packing tool down to a clean generic checklist. No product names, no brand cards, no affiliate links anywhere. Both client and admin see the same list; admin gets extra editing controls.

### What the list looks like everywhere
- AI-generated trip briefing (narrative) at top.
- Single checklist grouped by category (Packing, Clothing, Beach, Tech, Health, etc.).
- Each row = generic item name only (e.g. "Polarized sunglasses", "Hard shell suitcase", "Beach tote bag") + checkbox.
- User-added items appear in the same category but visually distinct (accent color + small "Added" tag).
- "Add item" input at bottom of each category (or one global add with category dropdown).
- Notes section at bottom.

### Client side (`/gear` tool + public `/packing-lists/:slug`)
- Remove `PackingResultCard` grid (brand/image/price/Amazon button) entirely.
- Remove the "gear picks" affiliate card section on the public list page.
- Keep narrative + checklist + add-item + visitor notes (localStorage per list).
- Added items get accent styling + "Added" badge; persist in localStorage on `/gear`, in localStorage on public list pages.

### Admin side (`FeaturedPackingListsManager`)
- Same clean checklist view (no product cards, no affiliate URL fields, no per-item internal notes textareas).
- Admin can:
  - Edit the AI briefing/write-up (textarea).
  - Rename any item inline.
  - Add items (marked as admin-added, shown in accent color to visitors too — "Tom's pick").
  - Remove items.
  - Recategorize items (small category dropdown per row).
  - Edit the bottom notes block (already exists as `admin_notes`).
  - Toggle Live/Draft, edit title/description/cover.
- Autosave preserved.

### Data
- Keep existing `featured_packing_list_items` table; stop writing `brand`, `image_url`, `amazon_url`, `price_range`, per-item `notes`. No migration required (columns stay, just unused). `is_custom` flag stays to color admin-added items on the public view.
- `GearItem` rendering on `/gear` becomes name-only; underlying `useGearIntel` response can keep returning full data (ignored in UI).

### Files to change
- `src/pages/Gear.tsx` — replace results grid with new `PackingChecklistClean` component; keep narrative + add-item + notes.
- `src/components/gear/PackingChecklist.tsx` — extend with add-item control, user-added highlighting, notes textarea (or wrap in a new client component).
- `src/components/gear/GearResults.tsx` — retire `PackingResultCard` from client flow (keep file for now, unused export can go).
- `src/components/dashboard/FeaturedPackingListsManager.tsx` — replace product-card editor with checklist editor (rename / category / delete / add).
- `src/pages/PackingListDetail.tsx` — remove "gear picks" affiliate cards; render clean checklist with admin-added highlight + admin notes at bottom.

### Out of scope
- `useGearIntel` / `travel-gear-intel` edge function stays as-is (still generates the item list).
- Trip Workspace packing (separate feature) — unchanged.

### Open question
Confirm: on `/gear` (client tool), should user-added items persist across sessions via localStorage keyed by the query, same pattern as check state? (Assuming yes.)

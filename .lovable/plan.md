## Problems

1. **Wrong photos.** The `generate-quote` function blindly searches Google Places using `metadata.resort_name`. When the trip is an Alaska cruise on the **Grand Princess** ship, Google returns a "Grand Princess" resort/property and that wrong photo gets injected into the quote. The function has no concept of "this is a cruise" and never falls back to destination photos (Alaska).
2. **Edit does not actually let you change anything.** Edit mode opens a markdown textarea, but:
   - Pictures are embedded as raw `![](url)` markdown lines, which is not obvious or easy to delete.
   - There is no quick way to remove an unwanted photo.
   - Saved edits do not always persist visibly because the auto-save runs again right after and can race with the change.

## Plan

### 1. Make photo selection cruise-aware in `supabase/functions/generate-quote/index.ts`

- Extend the metadata extraction tool to also return:
  - `trip_type`: `"cruise" | "resort" | "tour" | "other"`
  - `ship_name`: cruise ship name if applicable (e.g. "Grand Princess")
  - `cruise_line`: e.g. "Princess Cruises"
  - `destination_query`: the best photo search phrase for the destination (e.g. "Alaska cruise scenery", "Glacier Bay Alaska")
- New photo logic:
  - If `trip_type === "cruise"`:
    - First try Google Places with a ship-specific query like `"<ship_name> cruise ship <cruise_line>"`.
    - Validate result: discard if the returned place `types` include `lodging`, `hotel`, `resort`, or `tourist_attraction` without `travel_agency`/`point_of_interest` matching cruise terms. If invalid, skip ship photos.
    - Then fetch destination photos using `destination_query` (e.g. "Alaska cruise", "Glacier Bay", "Juneau Alaska").
    - Combine: up to 1 ship photo + 3 destination photos.
  - If `trip_type === "resort"` (current behavior):
    - Search by `resort_name + destination` (more specific than resort_name alone) to reduce wrong matches.
    - Validate that the returned place is `lodging` / `hotel` / `resort`. If not, fall back to destination photos only.
  - Otherwise: destination photos only.
- Update `fetchPlacePhotos` to accept an optional `requiredTypes` filter and return both photo refs and the matched place name, so we can log and reject mismatches.
- Add a "negative" guard: never inject a photo whose matched place name does not contain at least one keyword from the resort/ship/destination. This stops "Grand Princess resort" from sneaking in when we asked for the ship.

### 2. Tell the model not to hallucinate the trip type

- Update the markdown prompt to clearly state: if the trip is a cruise, label it as a cruise, mention the ship and itinerary ports, and never describe it as a resort stay.
- Update the metadata tool description to require `trip_type` and `destination_query`.

### 3. Fix the edit experience in `src/components/dashboard/QuotePreview.tsx`

- Keep the existing markdown textarea, but add a dedicated **Pictures** panel above it when in edit mode for AI-generated quotes:
  - Parse the markdown for image lines (`![alt](url)`).
  - Show each image as a small thumbnail with a **Remove** button.
  - Add a **Replace with destination photo** button that swaps a picture for the next destination photo (using a small new helper or simply removes it for now if no replacement is available).
  - Add an **Add image URL** input so the agent can paste a known-good photo URL.
- When Save Changes is clicked:
  - Apply edits to `quote.quoteMarkdown` immediately.
  - Call `onUpdate` once with the final markdown.
  - Prevent the auto-save loop on step 4 from racing the manual save by guarding the auto-save effect to skip while `isEditing` was true and only re-trigger if content actually changed.
- Also fix a subtle bug: after `saveEdit`, the parent triggers `handleSave` via `setTimeout(0)`, which can overwrite local state if `quote` is read stale. Switch the `onUpdate` wiring in `QuoteBuilder.tsx` to use the functional `setQuote` form (already does) and only call `handleSave` when not already saving.

### 4. Small UX touches

- Show a clear note in edit mode: "Tip: remove or replace any photo that does not match the trip. You can also edit any text below."
- If the function returns zero valid photos, do not inject anything (current behavior already handles this, but add a log line so we can confirm in edge function logs).

## Files to update

- `supabase/functions/generate-quote/index.ts` (cruise-aware photo logic, validation, prompt tweaks, metadata schema additions)
- `src/components/dashboard/QuotePreview.tsx` (Pictures panel in edit mode, safer save flow)
- `src/components/dashboard/QuoteBuilder.tsx` (guard auto-save while editing, pass current saving state)

## Expected result

- Cruise quotes use ship and destination photos, never a random resort with the same name.
- Resort quotes only inject photos when the matched Google place is actually a hotel/resort, otherwise they fall back to destination photos.
- Edit mode lets the agent remove or replace pictures with one click and edit any text, and the changes actually stick after save.

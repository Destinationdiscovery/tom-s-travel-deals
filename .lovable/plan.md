
User wants the Trip Packing Toolkit (/gear) to show a narrative write-up BEFORE the product cards, summarizing the trip and explaining each essential in sentence form, then the cards below.

Let me check the current structure quickly. From context:
- `useGearIntel.ts` returns `GearIntelData { items, citations }`
- `GearPreviewSection.tsx` (homepage) renders `PackingResultCard` grid
- `/gear` page uses `GearResults` component
- Edge function: `travel-gear-intel`

Need to:
1. Add `narrative` (string) field to `GearIntelData` type
2. Update edge function `travel-gear-intel` to generate a narrative paragraph(s) intro alongside items, mentioning destination/season and weaving in why each item matters
3. Render the narrative ABOVE the grid in both:
   - `src/pages/Gear.tsx` (or `GearResults.tsx`)
   - `src/components/GearPreviewSection.tsx` (homepage inline results)

Plan is small and focused. Present it.

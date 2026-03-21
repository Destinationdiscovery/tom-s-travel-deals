

# Fix Empty Blog Articles + Rename "AI Itinerary Builder"

## Problem 1: New blog articles show empty content
The 5 newer guide articles in the database use `content` as the field name in their `rich_content` JSON blocks, while the renderer expects `value`. This causes empty article pages.

**Fix in `src/pages/CompassArticle.tsx`**:
- In `renderContentBlock`, read `block.value || (block as any).content` to handle both field names
- Same fallback in the `jsonLdDescription` extraction line

## Problem 2: Rename "AI Itinerary Builder" → "Itinerary Builder"
Remove "AI" from all references.

**Files to update**:
| File | Change |
|------|--------|
| `src/pages/Itinerary.tsx` | H1: "Itinerary Builder", SEO title, description |
| `src/components/ItineraryPreviewSection.tsx` | Section heading |
| `src/components/Header.tsx` | Tools dropdown label (if it says "AI Itinerary") |

## Files

| File | Action |
|------|--------|
| `src/pages/CompassArticle.tsx` | Fix content field fallback (`value` || `content`) |
| `src/pages/Itinerary.tsx` | Remove "AI" from title/heading |
| `src/components/ItineraryPreviewSection.tsx` | Remove "AI" from heading |


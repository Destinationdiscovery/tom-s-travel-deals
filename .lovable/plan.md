

## Two Changes: Better "Things to Do" Cards + Repositioned "Compiled from Real Travelers" Label

---

### Change 1: "Compiled from Real Traveler Reviews" Next to the Rating

**Problem:** The "Compiled from Real Traveler Reviews" label sits above the property name, far from the star rating. Users may confuse the 4.1/5 rating as the resort's official rating rather than ReviewThenGo's AI-curated score.

**Solution:** Move the Sparkles badge + "Compiled from Real Traveler Reviews" text inline with the star rating inside the Summary Card, right after the numeric score. Remove it from the header above the property name. Keep the subtitle text ("AI-curated summary...") as a small note below the stars.

**File:** `src/components/AIReviewResult.tsx`

- Remove the Sparkles/label block from the header section (lines 91-97)
- Inside the Summary Card (line 115), after the star rating number, add: `Sparkles icon + "Compiled from Real Traveler Reviews"` inline
- Below the star row, add the "AI-curated summary..." subtitle in small muted text

---

### Change 2: Redesign "Things to Do" Cards

**Problems identified:**
- Category badges (Sightseeing, Culture, Nature) use color combos that are hard to read in some themes
- Cards are interactive affiliate links disguised as content -- feels clickbaity
- No visual richness (no images, no ratings)

**Solution:** Make the cards informational with a photo, a star rating, and remove the affiliate button. The "Explore more things to do" link at the bottom is sufficient for monetization.

**Backend change (edge function):** Update the Perplexity prompt to also return a `rating` (1-5, one decimal) for each thing to do. No photo from Perplexity -- we'll use a Google Places photo for each activity.

**Frontend changes:**

1. **Update `ThingToDo` interface** in `src/hooks/useGenerateReview.ts` to add `rating: number` and optional `photoReference?: string`

2. **Update generate-review edge function** (`supabase/functions/generate-review/index.ts`):
   - Add `"rating": number 1-5` to the thingsToDo prompt schema
   - After getting the Perplexity response, fetch a Google Places photo for each of the 3 activities (search by activity name + location) -- reuse the existing `fetchPlacePhotos` logic but grab just 1 photo per activity
   - Attach `photoReference` to each thingsToDo item

3. **Redesign cards** in `src/components/review/ThingsToDoSection.tsx`:
   - Add a photo at the top of each card (using the place-photos function URL, same pattern as PhotoGallery)
   - Replace the hard-to-read category Badge with a simple text label in consistent foreground color
   - Add a small star rating row (e.g., 4.2 stars) below the activity name
   - Remove the "Find tours & tickets" button from each card entirely
   - Keep only the single "Explore more things to do" link at the bottom for monetization

4. **Pass `functionUrl`** to `ThingsToDoSection` from `AIReviewResult.tsx` so it can render photos

---

### Technical Summary

| File | Change |
|------|--------|
| `src/components/AIReviewResult.tsx` | Move "Compiled from Real Traveler Reviews" inline with star rating in Summary Card; pass `functionUrl` prop to ThingsToDoSection |
| `src/hooks/useGenerateReview.ts` | Add `rating` and `photoReference` to `ThingToDo` interface |
| `supabase/functions/generate-review/index.ts` | Add `rating` to prompt; fetch 1 Google Places photo per activity after Perplexity response |
| `src/components/review/ThingsToDoSection.tsx` | Redesign cards: add photo + star rating, remove affiliate button per card, fix category text readability |

**No new dependencies. No database schema changes.** Existing cached reviews without the new fields will still render fine (rating/photo are optional).


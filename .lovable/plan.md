

## Interactive Site Demo Promo

Replace the current destination photo slideshow with a scripted walkthrough that showcases what ReviewThenGo actually does. The entire thing is a self-contained animation — no real API calls, all fake data.

---

### What the viewer will see (sequence)

1. **Hero reveal** (~2s) -- The hero section fades in with the "REVIEW THEN GO" branding and search bar, exactly matching the real site
2. **Typing animation** (~3s) -- A cursor appears in the search bar and types "Sandals Royal Barbados" one character at a time
3. **Suggestions dropdown** (~1.5s) -- Fake autocomplete suggestions slide in (e.g., "Sandals Royal Barbados", "Sandals Montego Bay", "Sandals Grenada")
4. **Selection + search** (~1s) -- The first suggestion highlights and gets "clicked", the button changes to "Searching..."
5. **Loading stages** (~5s) -- A miniature version of the ReviewLoadingStages component plays through all 5 stages with the progress bar filling up
6. **Review result reveal** (~4s) -- A mock review card slides up showing property name, 4.5-star rating, summary text, rating bars, and photo thumbnails
7. **Branding finale** (~3s) -- Everything fades to black, the "REVIEW THEN GO" logo animates in with the tagline "Know what to expect before you go."

Total duration: ~20 seconds

---

### Technical approach

**Single new component**: `src/components/PromoDemoWalkthrough.tsx`

This replaces the content inside `PromoSlideshow.tsx`. The component uses a linear state machine driven by `useEffect` timers:

```text
State flow:
HERO_REVEAL -> TYPING -> SUGGESTIONS -> SELECT -> LOADING -> REVIEW -> BRANDING -> (loop or finish)
```

Each state triggers the next after a set delay. All UI is rendered inline (not using the real HeroSection or ReviewLoadingStages) to keep it self-contained and avoid side effects.

**Key animations:**
- Typing effect: `setInterval` adding one character every 80ms to a displayed string
- Suggestions: opacity + translateY transition
- Loading stages: reuses the same visual design as `ReviewLoadingStages` but with hardcoded faster timings
- Review card: slide-up with opacity transition
- All transitions use Tailwind classes + inline style opacity/transforms

**Mock data (hardcoded):**
- Search query: "Sandals Royal Barbados"
- Suggestions: 3 fake results
- Review: property name, 4.5 rating, short summary, 4 rating categories, "Best For" tags
- No real images needed for the review mock — uses colored placeholder blocks or existing assets

---

### Files to modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/components/PromoDemoWalkthrough.tsx` | The scripted demo animation component |
| Modify | `src/components/PromoSlideshow.tsx` | Replace photo slideshow content with the new demo walkthrough |
| Modify | `src/pages/Promo.tsx` | Keep working with the updated PromoSlideshow (no changes needed if props stay the same) |

No new dependencies. No Tailwind config changes needed — existing animations cover everything.

---

### How it differs from the current slideshow

| Current | New |
|---------|-----|
| Cycles through 8 destination photos | Simulates a real user journey |
| Shows destination names as text overlays | Shows the actual site UI (search bar, loading, review) |
| ~35 seconds total | ~20 seconds total |
| Showcases destinations | Showcases the product/feature |

The homepage intro and `/promo` social recording route both continue to work the same way (once per session on homepage, looping on `/promo`).

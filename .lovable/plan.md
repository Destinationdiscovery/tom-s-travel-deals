

## Multi-Color Hero Title, Consistent Subheadings, and Increased Header/Footer Text

### 1. Multi-Color Hero Title ("REVIEW THEN GO")

Each word in the hero title will use a different color, and the same palette will carry into the Header and Footer logo text. Color scheme:

| Word | Color | Tailwind Class |
|------|-------|----------------|
| REVIEW | Sky-300 (light blue) | `text-sky-300` (unchanged) |
| THEN | Amber-400 (warm gold) | `text-amber-400` |
| GO | Emerald-400 (green) | `text-emerald-400` |

The Header logo ("ReviewThenGo") and Footer logo will match:
- "Review" = sky-300
- "Then" = amber-400
- "Go" = emerald-400

**Files:** `src/components/HeroSection.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`

---

### 2. Consistent Subheadings Across All Pages

Right now subheadings vary between `text-xl`, `text-2xl`, and `text-3xl`. All section subheadings (h2/h3 within review content, sidebar cards, Things to Do, tips, gallery, etc.) will be standardized to:

**`font-display text-2xl font-bold`** -- consistent across every results/review page.

Files affected and what changes:

| File | Current | Change to |
|------|---------|-----------|
| `AIReviewResult.tsx` -- "Photos" | `text-xl` | `text-2xl` |
| `AIReviewResult.tsx` -- "Rating Breakdown" | `text-xl` | `text-2xl` |
| `AIReviewResult.tsx` -- "Location" | `text-xl` | `text-2xl` |
| `ThingsToDoSection.tsx` -- "Things to Do Nearby" | `text-2xl` | Already correct |
| `DestinationReview.tsx` -- "Rating Breakdown" | `text-xl` | `text-2xl` |
| `DestinationReview.tsx` -- "My Experience", "Video Review", "Tom's Tips", "Photo Gallery" | `text-2xl` | Already correct |
| `CompassArticle.tsx` -- "More from The Compass" | `text-2xl md:text-3xl` | `text-2xl` |

---

### 3. Increase Header and Footer Text Sizes

**Header:**
- Logo name: `text-2xl` to `text-3xl`
- Subtitle: `text-xs` to `text-sm`
- Nav links: `text-base` to `text-lg`

**Footer:**
- Logo name: `text-2xl` to `text-3xl`
- Subtitle: `text-xs` to `text-sm`
- Description paragraph: `text-base` to `text-lg`
- Nav links: `text-base` to `text-lg`
- "Explore" heading: keep or bump slightly
- Bottom bar text ("Made with..." and copyright): `text-sm` to `text-base`
- Travelonly link: `text-sm` to `text-base`

---

### Technical Summary

| File | Changes |
|------|---------|
| `src/components/HeroSection.tsx` | "THEN" to `text-amber-400`, "GO" to `text-emerald-400` |
| `src/components/Header.tsx` | Split "ThenGo" into colored spans; increase logo, subtitle, and nav text sizes |
| `src/components/Footer.tsx` | Split "ThenGo" into colored spans; increase all text sizes |
| `src/components/AIReviewResult.tsx` | Normalize sidebar/card headings from `text-xl` to `text-2xl` |
| `src/pages/DestinationReview.tsx` | "Rating Breakdown" from `text-xl` to `text-2xl` |
| `src/pages/CompassArticle.tsx` | "More from The Compass" from `text-2xl md:text-3xl` to `text-2xl` |




## Enhanced Promo Walkthrough: Full Review + Compare Feature

Expand the REVIEW stage and add a new COMPARE stage to the walkthrough, making the demo richer and more representative of the actual site experience.

---

### Updated stage flow

```text
HERO_REVEAL -> TYPING -> SUGGESTIONS -> SELECT -> LOADING -> REVIEW -> SAVE_ACTION -> COMPARE -> BRANDING
```

Two new stages are added between REVIEW and BRANDING:

- **SAVE_ACTION** (~2s): A "Save to Compare" button animates a click, then a floating badge appears showing "2/5 saved - Compare Now"
- **COMPARE** (~4s): A mock comparison view slides in showing two property cards side-by-side with a "ReviewThenGo Verdict" winner card

---

### Changes to the REVIEW stage

The current review card is minimal. It will be expanded to include:

1. **Photo gallery row**: A 2x3 grid of actual destination photos using existing assets (e.g., `cuba-gallery-1.jpg` through `cuba-gallery-6.jpg`) displayed as rounded thumbnail tiles
2. **"What Travelers Say" section**: 1-2 short mock review paragraphs below the photos
3. **Sidebar-style layout**: On desktop, show the rating breakdown + "Best For" tags in a right column (mirroring the real 2-column layout from `AIReviewResult.tsx`)
4. **"Save to Compare" button**: Visible at the bottom of the sidebar

The REVIEW stage duration increases from 4s to ~6s to give viewers time to absorb the richer content, with an auto-scroll animation that slowly scrolls the review card upward to reveal photos and ratings.

---

### SAVE_ACTION stage details (~2s)

After the review is shown:
- The "Save to Compare" button visually "clicks" (brief scale-down + color change to filled state showing "Saved")
- A floating badge animates into the bottom-right corner: "2/5 saved - Compare Now" (implying a previous save)
- After ~1.5s, the badge pulses once, then transitions to COMPARE

---

### COMPARE stage details (~4s)

A mock comparison view slides in showing:
- Two property cards side-by-side: "Sandals Royal Barbados" (4.5) and "Hyatt Zilara Cap Cana" (4.3)
- Each card has: name, star rating, 3-4 rating bars, and "Best For" tags
- Below the cards: A "ReviewThenGo Verdict" banner with a trophy icon, the winner name highlighted in primary color, and a one-line recommendation
- After ~3.5s, everything fades to black transitioning into the existing BRANDING finale

---

### Mock data additions

```text
Second property (for compare):
  Name: Hyatt Zilara Cap Cana
  Location: Punta Cana, Dominican Republic
  Overall: 4.3
  Ratings: Location 4.7, Service 4.4, Amenities 4.2, Value 4.0
  Best For: Adults Only, Beach, Relaxation
```

---

### Photos for the review gallery

Use these existing assets as mock gallery thumbnails (no API calls):
- `cuba-gallery-1.jpg`
- `cuba-gallery-2.jpg`
- `cuba-gallery-3.jpg`
- `cuba-gallery-4.jpg`
- `cuba-gallery-5.jpg`
- `cuba-gallery-6.jpg`

---

### Files to modify

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/components/PromoDemoWalkthrough.tsx` | Add photo gallery to review, add SAVE_ACTION and COMPARE stages, add mock second property data, add auto-scroll effect on review |

No new files needed. No dependency changes.

---

### Timing summary

| Stage | Duration | What happens |
|-------|----------|--------------|
| HERO_REVEAL | 2s | Brand + search bar fade in |
| TYPING | ~2.5s | Types "Sandals Royal Barbados" |
| SUGGESTIONS | 1.5s | Dropdown appears |
| SELECT | 1s | First item highlights, button says "Searching..." |
| LOADING | ~4s | Progress bar + 5 loading stages |
| REVIEW | 6s | Full review card with photos, ratings, paragraphs, auto-scroll |
| SAVE_ACTION | 2s | Save button clicks, floating badge appears |
| COMPARE | 4s | Two cards + verdict banner |
| BRANDING | 3.5s | Logo + tagline fade in |
| **Total** | **~26.5s** | |


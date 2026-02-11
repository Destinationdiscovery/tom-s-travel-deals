

# Promo Walkthrough: Better Pacing and Skip Button Visibility

## Pacing Changes

The current total is ~7.4 seconds, which feels rushed. Here's a revised timeline that stretches to ~12 seconds -- still punchy but gives each scene enough breathing room to register:

| Stage | Current | Proposed | Why |
|-------|---------|----------|-----|
| HERO_REVEAL | 1.2s | 2.0s | Let the brand name land; viewers need a moment to orient |
| REVIEW_FLASH | 1.2s | 2.5s | The review card has photos, ratings, and text -- needs time to be read |
| INTEL_FLASH | 1.5s | 2.5s | Three tabs cycling at 0.5s each is too fast to register; bump to ~0.7s per tab |
| GEAR_FLASH | 1.0s | 1.5s | Slight breathing room for the product card |
| COMPARE_FLASH | 1.0s | 1.5s | Let the verdict banner sink in |
| BRANDING | 1.5s | 2.0s | Stronger closing beat |
| **Total** | **~7.4s** | **~12s** | Still under 15s (ideal for Reels/TikTok) |

## Skip Button Changes

Currently the skip button is small, semi-transparent text with a thin border (`text-white/60`, `border-white/20`, `text-sm`). It blends into the background. Changes:

- Increase text opacity to full white (`text-white`)
- Use a solid semi-transparent background (`bg-white/15 backdrop-blur-md`)
- Bump font size to `text-base`
- Add slightly thicker border (`border-white/40`)
- Add a subtle pulse or glow on first appearance so users notice it

## Technical Details

### File: `src/components/PromoDemoWalkthrough.tsx`
- Update stage timings in the `useEffect` switch statement:
  - `HERO_REVEAL`: 1200 -> 2000
  - `REVIEW_FLASH`: 1200 -> 2500
  - `INTEL_FLASH`: 1500 -> 2500
  - `GEAR_FLASH`: 1000 -> 1500
  - `COMPARE_FLASH`: 1000 -> 1500
  - `BRANDING`: 1500 -> 2000
- Slow down the auto-scroll interval in `REVIEW_FLASH` (reduce increment from 8 to 4 per tick for smoother scrolling over the longer duration)

### File: `src/components/promo/PromoIntelScene.tsx`
- Increase tab cycling interval from 500ms to ~700ms to match the longer `INTEL_FLASH` duration

### File: `src/components/PromoSlideshow.tsx`
- Update skip button classes:
  - From: `text-white/60 hover:text-white text-sm border-white/20 hover:border-white/40 backdrop-blur-sm`
  - To: `text-white hover:text-white text-base font-semibold border-white/40 hover:border-white/60 bg-white/15 backdrop-blur-md shadow-lg`
- Add an entrance animation (e.g., `animate-fade-in`) so the button draws the eye when the promo starts


## Goal
Remove em-dashes from user-facing copy and fix the 3 leftover JSX build errors so the site builds cleanly and is ready to publish.

## Changes

### 1. Em-dash replacements (per the site-wide no-em-dash rule)
Replace each `—` with a comma + space (or split sentence) in:

- `src/components/HeroSection.tsx` line 76
  - Before: `The only travel planning tool you need — free, honest, and powered by 10+ trusted review sources.`
  - After: `The only travel planning tool you need. Free, honest, and powered by 10+ trusted review sources.`
- `src/components/NewsletterCTASection.tsx` line 48
  - `... travel news — every week, free.` to `... travel news. Every week, free.`
- `src/pages/About.tsx`
  - line 23: `No stock photos here — our reviews ...` to `No stock photos here. Our reviews ...`
  - line 40 (page title): `About ReviewThenGo — Built by Tom ...` to `About ReviewThenGo: Built by Tom ...`
  - line 124: `I'm Tom — a travel consultant ...` to `I'm Tom, a travel consultant ...`
- `src/components/Footer.tsx` line 24: `... safety, and more — all in one place.` to `... safety, and more, all in one place.`
- `src/pages/CompassArticle.tsx` line 397 is a code comment, not user-facing. Replace with a colon for consistency.

### 2. Fix the 3 JSX build errors (TS1382)
Each of these files has a leftover orphan attribute block sitting between the closed `<SEOHead ... />` tag and `<Header />`. Delete those 4 orphan lines in each:

- `src/pages/BestTime.tsx` lines 107-110 (the second `title=...`, `description=...`, `url=...`, `/>` block)
- `src/pages/Gear.tsx`: there is a duplicated/orphan `<SEOHead>` props block to remove (lines around 107-117). Keep one clean `<SEOHead ... />` with the jsonLd and the new title/description.
- `src/pages/Itinerary.tsx` lines 97-100 (same orphan block pattern)

### 3. Verification
- Run `bunx tsc --noEmit -p tsconfig.app.json` to confirm zero TypeScript errors.
- Re-grep `src/` for `—` and `–` in user-facing strings to confirm none remain in updated files.

## Out of scope
- The `vite-plugin-pwa` / `workbox-window` Rollup warning seen in a full production build is a pre-existing infra issue unrelated to recent edits and does not affect the Lovable preview/publish pipeline. Not touching it here.
- No content rewrites beyond the em-dash replacements above.

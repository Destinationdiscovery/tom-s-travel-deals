## Problem

The three capture components (`EmailCapturePopup`, `NewsletterCTASection`, `CompassInlineCTA`) all exist and post to the `subscribe` edge function correctly, but **none of them are imported or mounted in any page**. That's why nothing pops when you try to leave the site. The Footer also has no subscribe form, just a link to `/compass`.

## Wire the 5 placements

1. **Exit-intent popup** (`EmailCapturePopup`)
   Mount once globally in `src/App.tsx` so it's available on every route. Existing component already handles the 7-day dismissal cookie, exit-intent trigger (mouse leaves top of viewport), and 30-second fallback timer. Source slug: `compass-exit-popup`.

2. **Homepage subscribe section** (`NewsletterCTASection`)
   Mount in `src/pages/Index.tsx` between `BlogPreviewSection` and `AggregateStatsSection`. Source slug: `compass-homepage`.

3. **Compass blog index header CTA**
   Mount `NewsletterCTASection` on `src/pages/Compass.tsx` directly under the hero, before the category filter. Pass a custom source slug `compass-blog-index` by adding an optional prop.

4. **Mid-article inline CTA** (`CompassInlineCTA`)
   In `src/pages/CompassArticle.tsx`, inject `<CompassInlineCTA articleSlug={slug} />` after the 3rd rich-content block so it sits mid-scroll. Source slug: `compass-inline-<slug>`.

5. **Footer subscribe form**
   Replace the current "Blog" link area in the "Stay Connected" column of `src/components/Footer.tsx` with a slim inline form (email input + Subscribe button) that posts to the `subscribe` function with source slug `compass-footer`. Keep the existing social/RSS icons.

## Mobile note

Exit-intent (mouse leaving the top of viewport) does not fire on touch devices. The existing 30-second fallback timer already covers mobile, so placement #1 still works there.

## Verification

After wiring, use the browser tool to:
- Load homepage, wait 31s, confirm popup appears, submit a test email, confirm toast + row in `subscribers` table.
- Move mouse above the viewport on desktop, confirm popup fires.
- Scroll homepage to the new `NewsletterCTASection`, submit, confirm row.
- Open a Compass article, scroll to mid-article CTA, submit, confirm row.
- Submit footer form, confirm row.
- Clear `localStorage` key `rtg-email-popup-dismissed` between popup tests.

## Files touched

- `src/App.tsx` (mount popup)
- `src/pages/Index.tsx` (add NewsletterCTASection)
- `src/pages/Compass.tsx` (add NewsletterCTASection with custom slug)
- `src/pages/CompassArticle.tsx` (inject CompassInlineCTA mid-content)
- `src/components/NewsletterCTASection.tsx` (add optional `sourceSlug` + `interests` props)
- `src/components/Footer.tsx` (add subscribe form)

No DB or edge-function changes needed.

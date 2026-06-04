## 1. Move The Compass newsletter section higher on the homepage

In `src/pages/Index.tsx`, the `<NewsletterCTASection sourceSlug="compass-homepage" />` currently sits between `BlogPreviewSection` and `AggregateStatsSection`, well below the fold. Move it up so it appears right after `HowItWorks` (and before `TravelersAskSection`). That places it in the first 1.5 screens for both mobile and desktop, before users have to scroll through reviews/tools/blog.

## 2. Add end-of-article newsletter capture

`src/pages/CompassArticle.tsx` already has `CompassInlineCTA` injected mid-article (after the third rich-content block) but nothing at the end. Add a second `<CompassInlineCTA articleSlug={slug} />` right after the FAQ accordion and before `CompassArticleToolsCTA`, so every article ends with a capture. Use a distinct `source_slug` of `compass-article-end-{slug}` (pass via a new optional `placement` prop or by reusing the existing slug arg — the simplest is a tiny prop addition).

## 3. Add a "Preview the latest edition" button

There is one sent edition in `compass_editions` (#3, Scottish Highlands) with `full_html` populated. Add a preview affordance that opens a modal showing it.

- New component `src/components/CompassPreviewModal.tsx`: a shadcn `Dialog` with a max-w-3xl, max-h-[85vh] scrollable body that renders the edition inside a sandboxed `<iframe srcDoc={full_html}>` so MailerLite-styled HTML cannot leak styles into the app. Includes a "Subscribe to get the next one" button at the bottom that scrolls to the nearest capture form (or opens the popup).
- Fetch the latest `status='sent'` edition via a small inline Supabase query: `select id, edition_number, subject_line, destination, issue_date, full_html from compass_editions where status='sent' order by issue_date desc limit 1`. Cache in component state. Show a skeleton while loading; if nothing returns, hide the button.
- Wire a "Preview latest edition" link/button into:
  - `src/components/NewsletterCTASection.tsx` (under the subscribe form, small ghost button: "Preview the latest edition")
  - `src/pages/Compass.tsx` hero area, next to or below the description
  - `src/components/CompassInlineCTA.tsx` (small text link "See a sample")

## 4. Verify exit/scroll/timer popup triggers actually fire

After build, use the browser tool to load the preview, clear `localStorage['rtg-email-popup-dismissed']` and `rtg-email-popup-subscribed`, then exercise each trigger and screenshot:

- Desktop 1280x720: wait 30s on `/` → popup should appear (timer path).
- Desktop: reload, move mouse to top edge → popup should appear (mouse-leave path).
- Mobile 390x844: reload, scroll to ~65% of page → popup should appear (scroll path).
- After submit: confirm `rtg-email-popup-subscribed` is set and popup does not return on reload.
- After close (X): confirm `rtg-email-popup-dismissed` is set and popup is suppressed for 3 days.

Report results inline; fix any trigger that does not fire (likely candidates: scroll calc using wrong element, listeners removed on route change, or popup blocked by another modal).

## 5. RLS / data access check

The preview modal reads `compass_editions` from the browser. Confirm there is a SELECT policy allowing public/anon read of `status='sent'` rows. If not, add a migration with a `GRANT SELECT ... TO anon, authenticated` and a policy `USING (status = 'sent')`. (Will verify the existing policy before deciding whether a migration is needed.)

## Files touched

- `src/pages/Index.tsx` — reorder sections
- `src/pages/CompassArticle.tsx` — add end-of-article CTA
- `src/components/CompassInlineCTA.tsx` — optional `placement` prop for source tagging + small "See a sample" link
- `src/components/CompassPreviewModal.tsx` — NEW
- `src/components/NewsletterCTASection.tsx` — add preview button
- `src/pages/Compass.tsx` — add preview button in hero
- (optional) `supabase/migrations/...` — public read policy for sent editions, only if missing

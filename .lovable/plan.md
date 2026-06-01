## 1. Remove Guides and Deals tabs

In `src/components/Header.tsx`:
- Remove "Guides" and "Deals" entries from `navLinks`.
- Remove the `handleDealsClick` callback (no longer needed).
- Remove the mobile "Guides" link and mobile "Deals" link from the sheet nav.

Leaves desktop nav as: Home, Blog, Tools. Mobile nav loses Guides and Deals too. The `/guides` route in `App.tsx` stays intact (still reachable by direct URL); user only asked to remove the tabs.

## 2. Fix exit-intent popup not appearing

The `EmailCapturePopup` is mounted globally in `App.tsx`, but it self-suppresses when `localStorage["rtg-email-popup-dismissed"]` is set within the last 7 days. Since you previously closed it (or submitted on a prior test), the flag is set on your browser, so neither the 30-second timer nor the exit-intent listener arms.

Fix in `src/components/EmailCapturePopup.tsx`:
- Lower the dismissal window from 7 days to 3 days so it returns sooner on repeat visits.
- Distinguish "submitted" from "dismissed": after a successful subscribe, set a separate `rtg-email-popup-subscribed` flag (permanent) so subscribers never see it again, but a simple close only suppresses for 3 days.
- Add a touch-based mobile trigger: also show the popup after the user scrolls past 60% of the page, in addition to the existing 30s fallback and desktop mouse-leave trigger.
- Keep ESC/focus-trap behavior as-is.

For your immediate test, after this change ships, open DevTools to clear `localStorage` keys `rtg-email-popup-dismissed` and `rtg-email-popup-subscribed` once, then reload and either wait 30s, scroll 60% down, or fling the mouse to the top.

## Files touched

- `src/components/Header.tsx` (remove tabs)
- `src/components/EmailCapturePopup.tsx` (broader trigger conditions)

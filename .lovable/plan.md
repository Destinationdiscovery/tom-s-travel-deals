
## Goal

Layer a "Trip Plan" workspace on top of the existing ReviewThenGo site without touching the homepage visual design, tool pages' internals, blog, guides, or the `/gear-admin` Agent HQ dashboard. Also remove the "Get Weekly Exclusive Deals" exit-intent popup.

The full spec is in the uploaded `reviewthengo_lovable_prompt_v2.md`; this plan tracks it phase by phase.

---

## Phase 0 — Quick wins (this turn / first build)

1. **Remove the email popup.** Delete the `<EmailCapturePopup />` mount from wherever it renders (likely `src/pages/Index.tsx` and/or `App.tsx`). Leave `NewsletterCTASection` (the inline footer-area form) alone unless you also want it gone — confirm if so. Keep the `subscribe` edge function in place; the footer form still uses it.
2. **Nav update** in `src/components/Header.tsx`: replace the "Dashboard" link with a primary-styled **My Trips** button. Logged-in state shows active trip name (muted) + initial avatar + My Trips button. The compass icon admin entry stays exactly as it is.
3. **"Start Your Saves List" card** on homepage: keep the card, swap copy to "Start building your trip plan" + new body + primary button "Start my free trip plan" → `/my-trips`, with "Already have a plan? Sign in" link.
4. **Slim trip-plan banner** above `Footer` on homepage with teal-tinted background and "Create my trip plan" CTA.
5. **Rename** the 8-tools section heading to "Plan every part of your trip".

## Phase 1 — Anonymous session foundation

New module `src/lib/tripSession.ts`:
- `rtg_session_id` (uuid), `rtg_session_data` (JSON: savedHotels[], tripName, destination, toolOutputs), `rtg_session_expiry` (7 days).
- Helpers: `getSession()`, `addSavedHotel()`, `setTripName()`, `addToolOutput()`, `clearSession()`, `isReturning()`.
- On mount in `App.tsx`, rehydrate or expire.
- "Returning within 7 days" dismissible top banner component shown below the nav on all pages when `isReturning()` is true and no auth user.

## Phase 2 — Save Moment Trigger

- Extend `SaveReviewButton` (or wrap it) so the first save in a session for a logged-out user renders an inline `SaveMomentPrompt` card directly below the hotel card.
- Prompt has: trip name input, email input, "Continue with Google" (existing Google OAuth via Supabase), primary "Save my trip plan free" (magic link), secondary "Keep browsing".
- New edge function `send-trip-magic-link` (or reuse existing Supabase `signInWithOtp({ email, options: { shouldCreateUser: true }})`) — prefer Supabase built-in magic link so no extra service is needed. Subject customised via Lovable Auth email templates (separate optional follow-up; default email is fine for v1).
- On submit: success state replaces the card with checkmark + 4 contextual tool cards (Review more hotels, Build itinerary, Visa, Packing) pre-filled with detected destination.
- On mobile (<768px) render as a bottom sheet using existing `Drawer` component.

## Phase 3 — Data model (Lovable Cloud)

Migration adds:
- `trips` table with all fields from spec (trip_id, user_id FK auth.users, trip_name, destination, dates, trip_type enum, status enum, notes, share_token uuid, timestamps).
- `trip_hotels` (trip_id, hotel data JSONB, top_pick bool, order).
- `trip_itinerary_days` (trip_id, day_number, JSONB content).
- `trip_packing_items` (trip_id, label, checked, order).
- `trip_gear_items` (trip_id, product JSONB, purchased).
- `trip_logistics` (trip_id, visa/safety/best_time/currency JSONB + checked bools).
- RLS: owner-only via `auth.uid() = user_id`; public-read row for the `/trip/:token` share view via a `SECURITY DEFINER` function `get_shared_trip(token uuid)` that returns sanitized data (no notes).

## Phase 4 — `/my-trips` dashboard

Rebuild the current `MyTrips` page (currently 238 lines, likely placeholder) into:
- Header (greeting + New Trip button)
- 4 stat cards (Active trips / Hotels reviewed / Itineraries built / Trips completed)
- Trip cards grid with status pill dropdown, progress badges, Share/Export/Open actions
- Empty state per spec
- Auth gate → redirect to existing AuthModal

## Phase 5 — `/my-trips/:slug` workspace

New route + page `TripWorkspace.tsx` with the 6 sections from spec (Hotels / Itinerary / Logistics 2×2 / Packing / Gear / Notes). Inline-editable header. "Add to this trip" search button puts the homepage search into trip-context mode (passes `?trip=slug` so Add-to-Trip button auto-targets it).

## Phase 6 — Add-to-Trip button on tool pages

Single `<AddToTripButton output={...} kind="itinerary|gear|safety|..." />` component appended to result blocks in `Itinerary.tsx`, `Gear.tsx`, `BestTime.tsx`, `Safety.tsx`, `TravelIntel.tsx`, `Currency.tsx`, `Flights.tsx`, `Destinations.tsx`. No other changes to those pages.
- Logged-in + active trip: "Add to [trip]"
- Logged-in no active trip: dropdown to pick/create
- Logged-out: triggers Save Moment prompt.

## Phase 7 — Share + Export

- `/trip/:token` public read-only page (no notes section, with conversion banner).
- "Export PDF" button uses client-side `jspdf` + `html2canvas` (already common in project; will add as dep). PDF includes hotels, itinerary, packing, logistics, gear. Filename `[trip-slug]-plan.pdf`.

## Phase 8 — Mobile polish

- Workspace sections collapsible via existing `Accordion`.
- 44px tap targets on checkboxes.
- Sticky bottom action bar (Share / Export) on workspace mobile.
- Save Moment as bottom sheet (already in Phase 2).

---

## Technical Section

- **Auth:** Supabase magic link (`signInWithOtp`) + existing Google OAuth. After auth, `migrateAnonymousSession()` copies localStorage into `trips` row and clears `rtg_*` keys.
- **Routing additions** in `App.tsx`: `/my-trips/:slug` (workspace), `/trip/:token` (public share). `/my-trips` already exists.
- **Realtime:** none required for v1.
- **Admin dashboard:** `/gear-admin` and the compass-icon entry are explicitly out of scope — untouched.
- **Existing files left alone:** all homepage sections listed in spec's "stays the same", all tool pages' internals, all blog/guide pages, sitemap, edge functions for SEO/articles-feed.
- **New dependency:** `jspdf` (+ `html2canvas`) for PDF export. Confirm before install in Phase 7.

## Out of Scope

- No changes to articles-feed/crawler SEO work (already done).
- No redesign of homepage sections beyond the copy tweaks in Phase 0.
- No removal of admin dashboard or its routes/components.
- No new third-party email provider — magic link uses built-in Lovable Auth.

## Test Plan

- After each phase: load homepage logged-out, verify no popup, verify nav button, verify banner.
- Phase 2: save a hotel logged-out → prompt appears → submit email → confirmation state shows tool cards.
- Phase 3-5: create trip → reload → trip persists → workspace edits save.
- Phase 6: each tool page shows Add-to-Trip and writes to correct workspace section.
- Phase 7: open `/trip/:token` in private window → read-only view + banner. Export PDF on a populated trip.

---

## One clarifying question before I start building

Do you want me to ship **Phase 0 only first** (remove popup, nav button, copy tweaks, banner — about 30 min of work, immediately visible) and then proceed phase-by-phase with checkpoints, or batch Phase 0+1+2 together so the save-moment trigger works end-to-end before you review?

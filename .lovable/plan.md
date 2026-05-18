
## Execution sequence (approved plan from `.lovable/plan.md`)

Proceeding phase by phase. Each phase ends with a working, verifiable checkpoint before the next starts.

1. **Phase 0 — Homepage polish** (popup already removed)
   Nav "My Trips" button + logged-in state, "Start Your Saves List" card copy swap, slim trip-plan banner above footer, rename tools section to "Plan every part of your trip".

2. **Phase 1 — Anonymous session foundation**
   `src/lib/tripSession.ts` (localStorage + 7-day expiry), rehydrate on mount, dismissible "returning visitor" banner.

3. **Phase 2 — Save Moment trigger**
   Inline prompt on first hotel save for logged-out users. Magic link via Supabase `signInWithOtp` + Google OAuth. Success state with 4 contextual tool cards. Bottom-sheet on mobile.

4. **Phase 3 — Data model (Lovable Cloud migration)**
   `trips`, `trip_hotels`, `trip_itinerary_days`, `trip_packing_items`, `trip_gear_items`, `trip_logistics`. Owner-only RLS + `get_shared_trip(token)` SECURITY DEFINER for public share view.

5. **Phase 4 — `/my-trips` dashboard**
   Greeting, 4 stat cards, trip cards with status pill / progress badges / Share / Export / Open, empty state, auth gate.

6. **Phase 5 — `/my-trips/:slug` workspace**
   6 sections: Hotels, Itinerary, Logistics 2×2, Packing, Gear, Notes. Inline-editable header. "Add to this trip" context mode.

7. **Phase 6 — Add-to-Trip on tool pages**
   Single `AddToTripButton` wired into 8 tool result blocks. No other tool-page changes.

8. **Phase 7 — Share + Export**
   `/trip/:token` public read-only view + conversion banner. PDF export via `jspdf` (added then).

9. **Phase 8 — Mobile polish**
   Collapsible sections, 44px tap targets, sticky bottom action bar in workspace.

## Guardrails for the whole run

- `/gear-admin` (Agent HQ) and the compass-icon admin login: **do not touch**.
- Homepage sections listed in "stays the same" in the original spec: **do not redesign** (Phase 0 only changes copy/headings/one banner).
- All existing tool pages, blog, guides, sitemap, articles-feed SEO work: **untouched** except the single Add-to-Trip button in Phase 6.
- Magic link auth uses Lovable's built-in email (no third-party email service added).
- One clarification I'll need at Phase 3 only: confirming the migration before I run it (auto-prompted by the migration tool).

## Question

Two small confirmations before I start so I don't pause later:

1. **Profile data**: I'll lean on the existing `profiles` table (id, display_name, newsletter_opt_in already exists) and the existing `handle_new_user` trigger. No schema change to profiles. OK?
2. **Magic-link email subject**: Phase 2 will use Supabase's default magic-link email template for v1 (works immediately, no DNS/domain setup needed). We can customize the template later in a dedicated pass. OK?


# Shareable Trip Plans + Personal Hotel Reviews

Turn any trip into a polished, read-only "trip story" that anyone can view on the site. Owners choose when to publish, add a structured mini-review for each hotel they stayed at, and other users can browse published trips in a new gallery.

## Recommendation on your open question

**Yes, let all signed-in users publish their trips.** It gives you free, authentic, SEO-friendly content (real itineraries with real reviews), and it mirrors how Wanderlog / Polarsteps grew. Guardrails:

- Publishing requires being signed in (already true to create a trip).
- Owner must explicitly click **Publish** per trip. Default is private.
- Owner can **Unpublish** anytime, which invalidates the public URL and removes it from the gallery.
- New trips get a "Publish" checklist (needs title, destination, at least 1 stop) before the button unlocks, so the gallery stays high quality.
- Admin (you) can hide any trip from the gallery via a boolean flag, without deleting it.

## User experience

### For the trip owner
1. In `TripWorkspace`, a new **Share** panel shows:
   - Status pill: Draft / Published
   - "Publish trip" button (or "Unpublish")
   - Once published: copyable public URL + "List in public gallery" toggle
   - Per-hotel **"Add your review"** button that opens a structured form (rating, one-line verdict, pros, cons, notes, stayed-on dates)
2. Their own review shows inline next to the aggregated ReviewThenGo review on the shared view.

### For a visitor
1. Lands on `/trips/:slug` (pretty slug, not a token) and sees the full itinerary read-only: legs, transit, hotels, best-time, safety, packing list, etc.
2. Each hotel shows: the ReviewThenGo aggregated review summary + the owner's personal mini-review side-by-side, with a link to the full `/review/:slug` page.
3. Header shows author name, destination, dates, "X people saved this."
4. No email gate. A single soft CTA at the bottom: "Get trip ideas like this in your inbox" (existing Compass capture).
5. Browsable gallery at `/trips` with filters (destination, duration, trip type) and cards showing hero image, title, author, length, hotel count.

## Technical section

### Database (single migration)
- `trips` — add columns:
  - `is_published boolean NOT NULL DEFAULT false`
  - `published_at timestamptz`
  - `public_slug text UNIQUE` (generated from trip_name + short hash on first publish; keep existing `share_token` as a private preview link)
  - `list_in_gallery boolean NOT NULL DEFAULT true`
  - `hidden_by_admin boolean NOT NULL DEFAULT false`
  - `author_display_name text`, `cover_image_url text` (optional, editable at publish time)
  - `view_count int NOT NULL DEFAULT 0`
- New table `trip_hotel_reviews`:
  - `id`, `trip_hotel_id` (FK, unique — one review per hotel per trip), `user_id`, `overall_rating numeric(2,1)`, `verdict text`, `pros text[]`, `cons text[]`, `notes text`, `stayed_from date`, `stayed_to date`, timestamps
  - GRANT to authenticated + service_role
  - RLS: owner can CRUD their own; anon/auth can SELECT rows whose parent trip is published & not hidden
- Update `get_shared_trip` RPC (SECURITY DEFINER) to:
  - Accept either token OR public_slug
  - Only return rows when `is_published AND NOT hidden_by_admin`
  - Include `trip_hotel_reviews` joined per hotel
  - Include author display name (from `profiles`)
- New RPC `list_public_trips(_limit, _offset, _destination)` returning gallery card data (SECURITY DEFINER, filters `is_published AND list_in_gallery AND NOT hidden_by_admin`).
- Keep existing token-based sharing for pre-publish preview.

### Frontend
- New page `src/pages/PublicTrip.tsx` at route `/trips/:slug` — renders full itinerary read-only, uses updated `get_shared_trip`. Reuse blocks from existing `SharedTrip.tsx` and `TripWorkspace.tsx` (extract shared read-only components: `HotelBlock`, `TransitBlock`, `PackingBlock`, `LogisticsBlock`).
- New page `src/pages/PublicTripsGallery.tsx` at `/trips` — grid of cards, destination filter, pagination.
- New component `src/components/trips/HotelReviewForm.tsx` — structured form (rating slider, verdict input, pros/cons multi-tag, notes textarea, stay dates). Autosaves.
- New component `src/components/trips/HotelReviewCard.tsx` — displays the mini-review; used in both owner workspace and public trip page.
- New component `src/components/trips/PublishTripPanel.tsx` — publish/unpublish, slug preview, gallery toggle, cover image URL, author display name. Runs "publishability check" (title/destination/≥1 leg) before enabling Publish.
- `TripWorkspace.tsx` — mount `PublishTripPanel` at the top and an "Add your review" button on each hotel row.
- `Header.tsx` — add "Explore trips" link pointing to `/trips`.
- SEO: `PublicTrip.tsx` sets title/description/OG based on trip name + destination; add JSON-LD `TravelAction`/`ItemList`. Add published trips to `generate-sitemap` edge function.
- Admin: add "Trips" tab in the existing CRM/admin dashboard listing published trips with a "Hide from gallery" toggle (sets `hidden_by_admin`).

### Out of scope for this pass
- Email delivery of the full plan (deferred; visitor just visits the public URL).
- PDF export.
- Comments on trips (existing `comments` table can be wired later via `page_type = 'trip'`).

### Rollout order
1. Migration (schema + RPC updates + RLS + grants).
2. `HotelReviewForm` + `HotelReviewCard` + owner-side editing in `TripWorkspace`.
3. `PublishTripPanel` + publish/unpublish flow + slug generation.
4. `PublicTrip.tsx` page + route + SEO.
5. `PublicTripsGallery.tsx` + `/trips` route + Header link + sitemap.
6. Admin hide toggle.

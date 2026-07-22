## Goal

Replace the current "Explore real trips" grid and "Watch real trips" video row on the homepage with a single 4-card discovery hub. Each card links to its own dedicated public page. Admin can publish content into each section from the dashboard.

## Homepage: the 4-card row

Placement: directly under the hero, replacing both `PublicTripsGrid` and `SocialVideoRow` on `/`.

```text
+-----------------+-----------------+-----------------+-----------------+
|  Real Trips     |  Latest Video   |  Packing Lists  |  Travel Gear    |
|  (cover img)    |  (video thumb   |  (cover image)  |  (gear photo)   |
|  "Explore real  |  + play button, |  "Featured      |  "Gear I trust  |
|   itineraries"  |   opens inline) |   packing lists"|   on the road"  |
|                 |                 |                 |                 |
|  [View all trips]| [View all videos]|[See all lists] |[See all gear]  |
+-----------------+-----------------+-----------------+-----------------+
```

- Card 1 - **Real Trips**: cover = newest published trip image, links to `/trips` (existing gallery). Footer link: "View all trips".
- Card 2 - **Latest Video**: shows the admin-pinned featured social video. Clicking opens the existing `SocialVideoModal` inline. Footer link: "View all videos" -> new `/videos` page.
- Card 3 - **Featured Packing Lists**: cover = newest featured list. Clicking opens `/packing-lists`. Footer link: "See all packing lists".
- Card 4 - **Travel Gear**: cover = newest featured gear review. Clicking opens `/gear-reviews`. Footer link: "See all gear".

New component: `src/components/home/DiscoveryHub.tsx` fetches the 4 preview items in one effect.

## New public pages

- `/videos` -> `SocialVideosGallery.tsx` (grid of all active `social_videos`, opens modal on click, existing table).
- `/packing-lists` -> `FeaturedPackingListsPage.tsx` (grid of published lists).
- `/packing-lists/:slug` -> `PackingListDetail.tsx` (title, hero image, description, categorized items with affiliate buttons, "Copy to my trip" CTA).
- `/gear-reviews` -> `GearReviewsPage.tsx` (grid of gear cards with star rating).
- `/gear-reviews/:slug` -> `GearReviewDetail.tsx` (single-product review: hero image, star rating, "Used on" trips, pros/cons, notes, affiliate buy button, related trips).

All routes registered in `src/App.tsx`. Each page uses `SEOHead` with `Product` / `ItemList` JSON-LD for SEO.

## Database changes (migration)

Two new tables + one flag on `social_videos`.

**`featured_packing_lists`**
- id, slug (unique), title, description, cover_image_url
- source ('curated' | 'trip'), source_trip_id (nullable fk to trips)
- season, trip_types text[] (beach, city, hiking...)
- is_published bool, published_at, sort_order, view_count
- created_by (uuid), created_at, updated_at

**`featured_packing_list_items`**
- id, list_id fk, label, category, quantity, notes
- amazon_url, image_url, sort_order

**`featured_gear_reviews`** (single-product)
- id, slug (unique), product_name, brand
- hero_image_url, category (backpack, shoes, camera, tech...)
- rating (1-5 numeric), pros text[], cons text[], notes (markdown)
- used_on text (free text of trips/destinations), first_used_at date
- affiliate_url, price_range, is_published, published_at
- view_count, sort_order, created_at, updated_at

**`social_videos`**: add `is_featured boolean default false` (only one true at a time, enforced in admin UI).

GRANTS: `SELECT` to anon on the three public-facing tables filtered by `is_published`, full CRUD to authenticated admin via RLS using `has_role(auth.uid(),'admin')`. `service_role` full access.

## Admin dashboard additions

Under Agent HQ (`/gear-admin`) add two new managers:

1. **`FeaturedPackingListsManager.tsx`**
   - List view of all featured lists (curated + trip-sourced).
   - "Create new curated list" -> form: title, description, cover image (upload to `gear-images`), season, trip types, items table with Amazon URL lookup (reuse `amazon-affiliate-link` edge function).
   - "Publish from existing trip" -> select a trip -> pick which packing items to include -> copies them into `featured_packing_list_items` with `source='trip'`. This satisfies "both" from your answers.
   - Publish/unpublish toggle, delete, reorder.

2. **`FeaturedGearReviewsManager.tsx`**
   - CRUD for single-product reviews.
   - Fields: product name, brand, category, rating slider, hero image upload, pros/cons repeatable inputs, notes markdown, used-on text, affiliate URL (auto-tagged via existing Amazon affiliate helper), publish toggle.

3. **`SocialVideosManager.tsx`** - add a "Featured" radio button so only one video is marked `is_featured=true` at a time.

## Ideas & feedback (asked for)

Non-blocking suggestions that would make this more useful and SEO-friendly:

- **Cross-linking**: on `TripWorkspace`, offer "Add all items from a featured packing list" so curated lists drive real trip usage. On `GearReviewDetail`, list every published trip where the gear appears -> internal link graph boost.
- **Aggregate rating schema**: on `/gear-reviews`, emit `Product` + `Review` + `AggregateRating` JSON-LD per item. Rich results in Google Search.
- **ItemList JSON-LD** on `/videos`, `/packing-lists`, `/gear-reviews` index pages so Google can show carousel results.
- **Sitemap**: extend `generate-sitemap` edge function to include `/packing-lists/*` and `/gear-reviews/*` slugs from the new tables (mirrors the trips pattern already there).
- **OG image per detail page**: pull `cover_image_url` / `hero_image_url` into `SEOHead` `image` prop so social shares look good.
- **"Copy to my trip" on packing lists**: one-click imports the featured list items into the user's active trip. Drives both engagement and account signups.
- **Video card behavior**: keep the "View all videos" link even when only one video exists so the page is always discoverable to crawlers.

## Files

**New:**
- `src/components/home/DiscoveryHub.tsx`
- `src/pages/SocialVideosGallery.tsx`
- `src/pages/FeaturedPackingListsPage.tsx`
- `src/pages/PackingListDetail.tsx`
- `src/pages/GearReviewsPage.tsx`
- `src/pages/GearReviewDetail.tsx`
- `src/components/dashboard/FeaturedPackingListsManager.tsx`
- `src/components/dashboard/FeaturedGearReviewsManager.tsx`
- One migration: three new tables + grants + policies + `social_videos.is_featured` column

**Edited:**
- `src/pages/Index.tsx` - remove `PublicTripsGrid` + `SocialVideoRow`, mount `DiscoveryHub`
- `src/App.tsx` - four new routes
- `src/components/dashboard/SocialVideosManager.tsx` - featured toggle
- `src/components/dashboard/DashboardSidebar.tsx` - two new sidebar entries
- `supabase/functions/generate-sitemap/index.ts` - include new tables

## Out of scope

- No changes to existing trip publishing flow.
- No changes to newsletter, blog, or review pages.
- No new AI generation - packing lists and gear reviews are manually curated.

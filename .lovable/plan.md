

# Plan: Featured Reviews Manager + Homepage Redesign

## Overview
Add a "Featured Reviews" admin tab to manage the 4 review cards on the homepage. Remove "View All" link. Add the review search bar below the cards on the homepage. Cards get resort images, custom affiliate links, and optional sale badges.

## Database

### New table: `featured_reviews` (4 slots, same pattern as `featured_deals`)
```sql
CREATE TABLE public.featured_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_number integer NOT NULL CHECK (slot_number >= 1 AND slot_number <= 4),
  property_name text NOT NULL,
  location text,
  slug text NOT NULL,
  rating numeric DEFAULT 4.0,
  summary text,
  image_url text,
  affiliate_url text,           -- exact affiliate link (replaces generic)
  sale_label text,              -- e.g. "50% OFF" or "$500 OFF" (null = no badge)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slot_number)
);
ALTER TABLE public.featured_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage featured_reviews" ON public.featured_reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public read featured_reviews" ON public.featured_reviews FOR SELECT TO anon USING (true);
```

## File Changes

### 1. New: `src/components/dashboard/FeaturedReviewsManager.tsx`
- Mirrors `FeaturedDealsManager` pattern: 4 editable card slots
- Each card shows: image preview, property name, location, rating, summary, affiliate URL, sale label
- Inline edit form with image upload (to `blog-images` bucket)
- Includes a review search bar at the top so admin can search/preview new properties
- "Add to Slot" button to populate a slot from a searched review

### 2. Update: `src/components/dashboard/DashboardSidebar.tsx`
- Add `"reviews"` to `DashboardTab` type
- Add sidebar entry: `{ id: "reviews", label: "Featured Reviews", icon: MapPin }`

### 3. Update: `src/pages/GearAdmin.tsx`
- Import and render `FeaturedReviewsManager` for `activeTab === "reviews"`

### 4. Update: `src/components/RecentReviewsHomepage.tsx`
- Fetch from `featured_reviews` table instead of latest `cached_reviews`
- Fall back to `cached_reviews` if no featured reviews exist
- Remove "View All" link
- Add resort image at top of each card (from `image_url`)
- Show sale badge if `sale_label` is set
- Use `affiliate_url` from the record (exact link) instead of generic deep link
- Add the review search bar below the 4 cards

### 5. Update: `src/pages/Index.tsx`
- Remove the `SectionConnector` that links to "Browse Destinations" (line 101)

### 6. Remove: `src/pages/Destinations.tsx` route
- Remove the `/destinations` route from `App.tsx`
- Keep the file but it's no longer linked from homepage

## Card Design (homepage)
```text
┌──────────────────────────┐
│  [Resort Photo]          │
│  ┌─ 50% OFF ─┐ (if set) │
├──────────────────────────┤
│  Property Name           │
│  Location                │
│  ★★★★☆ 4.5              │
│  Summary text...         │
│  Read Review →           │
│  [Book on Expedia ↗]     │
└──────────────────────────┘
```

## Admin Card Design
```text
┌──────────────────────────┐
│  Slot 1                  │
│  [Resort Photo]          │
│  Property Name           │
│  Location | ★ 4.5        │
│  Affiliate URL           │
│  Sale: 50% OFF           │
│  [Edit] [Revert]         │
└──────────────────────────┘
```


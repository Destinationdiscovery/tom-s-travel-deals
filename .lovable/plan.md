

# Plan: Featured Gear Cards Manager + Collapsible Search Results

## Overview
Replace the old Gear Image upload tool in the dashboard with a new "Featured Gear" manager (modeled after Featured Deals). The 4 gear category cards on the homepage and /gear page will become admin-editable with title, description, affiliate link, price, and image. Clicking a card takes visitors to the affiliate link. Search results will have a "Back to Featured Gear" collapse button.

## Database

### New table: `featured_gear_cards` (4 slots)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| slot_number | integer | 1-4, unique |
| title | text | e.g. "Beach Essentials" |
| description | text | e.g. "Sunscreen, beach towels..." |
| price | text | e.g. "$29.99" or "$20 - $30" |
| affiliate_url | text | Amazon affiliate link |
| image_url | text | Uploaded image URL |
| created_at / updated_at | timestamptz | Standard |

RLS: Anyone can read, admin can manage.

## File Changes

### 1. `src/components/dashboard/GearImageManager.tsx` -- Full rewrite
Replace the old image-upload-only tool with a new **FeaturedGearManager** component modeled on FeaturedDealsManager:
- 4 card slots with hardcoded defaults (current categories data)
- Each card shows: image, title, description, price, affiliate link
- Edit mode: inline form with title, description, price, affiliate URL, image upload
- Save/Revert buttons (same pattern as FeaturedDealsManager)
- Uses `blog-images` storage bucket for uploads (same as deals)

### 2. `src/components/dashboard/DashboardSidebar.tsx`
- Rename the "Gear Images" sidebar label to "Featured Gear"

### 3. `src/components/GearPreviewSection.tsx` -- Major update
- Fetch featured gear cards from DB, merge with hardcoded defaults
- Cards now link to `affiliate_url` (open in new tab) instead of triggering a search
- Show price on each card
- When search results are visible, show a "Back to Featured Gear" button that clears results and shows the cards again
- Remove the old `handleCategoryClick` search-trigger behavior

### 4. `src/pages/Gear.tsx` -- Add featured gear cards + collapse
- Below the hero search, show the same 4 featured gear cards when no search results are active
- Add a "Back to Featured Gear" button when results are showing
- Cards link to affiliate URLs

## UX Flow

**Homepage Gear Section:**
1. User sees 4 featured gear cards with images, titles, descriptions, and prices
2. Clicking a card opens the affiliate link in a new tab
3. User can also type a search query and click "Find Gear"
4. When results appear, a "Back to Featured Gear" button appears at top of results
5. Clicking it clears results and shows the 4 cards again

**Admin Dashboard (Featured Gear tab):**
1. Shows 4 card slots in a 2x2 grid
2. Each has Edit/Revert buttons
3. Edit mode shows inline form: title, description, price, affiliate URL, image upload
4. Save persists to `featured_gear_cards` table

## Technical Details

- The `featured_gear_cards` table mirrors the pattern of `featured_deals` (slot-based overrides with hardcoded defaults as fallback)
- Image uploads go to the existing `blog-images` storage bucket
- The old `gear_product_images` table and `gear-images` bucket remain untouched (used by the AI gear review edge function)
- The sidebar tab ID stays as `"gear"` so no routing changes needed




# Plan: Banner Deals Manager

## Problem
The two promotional banners at the top of the Travel Deals section (Expedia vacation sale + Hotels.com spring sale) are hardcoded. The admin needs to swap images, update affiliate links, and add sale labels — just like the other managed sections.

## Approach

### 1. Database — Create `banner_deals` table
Create a table with 2 slots (1 = left banner, 2 = right banner), each storing:
- `slot_number` (1-2)
- `image_url` (uploaded to `blog-images` bucket)
- `affiliate_url`
- `sale_label` (e.g. "3 nights free!", "Save 40%")
- `alt_text` (for accessibility)

RLS: public read, admin manage.

### 2. Admin Component — `BannerDealsManager.tsx`
A simple 2-slot editor (similar pattern to FeaturedReviewsManager) with:
- Image upload (to `blog-images` bucket)
- Current image preview
- Affiliate URL input
- Sale label input (displayed as a badge overlay on the banner)
- Save / Reset to default buttons

### 3. Sidebar + GearAdmin — New "Banner Deals" tab
Add `"banner-deals"` to `DashboardTab` union and wire it up.

### 4. TravelDealsSection — Fetch from `banner_deals`
Query `banner_deals` on mount. If rows exist, use their `image_url`, `affiliate_url`, and `sale_label` instead of the hardcoded imports. Fall back to hardcoded defaults if no DB rows.

### Changes Summary

| File | Change |
|------|--------|
| Migration SQL | Create `banner_deals` table (2 slots) with RLS |
| `src/components/dashboard/BannerDealsManager.tsx` | New component: 2-slot inline editor with image upload, affiliate URL, sale label |
| `src/components/dashboard/DashboardSidebar.tsx` | Add `"banner-deals"` tab |
| `src/pages/GearAdmin.tsx` | Import + render `BannerDealsManager` |
| `src/components/TravelDealsSection.tsx` | Fetch `banner_deals`, merge with defaults, render sale label badge |


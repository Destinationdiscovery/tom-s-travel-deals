
# Redesign: Slim Hero Banner + Section-Based Homepage

## Overview

Transform the homepage from a search-centric layout into a portal-style page inspired by your reference images. The hero becomes a slim banner (just the logo/tagline, no search bar). Below it, each content type gets its own visually rich section with preview cards and a "View All" link that navigates to the dedicated subpage where the full search and results live.

## Changes

### 1. Hero Section -- Banner Only (no search)
**File: `src/components/HeroSection.tsx`**

Strip the hero down to a slim visual banner (~200px tall) with just:
- Background image (existing hero-beach.jpg)
- "REVIEW THEN GO" headline (sky/amber/emerald colors)
- Subtitle: "Honest Reviews by Travellers, for Travellers"
- No search bar, no category buttons, no scroll indicator

This matches your first reference screenshot exactly.

The search functionality moves to the individual section pages (Reviews, Gear, Intel) where it already exists.

### 2. New Homepage Section: "Destination Reviews"
**File: `src/components/RecentReviewsHomepage.tsx`** (modify existing)

- Keep the existing cached_reviews query and cards
- Add a search bar at the top of this section so users can search for destination reviews inline
- "View All" link goes to `/destinations`
- Each card keeps its "Book on Expedia" affiliate link
- When user searches, results appear in this section (reuse existing `AIReviewResult` flow)

### 3. New Homepage Section: "Travel Deals"
**File: `src/components/TravelDealsSection.tsx`** (keep as-is)

Already works well with discount badges, banners, and affiliate links. No changes needed.

### 4. New Homepage Section: "Travel Gear"
**File: new `src/components/GearPreviewSection.tsx`**

A new section showing 3-4 gear category cards (e.g., "Beach Essentials", "Winter Packing", "Tech & Gadgets", "Family Travel") using existing gear images from `src/assets/gear-*`. Each card:
- Image thumbnail from existing gear assets
- Category title
- Short description
- Links to `/gear?q=...` with a pre-populated search
- "View All Gear" link to `/gear`
- Includes a compact search bar so users can search gear inline

### 5. New Homepage Section: "Travel Intel"
**File: new `src/components/IntelPreviewSection.tsx`**

A new section showing 3 intel category cards:
- "Entry Requirements" -- icon + description, links to `/travel-intel?type=requirements`
- "Safety Advisories" -- icon + description, links to `/travel-intel?type=advisories`
- "Travel News" -- icon + description, links to `/travel-intel?type=news`
- Includes a compact search bar for inline intel queries
- "Explore Intel" link to `/travel-intel`

### 6. Update Homepage Layout
**File: `src/pages/Index.tsx`**

New section order (always visible, no conditional hiding):
1. Header
2. Hero banner (slim, no search)
3. Destination Reviews section (with inline search + recent cards)
4. Travel Deals section (existing)
5. Travel Gear section (new, with cards + inline search)
6. Travel Intel section (new, with cards + inline search)
7. Blog Preview section (existing)
8. Footer

The inline search results for reviews, gear, and intel will appear within their respective sections using the existing hooks and result components. The `handleSearch`, `handleInlineSearch`, and all result rendering logic stays but gets distributed into section components rather than living at the top-level Index page.

### 7. Simplify HeroSection Props
**File: `src/components/HeroSection.tsx`**

Remove all search-related props (`onSearch`, `isSearching`, `onInlineSearch`, `onSearchTypeChange`). The component becomes a pure visual banner with no interactivity.

## Technical Details

- All existing search hooks (`useGenerateReview`, `useTravelIntel`, `useGearIntel`) stay unchanged
- Search functionality moves INTO each section component instead of being centralized in Index.tsx
- The dedicated subpages (`/gear`, `/travel-intel`, `/destinations`) continue working exactly as before
- Affiliate links remain on all cards
- No new dependencies needed
- No database changes needed

## File Summary

| File | Action |
|------|--------|
| `src/components/HeroSection.tsx` | Simplify to slim banner, remove search |
| `src/pages/Index.tsx` | Remove centralized search logic, add new sections |
| `src/components/RecentReviewsHomepage.tsx` | Add inline search bar for destination reviews |
| `src/components/GearPreviewSection.tsx` | New: gear category cards with inline search |
| `src/components/IntelPreviewSection.tsx` | New: intel category cards with inline search |
| `src/components/TravelDealsSection.tsx` | No changes |
| `src/components/BlogPreviewSection.tsx` | No changes |

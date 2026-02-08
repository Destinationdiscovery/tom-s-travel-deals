

## Rename Navigation Links and Page Titles

### Overview

Rename three navigation items in the toolbar and update the matching page titles. Also fix "The Compass" / "Travel Blog" to navigate directly to the page instead of scrolling on the homepage.

### Changes Summary

| Current Name | New Name | Nav Link Behavior |
|---|---|---|
| Destinations | My Reviews | Links to `/destinations` (unchanged) |
| Gear Discovery | Gear Reviews | Links to `/gear` (unchanged) |
| The Compass | Travel Blog | **Changed from scroll-to-section to direct link to `/compass`** |

### Detailed Changes

#### 1. Header (`src/components/Header.tsx`)
- "Destinations" → "My Reviews" (desktop + mobile)
- "Gear Discovery" → "Gear Reviews" (desktop + mobile)
- "The Compass" → "Travel Blog" (desktop + mobile)
- Change the "Travel Blog" nav item from a `<button>` with `scrollToSection("compass")` to a `<Link to="/compass">` so it opens the page directly

#### 2. Destinations Page (`src/pages/Destinations.tsx`)
- Page title: "Destination Reviews" → "My Reviews"

#### 3. Gear Page (`src/pages/Gear.tsx`)
- Page title: "Travel Gear Discovery" → "Gear Reviews"

#### 4. Compass Page (`src/pages/Compass.tsx`)
- Page title: "The Compass" → "Travel Blog"

#### 5. Footer (`src/components/Footer.tsx`)
- "Destinations" → "My Reviews"
- "The Compass" link text → "Travel Blog" and update the `href` from `/#compass` to `/compass` (direct page link)

#### 6. Homepage Sections (cosmetic alignment)
- **CompassSection** (`src/components/CompassSection.tsx`): Section heading "The Compass" → "Travel Blog"
- **GearReviewsSection** (`src/components/GearReviewsSection.tsx`): Section heading "Travel Gear Discovery" → "Gear Reviews"

### What stays the same
- All routes/URLs remain unchanged (`/destinations`, `/gear`, `/compass`)
- The homepage compass section still has the `id="compass"` anchor (for any existing bookmarks)
- Article content and data files are untouched

### Files modified

| File | Changes |
|------|---------|
| `src/components/Header.tsx` | Rename 3 nav labels, convert Compass button to Link |
| `src/components/Footer.tsx` | Rename 2 link labels, update Compass href |
| `src/pages/Destinations.tsx` | Page title update |
| `src/pages/Gear.tsx` | Page title update |
| `src/pages/Compass.tsx` | Page title update |
| `src/components/CompassSection.tsx` | Section heading update |
| `src/components/GearReviewsSection.tsx` | Section heading update |


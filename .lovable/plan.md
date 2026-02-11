

# Remove Hero Nav Links and Geni.us Gear Data

## Changes

### 1. Remove hero navigation links from HeroSection
**File:** `src/components/HeroSection.tsx`
- Delete the `heroNavLinks` array (lines 8-15) and the entire bottom navigation block (lines 130-142) that renders them
- Remove the unused `Link` import from react-router-dom
- The scroll indicator at the bottom remains

### 2. Delete personal gear review data
**File:** `src/data/gearReviews.ts` -- **Delete entire file**
- Contains all Geni.us links and hand-written personal reviews
- Only imported by `GearReviewsSection.tsx` which itself is unused

### 3. Delete GearReviewsSection component
**File:** `src/components/GearReviewsSection.tsx` -- **Delete entire file**
- The carousel component that displays personal gear reviews
- Not imported anywhere in the app currently

### What stays unchanged
- The `/gear` page with AI-powered gear search remains fully functional
- The "Travel Gear Reviews" link in the Header toolbar stays
- All other navigation continues to work from the top toolbar
- Affiliate links generated dynamically by the AI gear search (using your Amazon Associate tags) are unaffected



# Transform Destinations Page into "Real Destination Reviews"

## What Changes

Replace the current `/destinations` page (which shows "My Reviews" with 5 personal entries) with a "Real Destination Reviews" page featuring 6-9 popular destination review cards with hero images, star ratings, tags, and an inline search bar to generate new AI reviews.

## How It Works

- Page title changes from "My Reviews" to "Real Destination Reviews"
- Hero section updated with new heading and subtitle
- Search bar added below the hero (same as homepage -- search a hotel/resort/destination to generate an AI review)
- 9 curated destination cards displayed in a 3-column grid, each with:
  - Hero image (using existing assets in the project)
  - Destination name, location, rating, teaser, tags
  - "Read Review" link pointing to `/review/{slug}` (AI-generated review pages)
- Cards link to the AI review route so clicking triggers a review generation or loads cached version

## Destinations to Feature (9 total)

1. Barcelo Maya Riviera -- Riviera Maya, Mexico (existing)
2. Vila Gale Paredon -- Cayo Coco, Cuba (existing)
3. Villa in Blue Bay Resort -- Curacao (existing)
4. Bellagio -- Las Vegas, USA (existing)
5. Cruising Experience -- Caribbean & Alaska (existing)
6. Banff & Lake Louise -- Alberta, Canada (new, using canada-boom-banff-street.jpg)
7. Santorini -- Greece (new, using deal-santorini.jpg)
8. Maldives Beach Resort -- Maldives (new, using deal-maldives.jpg)
9. Phuket -- Thailand (new, using deal-phuket-clean.jpg)

## Technical Details

### File: `src/pages/Destinations.tsx`

- Update page title to "Real Destination Reviews"
- Change hero heading from "My Reviews" to "Real Destination Reviews"
- Update hero subtitle to match branding
- Import additional images for the 4 new destinations
- Expand the `destinations` array from 5 to 9 entries
- Add a search bar section between the hero and the grid (reusing the same pattern from `RecentReviewsHomepage` -- input + Search button)
- Import `useGenerateReview` hook and `AIReviewResult` component for inline search results
- Import `useNavigate` from react-router-dom for review navigation
- When a search is submitted, show the AI review result inline (same as homepage behavior)
- When no search is active, show the 9-card grid
- Change card links from `/destinations/{slug}` to `/review/{slug}` so they load AI-generated reviews
- Change "Read My Review" text to "Read Review"

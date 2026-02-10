

## Phase 1: Subtitle, Name Updates, Affiliate Links & Dynamic SEO Titles

### Changes Overview

#### 1. Subtitle Update
Change "Honest Reviews & Travel Insights" to "Real Traveller Reviews and Insights" in:
- `src/components/Header.tsx` (line 28)
- `src/components/Footer.tsx` (line 17)

#### 2. Remove Last Name ("Laracy") -- Keep "Tom"
All instances of "Tom Laracy" become just "Tom". Locations:

| File | What Changes |
|------|-------------|
| `src/data/compassArticles.ts` | All 9 blog articles: `author: "Tom Laracy"` becomes `author: "Tom"` |
| `index.html` | `<meta name="author" content="Tom Laracy">` becomes `content="Tom"` |
| `index.html` | Keep `@TomLaracyTravel` Twitter handle as-is (it's an account name, not a display name) |
| `src/pages/Contact.tsx` | The email `tlaracy@travelonly.com` stays as-is (it's a real email address, not a display name). The mailto subject line "Inquiry from Tom Travel Treasures" gets updated to "Inquiry from ReviewThenGo" |

Pages that already say just "Tom" (About, AboutSection, DestinationReview "Tom's Tips", GearReview "Tom's Tips", Contact "Why Book With Tom?") stay unchanged.

#### 3. Add Affiliate Links to Destination Review Sidebar
Add the existing `AffiliateLinks` component to `src/pages/DestinationReview.tsx` sidebar, matching the same pattern already used in `AIReview.tsx`. This is the biggest monetization gap on the site -- readers finish a destination review with no way to book.

#### 4. Dynamic Page Titles (SEO)
Add `useEffect` hooks to set `document.title` on each page so Google indexes unique titles instead of the generic one from `index.html`:

| Page | Title Format |
|------|-------------|
| `DestinationReview.tsx` | `"{review.title} - ReviewThenGo"` |
| `GearReview.tsx` | `"{gear.name} Review - ReviewThenGo"` |
| `CompassArticle.tsx` | `"{article.title} - ReviewThenGo"` |
| `AIReview.tsx` | `"{review.property_name}, {review.location} - ReviewThenGo"` |
| `Destinations.tsx` | `"Destination Reviews - ReviewThenGo"` |
| `Gear.tsx` | `"Gear Reviews - ReviewThenGo"` |
| `Compass.tsx` | `"Travel Blog - ReviewThenGo"` |
| `TravelIntel.tsx` | `"Travel Intel - ReviewThenGo"` |
| `About.tsx` | `"About - ReviewThenGo"` |
| `Contact.tsx` | `"Contact - ReviewThenGo"` |

Each also resets the title on unmount so navigating back to home restores the default.

#### 5. Footer Navigation Update
Add "Gear Reviews" and "Travel Intel" links to the footer's Explore section, matching existing link styles.

---

### Technical Details

**Files modified:**

| File | Changes |
|------|---------|
| `src/components/Header.tsx` | Subtitle text (line 28) |
| `src/components/Footer.tsx` | Subtitle text (line 17), add 2 nav links (after line 45) |
| `src/data/compassArticles.ts` | Replace all 9 `"Tom Laracy"` with `"Tom"` |
| `index.html` | Update meta author tag (line 26), update mailto subject |
| `src/pages/Contact.tsx` | Update mailto subject line (line 44) |
| `src/pages/DestinationReview.tsx` | Import and add `AffiliateLinks` component to sidebar, add `useEffect` for page title |
| `src/pages/GearReview.tsx` | Add `useEffect` for page title |
| `src/pages/CompassArticle.tsx` | Add `useEffect` for page title |
| `src/pages/AIReview.tsx` | Add `useEffect` for page title |
| `src/pages/Destinations.tsx` | Add `useEffect` for page title |
| `src/pages/Gear.tsx` | Add `useEffect` for page title |
| `src/pages/Compass.tsx` | Add `useEffect` for page title |
| `src/pages/TravelIntel.tsx` | Add `useEffect` for page title |
| `src/pages/About.tsx` | Add `useEffect` for page title |
| `src/pages/Contact.tsx` | Add `useEffect` for page title |

**No new dependencies, no database changes.**

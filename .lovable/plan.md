

## Phase 2: Footer Centering, JSON-LD Structured Data, Sitemap & Robots.txt

### Part 1: Center the Footer Content

The screenshot shows the footer content (brand, links, bottom bar) is left-aligned and looks unbalanced. Changes:

- Center the entire footer grid layout so the brand section and Explore links are centered on all screen sizes
- Center the brand logo/text, description, and Travelonly link
- Center the Explore nav links
- The bottom bar (Made with heart / copyright) is already centered on mobile but will be centered on desktop too

**File:** `src/components/Footer.tsx`

---

### Part 2: JSON-LD Structured Data (Rich Snippets)

Add `<script type="application/ld+json">` blocks via `useEffect` to enable Google rich snippets (star ratings, review info in search results).

| Page | Schema Type | Key Fields |
|------|------------|------------|
| `DestinationReview.tsx` | `@type: Review` + `@type: Hotel` | name, rating, author "Tom", datePublished, description, image |
| `GearReview.tsx` | `@type: Product` + `@type: Review` | name, brand, rating, author "Tom", price range, description |
| `CompassArticle.tsx` | `@type: BlogPosting` | headline, author "Tom", datePublished, image, description |

Each schema block is injected on mount and removed on unmount to keep things clean.

**Files:** `src/pages/DestinationReview.tsx`, `src/pages/GearReview.tsx`, `src/pages/CompassArticle.tsx`

---

### Part 3: Sitemap.xml

Create `public/sitemap.xml` listing all known static and content routes:

**Static routes:**
- `/` , `/destinations`, `/gear`, `/compass`, `/travel-intel`, `/about`, `/compare`

**Destination reviews (5):**
- `/destinations/mexico-barcelo-riviera`
- `/destinations/cuba-vila-gale`
- `/destinations/curacao-blue-bay`
- `/destinations/vegas-bellagio`
- `/destinations/cruise-experience`

**Gear reviews (7):**
- `/gear/travel-converter-cuba-europe`
- `/gear/packing-cubes`
- `/gear/airplane-phone-holder-mount`
- `/gear/inflatable-water-hammock`
- `/gear/thermacell-patio-shield-mosquito-repellent`
- `/gear/cruise-cabin-shoe-organizer`
- `/gear/liquid-iv-sugar-free-electrolyte`

**Blog articles (9):**
- `/compass/2026-travel-trends-whycations-glowcations-microvacations`
- `/compass/japan-top-destination-canadians-2026`
- `/compass/domestic-canada-boom-banff-lake-louise-2026`
- `/compass/travel-insurance-what-you-need`
- `/compass/why-canadians-skipping-us-2026`
- `/compass/canadian-at-par-deal-las-vegas`
- `/compass/group-travel-2026-who-uses-it-why-booming`
- `/compass/westjet-seat-squeeze-passengers-said-no`
- `/compass/rome-trevi-fountain-fee-genius-or-ripoff`

All URLs will use `https://reviewthengo.lovable.app` as the base (update to custom domain if/when mapped).

**File:** `public/sitemap.xml` (new)

---

### Part 4: Robots.txt Update

The `robots.txt` already references the sitemap -- no changes needed here.

---

### Technical Details

| File | Change Type | What Changes |
|------|------------|-------------|
| `src/components/Footer.tsx` | Edit | Center the grid layout, text-align brand section and nav links center |
| `src/pages/DestinationReview.tsx` | Edit | Add JSON-LD `Review` + `Hotel` schema via useEffect |
| `src/pages/GearReview.tsx` | Edit | Add JSON-LD `Product` + `Review` schema via useEffect |
| `src/pages/CompassArticle.tsx` | Edit | Add JSON-LD `BlogPosting` schema via useEffect |
| `public/sitemap.xml` | New file | Full sitemap with all 28 URLs |

**No new dependencies. No database changes.**


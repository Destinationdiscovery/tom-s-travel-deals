

## Update Branding for New Domain: reviewthengo.com

Your domain setup with GoDaddy sounds good. On the code side, there are several references to the old "TripReviews.ca" branding that should be updated to match your new domain. Here's everything that needs to change:

### 1. Page Title and SEO Meta Tags (`index.html`)

- **Page title** (line 23): Change `TripReviews.ca | Honest Reviews...` to `ReviewThenGo.com | Honest Reviews, Tested Gear & Travel Insights`
- **OG title** (line 27): Same change for social sharing previews
- **OG image** (line 30): Currently points to a generic Lovable placeholder image (`lovable.dev/opengraph-image-p98pqg.png`) -- ideally this should be updated to a custom image for your brand, but can be addressed later
- **Twitter image** (line 34): Same placeholder image issue

### 2. Header Branding (`src/components/Header.tsx`)

- Line 27: Change `TripReviews` to `ReviewThenGo`

### 3. Footer Branding (`src/components/Footer.tsx`)

- Line 16: Change `TripReviews` to `ReviewThenGo`
- Line 84: Change `TripReviews` to `ReviewThenGo` in the copyright line

### 4. About Section (`src/components/AboutSection.tsx`)

- Line 45: Change `TripReviews focuses on...` to `ReviewThenGo focuses on...`

### 5. About Page (`src/pages/About.tsx`)

- Line 50: Same text as above -- change `TripReviews` to `ReviewThenGo`

### 6. robots.txt (`public/robots.txt`)

- Add a `Sitemap` directive pointing to your new domain: `Sitemap: https://reviewthengo.com/sitemap.xml` (good SEO practice, even if sitemap generation comes later)

### What you don't need to do

- **DNS/domain setup**: You've already handled this in Settings and GoDaddy -- that's the main infrastructure piece
- **SSL**: Lovable provisions this automatically once DNS propagates
- **Redirects**: The `_redirects` file is fine as-is (it just handles SPA routing)

### Summary of changes

| File | What changes |
|---|---|
| `index.html` | Title, OG title, and image URLs |
| `src/components/Header.tsx` | Brand name in header |
| `src/components/Footer.tsx` | Brand name and copyright |
| `src/components/AboutSection.tsx` | Brand name in description |
| `src/pages/About.tsx` | Brand name in description |
| `public/robots.txt` | Add sitemap directive |

All straightforward text replacements -- no structural or layout changes.

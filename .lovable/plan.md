

## Rebrand Header, Footer, and About Page

### Overview

Replace "Tom Laracy" with "TripReviews" in the site-wide header and footer, and rewrite the About page with the new copy you provided. The compass article author names will stay as "Tom Laracy" since those are editorial bylines, not branding.

### Changes

#### 1. Header (`src/components/Header.tsx`)
- Change the logo text from "Tom Laracy" to "TripReviews"
- Change the subtitle from "Travel Consultant Est. 2011" to "Honest Reviews & Travel Insights"
- Change nav link text from "About Tom" to "About" (both desktop and mobile menus)

#### 2. Footer (`src/components/Footer.tsx`)
- Change the brand name from "Tom Laracy" to "TripReviews"
- Change the subtitle from "Travel Consultant Est. 2011" to "Honest Reviews & Travel Insights"
- Change the copyright text from "Tom Laracy Travel. Travelonly Certified Agent." to "TripReviews. All rights reserved."
- Change the nav link from "About Tom" to "About"
- Update the description paragraph to align with the new positioning

#### 3. About Page (`src/pages/About.tsx`)
- Replace the heading from "Hi, I'm Tom Laracy" to "Hi, I'm Tom"
- Replace the two body paragraphs with the new copy:
  - "This site exists to help travelers make better decisions before they book."
  - "TripReviews focuses on honest insights, common experiences, and real-world feedback about destinations, resorts, and travel experiences. It's not about selling. It's about clarity."
  - "Read the reviews, understand what to expect, and go with confidence."
- Remove the "Meet Your Travel Consultant" badge (no longer fits the tone)
- Keep the features section and travel philosophy card as-is (they still work with the new tone)

#### 4. About Section (homepage) (`src/components/AboutSection.tsx`)
- Same changes as the About page: update heading to "Hi, I'm Tom" and replace the paragraph text with the new copy
- Update badge from "Meet Your Travel Guide" to something simpler or remove it

### What stays the same
- Compass article author bylines remain "Tom Laracy" (editorial credit)
- The Travelonly profile link in the footer stays (it's a useful external link)
- Features list (20+ Countries, Passionate Advocate, Real Experiences) and Travel Philosophy card remain unchanged

### Files modified

| File | Change |
|------|--------|
| `src/components/Header.tsx` | "Tom Laracy" -> "TripReviews", subtitle update, "About Tom" -> "About" |
| `src/components/Footer.tsx` | "Tom Laracy" -> "TripReviews", subtitle, copyright, nav link, description |
| `src/pages/About.tsx` | New heading and body copy |
| `src/components/AboutSection.tsx` | Same heading and body copy updates |




# Plan: Change "Honest" to "Real" + Reorganize Footer Layout

## 1. Text Changes: "Honest" → "Real"

All instances across the site:

| File | Line | Current | New |
|------|------|---------|-----|
| `index.html` | 17 | "Honest Reviews, Tested Gear..." | "Real Reviews, Tested Gear..." |
| `index.html` | 18 | "Honest destination reviews..." | "Real destination reviews..." |
| `index.html` | 26 | "Honest Reviews, Tested Gear..." | "Real Reviews, Tested Gear..." |
| `index.html` | 27 | "Honest destination reviews..." | "Real destination reviews..." |
| `src/components/HeroSection.tsx` | 66 | "Honest Travel Reviews, Deals..." | "Real Travel Reviews, Deals..." |
| `src/components/TrustBadges.tsx` | 4 | "100% Honest Reviews" | "100% Real Reviews" |
| `src/components/Footer.tsx` | 49 | "Honest destination reviews..." | "Real destination reviews..." |
| `src/pages/Index.tsx` | 57 | SEO title "Honest Travel Reviews..." | "Real Travel Reviews..." |
| `src/pages/Contact.tsx` | 29 | "Looking for Honest Reviews..." | "Looking for Real Reviews..." |
| `src/pages/Contact.tsx` | 118 | "Honest reviews with no hidden agendas" | "Real reviews with no hidden agendas" |
| `src/pages/AffiliateDisclosure.tsx` | 18 | "providing honest, in-depth reviews" | "providing real, in-depth reviews" |
| `src/pages/AffiliateDisclosure.tsx` | 33 | "Our Commitment to Honesty" | "Our Commitment to Transparency" |
| `src/pages/BookingReport.tsx` | 464 | "Honest Reviews, Tested Gear..." | "Real Reviews, Tested Gear..." |
| `src/pages/DestinationReview.tsx` | 405 | "Honest Reviews, Tested Gear..." | "Real Reviews, Tested Gear..." |
| `src/pages/AIReview.tsx` | 60 | "Honest Reviews, Tested Gear..." | "Real Reviews, Tested Gear..." |

## 2. Footer Layout Reorganization

The current 3-column layout has too much vertical sprawl in the left column (brand + description + Travelonly link + email form + helper text). The Legal column looks sparse with just 2 links, social icons, and the Expedia badge floating underneath.

**New layout -- 4 columns on desktop:**

```text
┌──────────────┬────────────┬──────────────┬──────────────────┐
│ Brand Logo   │  Explore   │  Legal       │  Stay Connected  │
│ Tagline      │  Home      │  Privacy     │  Email form      │
│ Travelonly   │  Dest...   │  Affiliate   │  "No spam" note  │
│              │  Gear      │              │  Social icons    │
│              │  Intel     │              │  Expedia badge   │
│              │  Blog      │              │                  │
│              │  About     │              │                  │
│              │  Contact   │              │                  │
└──────────────┴────────────┴──────────────┴──────────────────┘
```

- Column 1 (Brand): Logo, tagline, Travelonly link -- clean and compact
- Column 2 (Explore): Navigation links (unchanged)
- Column 3 (Legal): Privacy + Affiliate links only
- Column 4 (Stay Connected): Email capture form, social icons, Expedia badge -- groups all engagement/interaction elements together

Grid changes from `md:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-4` for better spacing. On mobile it stays single-column.

### File: `src/components/Footer.tsx`
- Move email form + social icons + Expedia badge into a new 4th column titled "Stay Connected"
- Keep Brand column lean (logo + tagline + Travelonly link only)
- Keep Legal column with just the two links
- Update tagline text from "Honest" to "Real"


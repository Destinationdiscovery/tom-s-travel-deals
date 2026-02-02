

## Replace Hero Image and Update Tagline

### Overview
Replace the current hero image with the uploaded TripReviews.ca branded image, update the hero tagline to match the image ("Honest Reviews, Tested Gear & Travel Insights"), and remove any "deals" references from the site's meta tags and descriptions.

---

### Changes Summary

| Component | Current | Updated |
|-----------|---------|---------|
| Hero Image | `mexico-gallery-22.jpg` (beach scene) | `hero-beach.jpg` (TripReviews.ca branded image) |
| Hero Headline | "Let's Discover the World Together" | Keep as-is (branding element) |
| Hero Tagline | "With over a decade of experience as a travel consultant, I share real experiences, honest reviews, and destination insights to help you plan your perfect trip." | "Honest Reviews, Tested Gear & Travel Insights" |
| Page Title | "Tom Laracy Travel \| Travelonly Agent - Exclusive Vacation Deals" | "TripReviews.ca \| Honest Reviews, Tested Gear & Travel Insights" |
| Meta Description | References "Exclusive last-minute deals, group getaways..." | "Honest destination reviews, tested travel gear, and expert insights from an Ontario travel consultant. Plan your perfect trip with real experiences and advice." |
| OG Description | "Exclusive vacation deals, last-minute getaways..." | "Honest destination reviews, tested travel gear, and expert insights to help you plan your perfect trip." |

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/assets/hero-beach.jpg` | Copy uploaded image to replace/rename as new hero |
| `src/components/HeroSection.tsx` | Update image import and tagline text |
| `index.html` | Update page title, meta description, and OG description to remove "deals" references |

---

### Detailed Changes

**1. Asset Copy**
- Copy `user-uploads://image.jpg` to `src/assets/hero-tripreviews.jpg`

**2. HeroSection.tsx Updates**

Update the import and tagline:

```text
// Import change
import heroImage from "@/assets/hero-tripreviews.jpg";

// Tagline change (currently lines 23-25)
From: "With over a decade of experience as a travel consultant, I share real experiences, honest reviews, and destination insights to help you plan your perfect trip."

To: "Honest Reviews, Tested Gear & Travel Insights"
```

The dark overlay will need adjustment since this new image has a light/soft background with palm tree silhouettes. The overlay can be softened or removed to let the branded aesthetic show through.

**3. index.html Meta Tag Updates**

```text
Line 23 (title):
From: "Tom Laracy Travel | Travelonly Agent - Exclusive Vacation Deals"
To:   "TripReviews.ca | Honest Reviews, Tested Gear & Travel Insights"

Line 24 (description):
From: "Book your dream vacation with Tom Laracy, your dedicated Travelonly agent. Exclusive last-minute deals, group getaways, and personalized travel planning."
To:   "Honest destination reviews, tested travel gear, and expert insights from an Ontario travel consultant. Plan your perfect trip with real experiences and advice."

Line 28 (og:description):
From: "Exclusive vacation deals, last-minute getaways, and group travel packages. Let me plan your perfect escape."
To:   "Honest destination reviews, tested travel gear, and expert insights to help you plan your perfect trip."
```

---

### Hero Overlay Adjustment

The current overlay (`bg-gradient-to-b from-black/60 via-black/45 to-black/70`) was designed for a darker beach photo. Since the new branded image has a soft, light aesthetic with palm trees, the overlay will be adjusted to be much lighter or translucent to preserve the branded look while keeping the text readable.

Suggested new overlay:
```text
bg-gradient-to-b from-black/20 via-transparent to-black/30
```

---

### Note on Future Theming

The uploaded image features:
- **Primary color**: Teal/turquoise palm tree icon (#2EB8A6 approximately)
- **Text color**: Dark/black for strong contrast
- **Background**: Soft, light beach with palm silhouettes

For now, we'll just implement the hero image and text changes as requested. A full color theme refresh to match this aesthetic (adjusting the teal accent colors throughout) can be done as a follow-up.

---

### Result
Visitors will see the new TripReviews.ca branded hero image with the clean tagline "Honest Reviews, Tested Gear & Travel Insights." The page title and social media previews will no longer reference "deals" and will focus on the honest reviews/travel insights positioning.




## Fix Hero Image - Show Full Palm Tree

### The Problem
The palm tree in the hero image is being cut off because:
1. The header is fixed at the top (`fixed top-0`) with a height of approximately 72px
2. The hero section starts at the very top of the page (under the header)
3. The background image is positioned at `bg-center`, which centers the image vertically - cutting off the top portion where the palm tree logo sits

### The Solution
Adjust the hero section to:
1. Add top padding equal to the header height so the content area starts below the header
2. Change the background position from `bg-center` to `bg-top` so the top of the image (with the palm tree) is always visible
3. Increase the minimum height to accommodate the full image display

---

### Technical Changes

**File: `src/components/HeroSection.tsx`**

| Property | Current | Updated |
|----------|---------|---------|
| Section classes | `min-h-[60vh]` | `min-h-[70vh] pt-20` (add header spacing + more height) |
| Background position | `bg-center` | `bg-top` (show top of image where palm tree is) |

Updated code:
```tsx
<section className="relative min-h-[70vh] pt-20 flex items-center justify-center overflow-hidden">
  {/* Background Image */}
  <div 
    className="absolute inset-0 bg-cover bg-top bg-no-repeat"
    style={{ backgroundImage: `url(${heroImage})` }}
  />
```

Key changes:
- `pt-20` (80px padding-top) - accounts for the fixed header height so the hero content area starts below the navigation
- `bg-top` instead of `bg-center` - ensures the top of the image (palm tree and logo) is always visible
- `min-h-[70vh]` - slightly more height to give the branded image more room to breathe

---

### Result
The full TripReviews.ca branded image will be visible, with the palm tree logo and tagline properly displayed below the navigation header.


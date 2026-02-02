

## Fix Hero Image - Show Full Branded Image

### The Problem
The tagline "Honest Reviews, Tested Gear & Travel Insights" at the bottom of the hero image is being cut off because:
1. `bg-cover` scales the image to cover the entire container, which crops parts of the image
2. `bg-top` prioritizes the top of the image, causing the bottom to be cropped

### The Solution
Change the background sizing from `bg-cover` to `bg-contain` so the entire branded image fits within the hero section without any cropping. This ensures both the palm tree logo at the top AND the tagline at the bottom are fully visible.

---

### Technical Changes

**File: `src/components/HeroSection.tsx`**

| Property | Current | Updated |
|----------|---------|---------|
| Background size | `bg-cover` | `bg-contain` (fit entire image without cropping) |
| Background position | `bg-top` | `bg-center` (center the contained image) |
| Background color | None | `bg-[#e8f4f8]` (light blue/teal to match image edges) |

Updated code:
```tsx
<section className="relative min-h-[70vh] pt-20 flex items-center justify-center overflow-hidden bg-[#e8f4f8]">
  {/* Background Image */}
  <div 
    className="absolute inset-0 bg-contain bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${heroImage})` }}
  />
```

Key changes:
- `bg-contain` instead of `bg-cover` - ensures the entire image is visible without cropping
- `bg-center` - centers the image within the container
- `bg-[#e8f4f8]` on the section - adds a light blue/teal background color that matches the soft tones in the hero image, so any empty space around the contained image blends seamlessly

---

### Result
The full TripReviews.ca branded image will be visible, with both the palm tree logo at the top AND the tagline "Honest Reviews, Tested Gear & Travel Insights" at the bottom properly displayed.


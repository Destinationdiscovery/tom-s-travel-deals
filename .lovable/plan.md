

## Fix Hero Image - Full Width Coverage Without Cropping

### The Problem
The current CSS background approach forces a trade-off:
- `bg-cover` → fills the screen but crops the logo/tagline
- `bg-contain` → shows everything but leaves gaps on the sides

### The Solution
Switch from a CSS background image to an actual `<img>` element. This gives us full control:
- The image stretches to **100% width** of the viewport
- The height **automatically adjusts** based on the image's aspect ratio
- **Nothing gets cropped** - the entire branded image is always visible
- Works perfectly on both desktop and mobile

---

### Technical Changes

**File: `src/components/HeroSection.tsx`**

Replace the background `div` with an `<img>` element:

```tsx
import heroImage from "@/assets/hero-tripreviews.jpg";

const HeroSection = () => {
  return (
    <section className="relative pt-20 bg-[#e8f4f8]">
      {/* Hero Image - Full Width */}
      <img 
        src={heroImage}
        alt="TripReviews.ca - Honest Reviews, Tested Gear & Travel Insights"
        className="w-full h-auto"
      />

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-gray-400/50 flex justify-center">
          <div className="w-1 h-3 bg-gray-400/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
```

### Key Changes

| What | Before | After |
|------|--------|-------|
| Image method | CSS `background-image` | `<img>` element |
| Width | Constrained by container | `w-full` (100% viewport width) |
| Height | Fixed `min-h-[70vh]` | `h-auto` (respects aspect ratio) |
| Cropping | Yes (with `bg-cover`) | No - full image always visible |

### Result
- **Desktop**: Image spans full width, height adjusts naturally
- **Mobile**: Image spans full width, height adjusts naturally
- **No cropping**: Palm tree logo AND tagline always visible
- **One change, done right**: No more back-and-forth adjustments


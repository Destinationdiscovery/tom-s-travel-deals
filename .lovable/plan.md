

## Remove Redundant Hero Text Overlay

### Overview
Remove the headline and tagline text from the hero section since the new TripReviews.ca branded image already contains this branding. The overlaid text is redundant and obscures the clean design of the branded hero image.

---

### Current State
The hero section displays:
- **H1 headline**: "Let's Discover the World" + "Together"
- **Tagline**: "Honest Reviews, Tested Gear & Travel Insights"
- **Scroll indicator**: Animated scroll hint at bottom

These text elements overlay on top of the branded hero image, which already contains the TripReviews.ca logo, tagline, and visual branding.

### After Change
- Remove the entire text content block (headline + tagline)
- Keep the background image with its light overlay
- Keep the scroll indicator for visual continuity
- The branded image speaks for itself

---

### File to Modify

**src/components/HeroSection.tsx**

Remove the content div containing the h1 and p elements (lines 15-27):

```text
Remove this block:
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
            Let's Discover the World
            <span className="block text-gradient">Together</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto font-body">
            Honest Reviews, Tested Gear & Travel Insights
          </p>
        </div>
      </div>
```

Also remove the dark overlay gradient since we want the branded image to display clearly without any darkening:

```text
Remove:
<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
```

---

### Result
The hero section will display the clean TripReviews.ca branded image as intended, with the palm tree logo, site name, and tagline visible as part of the image design. The scroll indicator remains to guide users down the page.


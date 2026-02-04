

## Change Section Titles to Navy Blue

### What
Update the "Destination Discovery", "Travel Gear Discovery", and "The Compass" section titles to use the same dark navy blue color as the "TripReviews.ca" text in the hero image.

### How

1. **Add a new custom color** in `src/index.css` for the navy blue (approximately `#1a3a5c` based on the hero image)

2. **Update the three section components** to use this navy color instead of `text-foreground`

---

### Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Add `--navy` custom color variable |
| `tailwind.config.ts` | Add `navy` to the color palette |
| `src/components/TravelStoriesSection.tsx` | Change title from `text-foreground` to `text-navy` |
| `src/components/GearReviewsSection.tsx` | Change title from `text-foreground` to `text-navy` |
| `src/components/CompassSection.tsx` | Change title from `text-foreground` to `text-navy` |

---

### Technical Details

**CSS Variable (in `:root`):**
```css
--navy: 210 40% 23%;  /* Dark navy blue matching hero image text */
```

**Tailwind Config Addition:**
```js
navy: "hsl(var(--navy))",
```

**Component Updates:**
```tsx
// Before
<h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">

// After  
<h2 className="font-display text-3xl md:text-5xl font-bold text-navy mb-4">
```

---

### Result
All three section titles will display in the same dark navy blue as the "TripReviews.ca" branding in the hero image, creating visual consistency across the homepage.


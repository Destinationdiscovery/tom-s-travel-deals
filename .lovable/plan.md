

## Animated Promotional Slideshow for ReviewThenGo

Build a cinematic animated slideshow component using your existing travel photos, with smooth Ken Burns-style transitions, branded text overlays, and your tri-color identity. It will serve two purposes:

1. **On-site**: Plays as an optional intro on the homepage (with a "Skip" button), shown once per session
2. **For socials**: A dedicated `/promo` page where you can screen-record the animation for Instagram/TikTok/YouTube

---

### What it will look like

A fullscreen, auto-playing sequence of ~8-10 of your best destination photos, each displayed for ~4 seconds with:

- Slow zoom-in (Ken Burns effect) on each photo
- Crossfade transitions between slides
- Animated text overlays per slide (e.g., "Cuba", "Mexico", "Curacao", "Japan", "Canada")
- Your "REVIEW THEN GO" branding with the sky/amber/emerald colors animated in at the end
- Tagline: "Know what to expect before you go."
- Final slide fades into the normal hero/search section

---

### Files to create/modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/components/PromoSlideshow.tsx` | The animated slideshow component with Ken Burns zoom, crossfade, text overlays, skip button, and auto-advance logic |
| Create | `src/pages/Promo.tsx` | Standalone fullscreen page at `/promo` for screen recording the slideshow for socials |
| Modify | `src/pages/Index.tsx` | Show the slideshow once per session before the hero (uses sessionStorage to track if already seen) |
| Modify | `src/App.tsx` | Add `/promo` route |
| Modify | `tailwind.config.ts` | Add `ken-burns` and `crossfade` keyframe animations |

---

### Slide sequence (using existing assets)

1. `hero-beach.jpg` -- "Discover Paradise"
2. `cuba-gallery-1.jpg` -- "Cuba"
3. `mexico-hero.webp` -- "Mexico"
4. `curacao-hero.avif` -- "Curacao"
5. `japan-fushimi-inari.jpg` -- "Japan"
6. `canada-boom-lake-louise.jpg` -- "Canada"
7. `cruise-hero.jpg` -- "Cruises"
8. `vegas-strip-hero.jpg` -- "Las Vegas"
9. Final branded slide with "REVIEW THEN GO" logo animation and tagline

---

### Technical details

- **Ken Burns effect**: CSS keyframe that scales from `scale(1)` to `scale(1.15)` over 4 seconds
- **Crossfade**: Opacity transitions between stacked absolutely-positioned images
- **Text animations**: Each destination name fades up with `animate-slide-up`, then fades out before the next slide
- **Skip button**: Fixed "Skip" button in the corner that immediately transitions to the homepage
- **Session tracking**: `sessionStorage.setItem('promo-seen', 'true')` so it only plays once per browser session
- **Promo page**: The `/promo` route plays the same slideshow in a loop without the skip button, perfect for screen recording
- **Performance**: Images are lazy-loaded and preloaded in sequence to avoid jarring transitions
- **Mobile-friendly**: All animations use CSS transforms (GPU-accelerated) and the layout adapts to any screen size


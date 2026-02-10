

## Fix Travel Intel Hero and Header Visibility

### Problem
1. The Travel Intel hero uses a plain CSS gradient (`from-navy to-background`) which looks washed out and gray compared to all other subpages that use full background images with dark overlays.
2. The header logo text ("ReviewThenGo") is hard to read against the light header background -- the sky-300, amber-400, and emerald-400 colors don't have enough contrast on the light `bg-background/80` header.

### Changes

#### 1. Travel Intel Hero -- Match Other Subpages (TravelIntel.tsx)

Replace the plain gradient hero with the same pattern used by Destinations, Gear, and Compass pages:
- Use an existing dark/moody asset as the background image (e.g., `snowbird-beach-sunset.jpg` or `hero-beach.jpg` -- already in assets)
- Add the standard dark overlay: `bg-gradient-to-b from-black/40 via-black/30 to-black/60`
- Set the section to `relative h-[40vh] min-h-[320px]` to match sibling pages
- Keep the Globe icon, title, and subtitle as-is -- they'll pop nicely against the dark backdrop

#### 2. Header Logo Contrast (Header.tsx)

Darken the logo text colors so they're readable on the light header background:
- Change `text-sky-300` to `text-sky-600` (Review)
- Change `text-amber-400` to `text-amber-500` (Then)
- Change `text-emerald-400` to `text-emerald-600` (Go)

These darker variants maintain the branded color identity while being legible on the light backdrop.

---

### Technical Details

**Files modified:**
- `src/pages/TravelIntel.tsx` -- swap hero section from CSS gradient to image + overlay pattern (lines 186-195)
- `src/components/Header.tsx` -- update logo text color classes (line 27)

**No new files, no new dependencies, no database changes.**


## Add Muted Navigation Links to Bottom of Hero Section

Add a subtle row of text-only navigation links at the bottom of the hero image, matching the muted, understated aesthetic of your site rather than drawing attention like flashy buttons.

### What will change

**File: `src/components/HeroSection.tsx`**

A horizontal row of navigation links will be added just above the scroll indicator at the bottom of the hero section. The links will include: **My Reviews**, **Gear Reviews**, **Travel Blog**, **About**, and **Contact** -- matching the same destinations as the header nav.

### Visual style

- Plain text links (no buttons, no borders, no backgrounds)
- Uses `white/50` text color with a subtle hover to `white/80` -- blending naturally into the dark overlay of the hero image
- Small font size (`text-sm`) with medium weight and generous spacing between links
- A thin `white/15` separator line above the links to subtly delineate them from the hero content
- On mobile, the links will be hidden since the hamburger menu already serves that purpose

### Technical details

- Import `Link` from `react-router-dom`
- Add a `div` positioned absolutely at the bottom of the hero (above the existing scroll indicator), containing the five navigation links
- Links array: `[{to: "/destinations", label: "My Reviews"}, {to: "/gear", label: "Gear Reviews"}, {to: "/compass", label: "Travel Blog"}, {to: "/about", label: "About"}, {to: "/contact", label: "Contact"}]`
- Classes: `hidden md:flex` to hide on mobile, `text-white/50 hover:text-white/80 transition-colors text-sm font-medium` for the muted styling
- The row sits at `bottom-20` to remain above the scroll indicator at `bottom-8`

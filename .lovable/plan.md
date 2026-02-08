

## Create RTG Text Favicon

Replace the current palm tree favicon with a clean "RTG" text-based favicon that matches the ReviewThenGo brand.

### Approach

Create an SVG favicon with the letters **RTG** -- SVG favicons are supported by all modern browsers and look sharp at any size. The styling will match your site's color palette.

### Design details

- **Letters**: Bold "RTG" in a clean sans-serif font
- **Colors**: Dark background (matching your site's dark tones, like `#1a1a2e` or similar) with white or light text -- ensures visibility on both light and dark browser tabs
- **Shape**: Rounded square background for a polished, app-icon feel
- **Size**: SVG scales perfectly, but we'll also keep a PNG fallback for older browsers

### What will change

| File | Change |
|---|---|
| `public/favicon.svg` | New SVG favicon file with RTG letters |
| `index.html` | Update the favicon `<link>` tag to point to the new SVG file (with PNG fallback) |

### Technical details

- Create `public/favicon.svg` with an inline SVG containing a rounded rect background and "RTG" text element
- Update `index.html` line 22: change `<link rel="icon" type="image/png" href="/favicon.png">` to `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`
- Keep the existing `/favicon.png` as a fallback reference


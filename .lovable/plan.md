
Goal: fix the mobile header clipping, make PWA install entry obvious, and resolve the production build failure introduced by the PWA setup.

What I found
1) Header clipping is a layout-width issue, not just safe-area padding.
- In `src/components/Header.tsx`, mobile shows:
  - logo + `AdminLoginDialog` icon on the left
  - theme toggle + search + admin “Dashboard” link + hamburger on the right
- On narrow screens this overflows, which is why the right side gets cut off and the hamburger can disappear.

2) Install entry exists but is hard to discover.
- `/install` route is present.
- Install link is currently in footer and mobile sheet only; if hamburger is clipped, users can’t reach it.

3) Build failure likely tied to current PWA config scope/asset handling.
- Build reaches output generation, then fails post-bundle.
- PWA config is active in `vite.config.ts`; this is where we should harden config to avoid workbox generation failures.

Implementation plan

1) Rework mobile header layout so nothing overflows
- File: `src/components/Header.tsx`
- Changes:
  - Hide desktop-style admin dashboard text link on mobile (`hidden md:flex`).
  - Keep only compact icon actions on mobile.
  - Reduce horizontal spacing on mobile (`gap-1/2`, keep larger gap on md+).
  - Make brand text slightly smaller on mobile (`text-xl` then `md:text-3xl`).
  - Ensure right actions container can shrink safely (`min-w-0`, `shrink-0` patterns where needed).
  - Keep safe-area padding on fixed header.

2) Add a clearly visible install entry in the top toolbar
- File: `src/components/Header.tsx`
- Changes:
  - Add a dedicated mobile install icon button (`Download`) linking to `/install` (visible even when menu closed).
  - Keep existing “Install App” inside sheet menu as secondary path.
  - Keep footer install link for completeness.

3) Improve install discoverability on home screen
- File: `src/pages/Index.tsx` (or existing hero component used on home, likely `HeroSection`)
- Changes:
  - Add small “Install App” CTA below/near hero search on mobile only.
  - CTA routes to `/install`; no heavy modal logic needed.

4) Stabilize PWA build config
- File: `vite.config.ts`
- Hardening changes:
  - Narrow `workbox.globPatterns` to core app-shell assets only (js/css/html/icons/fonts) and avoid unnecessary broad matching.
  - Add explicit `maximumFileSizeToCacheInBytes` to prevent generation failures if any bundle grows.
  - Keep runtime caching for images/APIs via `runtimeCaching` (so large media remains runtime-cached, not precached).
  - Keep `registerType: "autoUpdate"` and manifest unchanged unless validation flags an issue.

5) Quick verification checklist after implementation
- Mobile viewport (390x844 and 360x800):
  - Header right side no longer clipped.
  - Hamburger visible and tappable.
  - Install icon visible in toolbar.
- Navigation:
  - `/install` opens from toolbar, menu, and footer links.
- Build:
  - `vite build` and production pipeline complete successfully.
- PWA:
  - Manifest served, service worker registers, install page behavior still works.

Files to update
- `src/components/Header.tsx` (primary fix: clipping + install visibility)
- `src/pages/Index.tsx` or `src/components/HeroSection.tsx` (prominent mobile install CTA)
- `vite.config.ts` (build stability hardening for PWA)

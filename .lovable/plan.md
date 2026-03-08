

# PWA Setup & Mobile Optimization

## What We're Building
Turn ReviewThenGo into a fully installable Progressive Web App (PWA) with offline support, optimized mobile performance, and an install prompt page.

## Changes

### 1. Install `vite-plugin-pwa`
Add `vite-plugin-pwa` and `workbox-window` as dependencies.

### 2. Configure PWA in `vite.config.ts`
- Add `VitePWA` plugin with:
  - `registerType: 'autoUpdate'` for seamless updates
  - Full web app manifest (name, short_name, theme_color, icons at 192 and 512px, screenshots for install UI)
  - Workbox runtime caching strategies: CacheFirst for images/fonts, StaleWhileRevalidate for API calls
  - `navigateFallbackDenylist: [/^\/~oauth/]` to avoid caching OAuth routes
  - Precache the app shell

### 3. Update `index.html`
- Add `<meta name="theme-color">` (match primary brand color)
- Add Apple-specific meta tags: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`
- Ensure viewport meta has `viewport-fit=cover` for notch-safe rendering

### 4. Create PWA Icons
- Generate `pwa-192x192.png` and `pwa-512x512.png` in `public/` (derived from existing favicon)
- Add `apple-touch-icon.png` (180x180)

### 5. Create `/install` Page
- A dedicated install page with:
  - "Add to Home Screen" instructions for iOS (Share → Add to Home Screen) and Android (browser menu)
  - A "Install App" button that triggers the native `beforeinstallprompt` event on supported browsers
  - Detects if already installed (`display-mode: standalone`) and shows confirmation
  - Mobile-first responsive layout

### 6. Mobile Optimizations in `index.html` & CSS
- Add `apple-mobile-web-app-capable` and status bar style meta tags
- Safe area insets via `env(safe-area-inset-*)` for notched devices in `index.css`
- Ensure touch targets remain ≥48px (already in place per memory)

### 7. Register Service Worker in `main.tsx`
- Import and call `registerSW` from `virtual:pwa-register` for auto-update behavior

## Files

| File | Action |
|------|--------|
| `package.json` | Add `vite-plugin-pwa` dependency |
| `vite.config.ts` | Add VitePWA plugin with manifest + workbox config |
| `index.html` | Add theme-color, apple meta tags, viewport-fit |
| `public/pwa-192x192.png` | New icon (use existing favicon.png) |
| `public/pwa-512x512.png` | New icon (use existing favicon.png) |
| `src/main.tsx` | Register service worker |
| `src/pages/Install.tsx` | New install prompt page |
| `src/App.tsx` | Add `/install` route |
| `src/index.css` | Add safe-area-inset padding |

## Order
1. Dependencies + vite config → 2. index.html meta tags → 3. Icons → 4. SW registration in main.tsx → 5. Install page + route → 6. CSS safe areas


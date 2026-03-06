

# Plan: Hero Section Cleanup

## Changes to `src/components/HeroSection.tsx`

### 1. Remove "Find Your Next Trip" button
Delete the entire CTA block (lines 113-124) — the `<a>` wrapping the "Find Your Next Trip" button. Keep the Expedia logo/badge below.

### 2. Fix search input text color
The input uses `text-foreground` which resolves to a CSS variable that may be white in dark themes or on this dark overlay. Change to an explicit dark color: `text-gray-900` so typed text is always visible on the white background.

### 3. Add helper text below search bar
After the search bar `div` (line 111), add a small subtitle:
```
<p className="text-white/70 text-xs mt-2">
  Search any hotel, resort, or destination worldwide — get honest, AI-powered reviews instantly.
</p>
```

Three simple edits, all in one file.


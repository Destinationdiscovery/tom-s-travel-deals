

# Hero Logo Swap + Fix Floating Expedia Widget

## Overview

Three changes:
1. Replace the "expedia" text in the hero with the uploaded Expedia logo image, positioned BELOW the headline with "Powered by:" label
2. Fix the Expedia search widget so it actually renders and floats properly on the page

## Changes

### 1. Copy Expedia Logo to Project Assets
Copy `user-uploads://expedia.png` to `src/assets/expedia-logo.png` so it can be imported as an ES6 module.

### 2. Update Hero Section
**File: `src/components/HeroSection.tsx`**

- Remove the "expedia" text link that currently sits ABOVE the headline (lines 14-21)
- Add below the subtitle: small "Powered by:" text followed by the Expedia logo image (~120px wide), wrapped in an affiliate link
- Layout: headline, subtitle, then "Powered by: [logo]"

### 3. Fix Floating Expedia Search Widget
**File: `src/components/ExpediaSearchWidget.tsx`**

The widget isn't working because the Expedia script likely initializes on load but the widget div is hidden via CSS. Two fixes:

- Re-initialize the widget each time it becomes visible by calling `window.eg?.widgets?.init?.()` (or re-inserting the widget div) when `isOpen` changes to true
- Add a small delay after script load before attempting init
- Ensure the widget container has minimum height so the Expedia form has space to render
- Keep the widget always in DOM but use visibility approach that doesn't prevent script initialization

### 4. Header -- No Changes Needed
The header toggle already works correctly with the Search icon and "Expedia" label.

## Technical Details

- The Expedia widget script scans for `.eg-widget` divs on load. If the div is hidden (opacity-0, pointer-events-none), the script may skip it. The fix is to detect when the script's global object is available and manually trigger re-initialization when the panel opens.
- The logo is a PNG with transparent background -- it will display cleanly over the dark hero gradient.
- No new dependencies needed.

## File Summary

| File | Action |
|------|--------|
| `src/assets/expedia-logo.png` | New: copy uploaded logo |
| `src/components/HeroSection.tsx` | Move Expedia logo below headline, use image |
| `src/components/ExpediaSearchWidget.tsx` | Fix widget initialization and floating behavior |


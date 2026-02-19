

# Fix Expedia Logo Size + Search Widget

## Overview

Two fixes: make the Expedia logo in the hero much larger and more visible, and address the blank search widget by using an iframe-based embed approach since the JavaScript widget SDK isn't rendering inside a React SPA.

## Changes

### 1. Increase Expedia Logo Size in Hero
**File: `src/components/HeroSection.tsx`**

- Change the logo height from `h-5 md:h-6` (20-24px) to `h-8 md:h-10` (32-40px) so it's clearly visible
- Slightly increase the "Powered by:" text size from `text-xs` to `text-sm`

### 2. Fix Blank Search Widget
**File: `src/components/ExpediaSearchWidget.tsx`**

The Expedia `eg-widgets.js` script scans the DOM on load and initializes `.eg-widget` divs it finds. In a React SPA, the widget div gets mounted/unmounted dynamically, and calling `window.eg.widgets.init()` may not reliably re-scan. The widget appears blank because the script ran before the div existed or can't re-initialize properly.

**Fix approach:**
- Instead of relying on the JS SDK's init method, use an **iframe-based embed** pointing to the Expedia affiliate search page. This is more reliable in SPAs since iframes are self-contained.
- The iframe URL pattern: `https://www.expedia.ca/affiliate/search?affcid=ca.network.pz.affiliate.1100l5DpWA` embedded in the floating panel.
- If the iframe approach doesn't work with Expedia's affiliate program, fall back to a **direct link button** styled as a search prompt that opens Expedia in a new tab with the affiliate tracking code.
- As a secondary attempt, also try a longer delay (1000ms) on `init()` and ensure the script's `onload` callback is used rather than just setting `scriptLoaded` immediately.

The widget container will also get a white/light background so the Expedia form elements (which render with light theme) are visible rather than being invisible on the dark background.

## Technical Details

- The core issue with the blank widget is that third-party widget scripts that scan the DOM on initial load often don't work well with React's virtual DOM and conditional rendering
- Adding `background: white` to the widget container ensures any rendered form elements are visible (Expedia's widget uses light-colored inputs)
- The iframe fallback is the most reliable approach for third-party booking widgets in SPAs

## File Summary

| File | Action |
|------|--------|
| `src/components/HeroSection.tsx` | Increase logo size from h-5 to h-8 |
| `src/components/ExpediaSearchWidget.tsx` | Add white background for widget, improve init timing, add iframe fallback |


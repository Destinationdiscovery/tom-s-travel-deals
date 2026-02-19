

# Expedia Search Widget -- Right-Side Slide Panel

## Overview

Redesign the Expedia search widget from a top-right dropdown into a **right-side slide-out panel** that users can open and close at any time while browsing. The toggle button stays in the header, but the panel slides in from the right edge of the screen like a sidebar drawer.

## Changes

### 1. Redesign Widget as Right-Side Panel
**File: `src/components/ExpediaSearchWidget.tsx`**

- Change from a small top-right fixed dropdown to a **full-height right-side panel** (fixed, top to bottom, right edge)
- Slide in/out using `translateX` animation (off-screen right when closed, slides in when open)
- Panel width: `min(575px, 92vw)` (matching Expedia's optimal range)
- Top padding accounts for the fixed header height (~64px)
- Includes the Expedia logo header bar with a close button
- The `.eg-widget` embed div renders inline within the panel with a white background
- Keeps the existing script loading, retry init logic, and fallback button
- Adds a semi-transparent backdrop overlay behind the panel that also closes the widget on click

### 2. Remove "Expedia" Text from Header Button
**File: `src/components/Header.tsx`**

- Keep the Search icon toggle button in the header but remove the "Expedia" text label -- the icon alone is cleaner
- Replace with just an Expedia logo icon or keep the search icon as-is
- The button still toggles `widgetOpen` state which controls the slide panel

## Technical Details

- The panel uses `fixed inset-y-0 right-0` positioning with `transform translateX(100%)` when closed and `translateX(0)` when open
- A backdrop overlay (`bg-black/40`) appears behind the panel and dismisses it on click
- The widget embed code, script loading, and init retry logic remain unchanged
- The panel sits at `z-[60]` to float above all page content

## File Summary

| File | Action |
|------|--------|
| `src/components/ExpediaSearchWidget.tsx` | Redesign as right-side slide panel with backdrop |
| `src/components/Header.tsx` | Clean up toggle button (remove "Expedia" text) |



# Floating Expedia Search Widget + Hero Branding

## Overview

Two changes inspired by the reference image:

1. **Expedia logo on the hero banner** -- Add the Expedia brand mark overlaid on the hero image, just like in the reference screenshot where it appears above the "TRAVEL REVIEWS" headline.

2. **Floating Expedia search widget** -- A toggleable floating panel (triggered by the Search icon in the header) that embeds the official Expedia affiliate search widget using their provided script/div snippet. Users can show/hide it at will.

## Changes

### 1. Add Expedia Logo to Hero
**File: `src/components/HeroSection.tsx`**

- Add a small Expedia logo (yellow on dark) above the headline text
- Use an SVG or text-based Expedia brand mark that links to the affiliate URL
- Positioned centered above "REVIEW THEN GO", matching the reference layout

### 2. Create Floating Search Widget Component
**File: `src/components/ExpediaSearchWidget.tsx`** (new)

A floating panel component that:
- Renders as a fixed-position overlay (top-right, below header)
- Contains the Expedia affiliate widget embed code:
  ```html
  <div class="eg-widget" data-widget="search" data-program="ca-expedia" 
       data-lobs="stays,flights" data-network="pz" 
       data-camref="1100l5DpWA" data-pubref=""></div>
  ```
- Loads the Expedia widget script (`eg-widgets.js`) dynamically via a useEffect
- Has a close/minimize button
- Slides in/out with animation
- Semi-transparent dark background to match the site theme

### 3. Update Header with Widget Toggle
**File: `src/components/Header.tsx`**

- Change the existing Search icon button from "scroll to top" to toggling the floating Expedia widget open/closed
- Add an "Expedia" label or small logo next to the search icon so users know what it opens
- Manage open/close state for the widget

### 4. Update Index Page
**File: `src/pages/Index.tsx`**

- Include the `ExpediaSearchWidget` component in the page layout so it's available as a floating overlay

## Technical Details

- The Expedia widget script (`eg-widgets.js`) will be loaded dynamically using a `useEffect` that appends a script tag to the document head, only once
- The widget div needs to be in the DOM when the script loads, so we render it but hide/show via CSS (opacity/transform) rather than conditional mounting
- The `data-camref="1100l5DpWA"` is the affiliate tracking code from the provided snippet
- The widget supports `stays,flights` as configured LOBs (lines of business)
- No new dependencies needed -- just DOM script injection

## File Summary

| File | Action |
|------|--------|
| `src/components/HeroSection.tsx` | Add Expedia logo above headline |
| `src/components/ExpediaSearchWidget.tsx` | New: floating widget with Expedia embed |
| `src/components/Header.tsx` | Toggle widget instead of scroll-to-top |
| `src/pages/Index.tsx` | Add ExpediaSearchWidget to layout |

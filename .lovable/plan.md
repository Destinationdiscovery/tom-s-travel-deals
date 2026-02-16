
# Redesign Hero Search Bar: Dropdown to Button Row

## Overview

Replace the dropdown menu selector with a row of stylish category buttons displayed beneath the search input. Add a new "Travel Deals" button that scrolls to the deals section instead of triggering a search.

## Layout Change

Current layout:
```text
[Dropdown v] [____Search Input____] [Search Button]
```

New layout:
```text
        [____Search Input (taller)____] [Search Button]

  [Destination Review] [Destination Search] [Travel Gear]
  [Requirements] [Advisories] [News] [Travel Deals]
```

## Changes

**File: `src/components/HeroSection.tsx`**

1. Remove the dropdown entirely (the `dropdownRef`, `showTypeDropdown` state, the `ChevronDown` import, and the dropdown button/menu markup)
2. Remove the `useEffect` for outside-click handling (no longer needed)
3. Make the search input taller: change `h-12` to `h-14` and bump text size
4. Below the search row, add a new flex-wrap row of styled buttons -- one for each search type plus a "Travel Deals" button
5. Each category button:
   - Shows the label text (e.g., "Destination Review")
   - Has a semi-transparent glass style (`bg-white/20 backdrop-blur-sm text-white border border-white/30`)
   - When active/selected, uses a solid highlight (`bg-white/90 text-gray-900 font-semibold`)
   - On click, calls `handleSearchTypeChange(type)` (same logic as before -- updates placeholder, clears query, focuses input)
6. The "Travel Deals" button:
   - Styled the same as other buttons but is not a search type
   - On click, smoothly scrolls to the deals section using `document.getElementById('travel-deals')?.scrollIntoView({ behavior: 'smooth' })`
7. The search button text and placeholder continue to update dynamically based on the selected type (existing behavior preserved)

**File: `src/components/TravelDealsSection.tsx`** (minor)

- Add `id="travel-deals"` to the section's root element so the "Travel Deals" button can scroll to it

## Technical Details

- The `SearchType` type and `searchTypeConfigs` remain unchanged
- All existing search logic (`handleSearch`, `handleSuggestionClick`, `onInlineSearch`, etc.) stays the same
- The `showTypeDropdown` state and `dropdownRef` are removed since there's no dropdown
- The `ChevronDown` import from lucide-react is removed
- Mobile responsiveness: the button row uses `flex-wrap` with `gap-2` so buttons wrap naturally on smaller screens

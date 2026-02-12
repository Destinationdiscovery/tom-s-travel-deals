

# Fix: Dark Mode Text Visibility on Search Bar Buttons

## Problem

The search type selector and input field use `bg-white/95` (always white) but `text-foreground` for text color. In dark mode, `--foreground` resolves to a near-white color, making text invisible against the white background.

## Solution

Replace theme-dependent color classes with hardcoded dark text colors on the always-white search bar elements.

## Technical Detail

**File: `src/components/HeroSection.tsx`**

Three changes, all swapping `text-foreground` to `text-gray-900` (or similar fixed dark color):

1. **Type selector button** (~line 140): Change `text-foreground` to `text-gray-900`
2. **Search input** (~line 162): Change `text-foreground` to `text-gray-900` and `placeholder:text-muted-foreground` to `placeholder:text-gray-400`
3. **Suggestions dropdown items** (~line 181): The suggestion text also uses `text-foreground` -- change to `text-gray-900`, and `text-muted-foreground` to `text-gray-500`
4. **Type dropdown items** (~line 151): Change `text-foreground` references to `text-gray-900`

These elements always have white/light backgrounds regardless of theme, so their text colors should also be fixed rather than theme-dependent.


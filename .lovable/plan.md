

# Fix Header Clipping & Add PWA Install Link

## Issues
1. **Header cut off on right**: The `body` has `padding-right: env(safe-area-inset-right)` but the fixed header uses `left-0 right-0`, ignoring body padding entirely. The header needs its own safe-area-aware padding.
2. **No install link visible**: The `/install` page exists but there's no link to it anywhere in the UI.

## Changes

### 1. `src/components/Header.tsx`
- Add `pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]` (or inline style) to the header's inner container so icons don't get clipped by notches/edges.
- Alternatively, add safe-area padding directly to the fixed header element.

### 2. `src/components/Footer.tsx`
- Add an "Install App" link to the footer navigation that points to `/install`.

### 3. `src/components/Header.tsx` (mobile menu)
- Add an "Install App" link inside the mobile Sheet menu so users can find it easily.

## Files

| File | Change |
|------|--------|
| `src/components/Header.tsx` | Add safe-area padding to header; add Install link to mobile menu |
| `src/components/Footer.tsx` | Add Install App link |


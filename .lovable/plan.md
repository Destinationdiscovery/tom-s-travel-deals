

# Simplify Header Navigation

Remove all navigation links from the header except the admin Dashboard link and the light/dark theme toggle.

## Changes

**File: `src/components/Header.tsx`**

- Remove the `navLinks` array entirely (Destination Search, Travel Gear Reviews, Travel Blog, About, Know Before You Go)
- Remove the desktop nav loop that renders those links
- Remove the mobile menu button and mobile menu dropdown (no links to show)
- Keep only: logo, Dashboard link (admin-only), and ThemeToggle

The header will show just the ReviewThenGo logo on the left, and Dashboard + theme toggle on the right.


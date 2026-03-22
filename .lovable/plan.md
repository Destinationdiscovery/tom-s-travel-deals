

# Fix Hero Image Clipping on Mobile

## Problem
On mobile (360px width), the hero section at `h-[420px]` isn't tall enough for all the content (H1, subtitle, E-E-A-T line, search bar, helper text, Expedia logo, Install App button). The H1 gets clipped at the top.

## Fix
**`src/components/HeroSection.tsx`** (line 56):
- Increase mobile height from `h-[420px]` to `h-[520px]` to give enough room for all content
- Keep `md:h-[500px]` as-is (desktop is fine)

| File | Change |
|------|--------|
| `src/components/HeroSection.tsx` | `h-[420px]` → `h-[520px]` |

One-line change. No visual or functional impact beyond giving the hero enough breathing room on mobile.


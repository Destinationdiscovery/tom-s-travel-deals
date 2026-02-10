

## Footer Layout Fix: Left-Aligned with Better Spacing

### What Changes

Instead of centering both sections in the middle of the page, switch to a layout where:

- The **Brand section** (logo, description, Travelonly link) is **left-aligned**
- The **Explore links** section is **left-aligned**
- Both sections are spaced apart using `justify-between` (or `justify-evenly`) so they spread across the footer width naturally
- On mobile, they stack vertically and center (current behavior stays)

### Technical Changes

**File:** `src/components/Footer.tsx` (line 10)

Change the flex container from:
```
flex flex-col md:flex-row items-center justify-center gap-12
```
To:
```
flex flex-col md:flex-row items-start justify-evenly gap-12
```

Then update the two child sections from `items-center text-center` to `items-start text-left` on desktop:
- Brand section (line 12): `items-center md:items-start` and text left on desktop
- Explore section (line 34): `items-center md:items-start`
- Nav links (line 36): `items-center md:items-start`

Mobile stays centered and stacked. Desktop gets left-aligned columns with even spacing between them.

### Single file modified
`src/components/Footer.tsx` -- layout class changes only, no content changes.


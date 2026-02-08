

## Remove Contact Links from Header and Footer

Hide the contact-related links from the visitor-facing site. The `/contact` route and page will remain in the code (so it can be re-enabled later), but it won't be accessible from the navigation.

### Changes

**1. Header (`src/components/Header.tsx`)**

- Remove the "Contact" link from **desktop navigation** (lines 58-63)
- Remove the "Contact" link from **mobile navigation** (lines 107-113)

**2. Footer (`src/components/Footer.tsx`)**

- Remove the entire **"Get in Touch" column** (lines 52-73) — this is the section with the "Contact Form" and "519-771-2534" links
- Remove the **"Contact" link** from the "Explore" quick links list (lines 46-48)
- Update the grid from `md:grid-cols-4` to `md:grid-cols-3` since there will be one fewer column
- Clean up unused imports (`Mail`, `Phone`) that are no longer needed

### What stays

- The `/contact` route in `App.tsx` and the `Contact.tsx` page file remain untouched — easy to bring back later
- The `ContactSection.tsx` component file stays as-is (it's not currently rendered anywhere visible)

### Technical details

| File | Lines affected | Change |
|---|---|---|
| `src/components/Header.tsx` | 58-63 | Remove desktop "Contact" Link |
| `src/components/Header.tsx` | 107-113 | Remove mobile "Contact" Link |
| `src/components/Footer.tsx` | 1 | Remove `Mail`, `Phone` from imports |
| `src/components/Footer.tsx` | 10 | Change `md:grid-cols-4` to `md:grid-cols-3` |
| `src/components/Footer.tsx` | 46-48 | Remove "Contact" from Explore links |
| `src/components/Footer.tsx` | 52-73 | Remove entire "Get in Touch" column |

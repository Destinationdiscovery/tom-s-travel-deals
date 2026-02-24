

# Phase 1: Foundation — Colors, Fonts, Header, Footer & Light Mode

This is the first of 3-4 phases to transform ReviewThenGo into a premium, high-converting affiliate travel site. Phase 1 lays the visual foundation that all subsequent phases will build on.

**What's NOT touched:** All admin/dashboard pages (GearAdmin, BookingReport, ClientFile, QuotePreview, etc.) remain completely unchanged.

---

## What Changes in Phase 1

### 1. Switch to Light Mode Only
- Remove the `ThemeProvider` wrapper and `ThemeToggle` component from the client-facing site
- Set the default theme to light permanently
- Update CSS variables to use the new brand color palette
- The admin dashboard keeps its existing dark styling untouched

### 2. New Brand Color Palette
All CSS custom properties in `src/index.css` will be updated:

| Role | Current | New |
|------|---------|-----|
| Background | Dark slate (#151a23) | Light gray (#F5F5F5) |
| Foreground (text) | Light gray | Dark charcoal (#1a1a2e) |
| Primary (links, CTAs) | Sky blue | Deep ocean blue (#003366) |
| Card background | Dark card | White (#FFFFFF) |
| CTA buttons | Blue | Warm orange (#FF6600) |
| Trust accents | Various | Forest green (#228B22) |
| Muted text | Slate gray | Medium gray (#6B7280) |

### 3. New Fonts
- Replace **Playfair Display** with **Montserrat** for headings (bold, modern feel)
- Replace **Inter** with **Open Sans** for body text
- Set base body font size to 18px with 1.5 line-height
- Update the Google Fonts import and Tailwind config accordingly

### 4. Redesigned Header
- Sticky top nav with deep ocean blue (#003366) background
- Logo "Review Then Go" on the left (keep the colored text branding)
- Navigation links: **Home | Destinations | Gear | Intel | Blog | Deals**
  - Add "Deals" link (scrolls to deals section or links to deals page)
  - Add "Intel" link to nav
- Mobile: Hamburger menu with slide-out drawer for all links
- Search icon opens the existing Expedia widget (unchanged behavior)
- Remove ThemeToggle button from header
- Admin link stays but is only visible when logged in (unchanged)

### 5. Redesigned Footer
- Deep ocean blue (#003366) background with white text
- Three-column layout: Brand + tagline | Quick Links (Home, Reviews, Gear, Intel, Blog, Deals, About, Contact) | Legal (Privacy Policy, Affiliate Disclosure)
- Social icons row: placeholders for Twitter/X and Instagram (link to # for now)
- "Powered by Expedia" badge with affiliate link
- Copyright line: "(c) 2026 Review Then Go. All rights reserved."
- "Made with heart" line kept

### 6. New Pages: Privacy Policy & Affiliate Disclosure
- `/privacy-policy` — Standard placeholder privacy policy text
- `/affiliate-disclosure` — Standard affiliate disclosure explaining commission relationships with Expedia, Hotels.com, VRBO, and Amazon
- Both pages use the new Header + Footer, simple content layout
- Added to footer links and App.tsx routes

### 7. Mobile Hamburger Menu
- On screens smaller than `md` (768px), collapse nav links into a hamburger icon
- Clicking opens a slide-out sheet/drawer with all nav links stacked vertically
- Close on link click or outside tap

---

## Technical Details

### Files Modified
- **`src/index.css`** — Replace all CSS custom properties with new light-mode palette; remove `.dark` block; update font imports to Montserrat + Open Sans; set base font-size to 18px
- **`tailwind.config.ts`** — Update `fontFamily.display` to Montserrat, `fontFamily.body` to Open Sans
- **`src/App.tsx`** — Remove `ThemeProvider` wrapper (or set to always light); add routes for `/privacy-policy` and `/affiliate-disclosure`
- **`src/components/Header.tsx`** — Full redesign: ocean blue background, updated nav links (add Deals + Intel), mobile hamburger menu with Sheet component, remove ThemeToggle
- **`src/components/Footer.tsx`** — Full redesign: three-column layout, legal links, social icons, Expedia badge
- **`src/components/ThemeToggle.tsx`** — Remove or keep for admin only (won't be imported by client pages)

### Files Created
- **`src/pages/PrivacyPolicy.tsx`** — Privacy policy page with generated placeholder text
- **`src/pages/AffiliateDisclosure.tsx`** — Affiliate disclosure page with generated text

### Files NOT Touched
- All files under `src/components/dashboard/`
- `src/pages/GearAdmin.tsx`, `src/pages/BookingReport.tsx`, `src/pages/ClientFile.tsx`, `src/pages/PublicQuote.tsx`
- All edge functions
- All database tables/migrations
- `src/components/AffiliateLinks.tsx` (affiliate logic stays the same)

---

## What Comes Next (Future Phases)
- **Phase 2:** Homepage redesign — bigger hero with rotating images, search bar in hero, stronger CTA buttons, urgency text on deals, trust badges
- **Phase 3:** Content pages — review page enhancements, gear comparison tables, intel/blog improvements, email capture popup
- **Phase 4:** Conversion optimizations — exit-intent popup, email capture DB table, additional CTAs, cross-linking between sections


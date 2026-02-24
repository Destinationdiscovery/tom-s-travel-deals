

# Phase 3: Content Pages — Styling Consistency, Enhanced CTAs & Email Capture

Building on Phase 1 (colors, fonts, header, footer) and Phase 2 (homepage redesign), this phase brings the new brand styling to all client-facing content pages and adds an email capture system.

**What's NOT touched:** All admin/dashboard pages remain completely unchanged.

---

## 1. Destinations Page (`src/pages/Destinations.tsx`)

- Replace the old `text-sky-300` accent in the hero heading with the brand primary color
- Upgrade the search button to warm-orange (`bg-secondary`) styling
- Add the `AffiliateDisclosureBanner` at the top
- Add a "Book on Expedia" warm-orange button to each `DestinationCard`

**File:** `src/pages/Destinations.tsx` -- updated styling
**File:** `src/components/destinations/DestinationCard.tsx` -- add Expedia CTA button

---

## 2. Destination Review Page (`src/pages/DestinationReview.tsx`)

- Replace the inline affiliate CTA banner buttons with warm-orange styling (the `InlineAffiliateCTA` component)
- Upgrade the sidebar `AffiliateLinks` "Ready to Book?" buttons to use warm-orange for Expedia
- Add "Tom's Take" personal note section after the summary card (styled callout box with quote icon)
- Add the `AffiliateDisclosureBanner` at the top

**File:** `src/pages/DestinationReview.tsx` -- enhanced
**File:** `src/components/InlineAffiliateCTA.tsx` -- warm-orange CTA button styling

---

## 3. Gear Page (`src/pages/Gear.tsx`)

- Replace `text-sky-300` accent with brand primary
- Upgrade the search button to warm-orange
- Add the `AffiliateDisclosureBanner` at the top

**File:** `src/pages/Gear.tsx` -- updated styling

---

## 4. Travel Intel Page (`src/pages/TravelIntel.tsx`)

- Upgrade "Check" and "Get News" buttons to warm-orange
- Add the `AffiliateDisclosureBanner` at the top

**File:** `src/pages/TravelIntel.tsx` -- updated styling

---

## 5. Blog / Compass Page (`src/pages/Compass.tsx`)

- Replace `text-sky-300` accent with brand primary
- Add the `AffiliateDisclosureBanner` at the top

**File:** `src/pages/Compass.tsx` -- updated styling

---

## 6. Compare Page (`src/pages/Compare.tsx`)

- Upgrade "Generate Verdict" button to warm-orange
- Add the `AffiliateDisclosureBanner` at the top

**File:** `src/pages/Compare.tsx` -- updated styling

---

## 7. About Page (`src/pages/About.tsx`)

- Add a hero section with a travel image background (reuse existing asset) to match other pages
- Add the `AffiliateDisclosureBanner` at the top
- Add a "Toronto-based travel consultant" subtitle under the heading

**File:** `src/pages/About.tsx` -- enhanced

---

## 8. Contact Page (`src/pages/Contact.tsx`)

- Add the `AffiliateDisclosureBanner` at the top
- Upgrade the "Why Book With Tom" card accents to use brand colors

**File:** `src/pages/Contact.tsx` -- minor updates

---

## 9. InlineAffiliateCTA Component Enhancement

- Change the banner variant button from `bg-primary` to `bg-secondary` (warm orange)
- Update button text to "Search Deals on Expedia" for stronger conversion language

**File:** `src/components/InlineAffiliateCTA.tsx` -- CTA upgrade

---

## 10. AffiliateLinks Component Enhancement

- Add a prominent warm-orange "Book on Expedia" button as the primary CTA above the platform comparison cards
- Keep the three platform cards as secondary options below

**File:** `src/components/AffiliateLinks.tsx` -- enhanced with primary CTA

---

## 11. Email Capture Popup (New Feature)

Create a newsletter signup popup that appears after 30 seconds on the homepage:
- Headline: "Get Weekly Exclusive Deals"
- Subtext: "Join 5,000+ Canadian travelers getting the best deals, reviews, and tips delivered weekly."
- Email input + warm-orange "Subscribe" button
- Dismissible with X button (stored in localStorage so it doesn't reshow for 7 days)
- Stores email signups in a new `email_subscribers` database table

### Database Table
Create `email_subscribers` table:
- `id` (uuid, primary key)
- `email` (text, unique, not null)
- `subscribed_at` (timestamptz, default now())
- `source` (text, default 'popup') -- tracks where the signup came from

RLS: Allow anonymous inserts (public signup), no select/update/delete for anon users.

**Files Created:**
- `src/components/EmailCapturePopup.tsx` -- the popup component

**Files Modified:**
- `src/pages/Index.tsx` -- add EmailCapturePopup

---

## Technical Summary

### Database Changes
- New table: `email_subscribers` with RLS allowing anonymous inserts only

### Files Created
- `src/components/EmailCapturePopup.tsx` -- email capture popup with localStorage dismissal

### Files Modified
- `src/pages/Destinations.tsx` -- brand styling, disclosure banner
- `src/components/destinations/DestinationCard.tsx` -- add Expedia CTA
- `src/pages/DestinationReview.tsx` -- disclosure banner, Tom's Take section
- `src/pages/Gear.tsx` -- brand styling, disclosure banner
- `src/pages/TravelIntel.tsx` -- warm-orange buttons, disclosure banner
- `src/pages/Compass.tsx` -- brand styling, disclosure banner
- `src/pages/Compare.tsx` -- warm-orange buttons, disclosure banner
- `src/pages/About.tsx` -- hero section, disclosure banner
- `src/pages/Contact.tsx` -- disclosure banner
- `src/components/InlineAffiliateCTA.tsx` -- warm-orange CTA
- `src/components/AffiliateLinks.tsx` -- primary Expedia CTA button
- `src/pages/Index.tsx` -- add EmailCapturePopup

### Files NOT Touched
- All files under `src/components/dashboard/`
- All admin pages (GearAdmin, BookingReport, ClientFile, etc.)
- All edge functions
- `src/index.css`, `tailwind.config.ts` (Phase 1 styling stays)
- `src/components/Header.tsx`, `src/components/Footer.tsx` (Phase 1 work stays)
- `src/components/HeroSection.tsx`, `src/components/TrustBadges.tsx` (Phase 2 work stays)

---

## What Comes Next (Phase 4)
- Exit-intent popup with hot deals
- Cross-linking between sections (gear recommendations on review pages)
- Additional conversion optimizations
- Social sharing buttons on review pages


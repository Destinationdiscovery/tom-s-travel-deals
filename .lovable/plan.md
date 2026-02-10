

## Review Page Monetization Overhaul

Four changes to make affiliate links feel like editorial content rather than ads.

---

### 1. Sidebar: "Ready to Book?" Contextual Card

**File:** `src/components/AffiliateLinks.tsx`

Replace the generic "Book or Compare Prices" heading and bare buttons with an editorial card:

- Heading becomes **"Ready to Book?"** with a subline: *"Compare rates across top platforms"*
- Each affiliate button gets a one-line value prop underneath (e.g., Expedia: "Bundle hotel + flight for savings", Hotels.com: "Earn a free night every 10 stays", VRBO: "Best for groups & longer stays")
- Buttons become full-width stacked cards instead of inline colored pills -- cleaner, less "ad-like"
- Keep the commission disclosure at the bottom

---

### 2. Things to Do: Reframe CTAs as Utility

**File:** `src/components/review/ThingsToDoSection.tsx`

- Change "Book on Expedia" button text to **"Find tours & tickets"** -- positions the CTA as a tool, not an ad
- Change "See More Activities" link to **"Explore more things to do"**
- Keep the same Expedia affiliate link underneath (monetization stays, perception changes)

---

### 3. Inline "Plan Your Trip" CTA After Travel Tips

**File:** `src/components/AIReviewResult.tsx`

Insert a new section between Travel Tips (order-6) and the mobile Location Map (order-7):

- A subtle card with a Compass icon and heading **"Plan Your Trip"**
- Subtext: *"Found what you're looking for? Compare rates and book with confidence."*
- Three inline text links: Expedia | Hotels.com | VRBO (geo-targeted, same affiliate links)
- Styled like an editorial callout (border-left accent or subtle background), not a banner ad
- This catches users at the moment of highest intent -- they've read the review, seen tips, and are ready to act

---

### 4. Loading Screen: Travel Tip During Wait

**File:** `src/components/ReviewLoadingStages.tsx`

Add a "Did you know?" travel tip below the progress stages to keep users engaged during the 15-20s wait:

- A small card below the loading stages with a rotating tip (randomly selected from a set of 5-6 generic travel tips)
- Examples: "Booking mid-week flights can save you up to 20%", "Travel insurance typically costs 4-8% of your trip"
- One tip includes a soft affiliate nudge: *"Pro tip: Bundle your hotel and flight on Expedia to save up to 30%"* with a text link
- Styled as a muted info card so it doesn't compete with the loading indicator

---

### Technical Summary

| File | Change |
|------|--------|
| `src/components/AffiliateLinks.tsx` | Redesign to editorial "Ready to Book?" card with value props per platform |
| `src/components/review/ThingsToDoSection.tsx` | Reword CTAs: "Find tours & tickets" / "Explore more things to do" |
| `src/components/AIReviewResult.tsx` | Add inline "Plan Your Trip" CTA card after Travel Tips section |
| `src/components/ReviewLoadingStages.tsx` | Add "Did you know?" tip card with soft affiliate nudge below progress |

No new dependencies. No database changes. All affiliate links remain geo-targeted using existing `detectCountry()` utility.

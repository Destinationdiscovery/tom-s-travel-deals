

# Add "Search More Deals" CTA Next to Featured Deals Heading

## Change

Add a "Search More Deals" link beside the "Featured Deals" heading in `TravelDealsSection.tsx`, styled similarly to the "All Articles" link in the Blog Preview section (small text, primary color, with an arrow icon). It will link to the Expedia affiliate homepage using the geo-detected country link.

## Technical Details

### File: `src/components/TravelDealsSection.tsx`

- Import `ArrowRight` from lucide-react, and `detectCountry`, `EXPEDIA_LINKS` from `@/components/AffiliateLinks`
- Wrap the "Featured Deals" `<h3>` in a flex container with `justify-between` and `items-center`
- Add an `<a>` tag linking to `EXPEDIA_LINKS[detectCountry()]` with text "Search More Deals" and an arrow icon, styled as `text-sm font-medium text-primary hover:underline`


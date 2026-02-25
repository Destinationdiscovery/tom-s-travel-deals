

# Plan: Change "Canadians" to "Travellers" in Hero Headline

Update the hero section headline from "Real Travel Reviews, Deals & Insights for Canadians" to "Real Travel Reviews, Deals & Insights for Travellers" to make the site feel inclusive to all visitors.

## Files to Update

| File | Change |
|------|--------|
| `src/components/HeroSection.tsx` | Change "for Canadians" to "for Travellers" in the `<h1>` tag |
| `src/pages/Index.tsx` | Update the SEO `title` and `description` props passed to `<SEOHead>` to replace "Canadians" with "Travellers" |

Two small text changes, no logic changes.


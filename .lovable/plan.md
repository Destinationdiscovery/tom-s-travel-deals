

User wants up to 3 affiliate link slots in Content Studio so they can write articles comparing products or recommending accompanying products (e.g. firestick + travel adapter + HDMI cable).

Current state: 1 affiliate slot (URL + brand + anchor) in BlogPostCreator.tsx, sent to generate-blog-post edge function which weaves 2-4 mentions of that single URL.

Plan: extend to an array of up to 3 affiliate items. Each gets 2-3 natural mentions in the article. AI is told to treat them as comparison/companion products.

# Plan: Multi-Affiliate Support (Up to 3 Links)

## UI Changes — `BlogPostCreator.tsx`

Replace the single affiliate block with a dynamic list:

- State becomes `affiliates: Array<{ url: string; brand: string; anchor: string }>` (starts with 1 empty row)
- "Affiliate Links (optional, up to 3)" section header
- Each row shows: URL field (full width) + Brand + Anchor (side by side) + small "Remove" button
- "+ Add another product" button appears below if fewer than 3 rows exist
- Filter out empty rows (no URL) before sending to the edge function

## Edge Function Changes — `generate-blog-post/index.ts`

- Accept `affiliates: Array<{url, brand, anchor}>` (keep backward compatibility with old single-field payload)
- Build a numbered product list in the AI prompt:
  > "You have 3 affiliate products to weave in: 1) EPICKA Adapter, 2) Anker Power Bank, 3) Bose Headphones. Mention each product 2-3 times naturally. Treat them as comparison or companion recommendations where it fits the article."
- Each product gets 2-3 markdown links (down from 2-4) so total link count stays reasonable
- Fallback injector loops over each affiliate — if any product has zero links after generation, inject one for that specific product into a different paragraph
- Validation regex runs per-product URL

## What You'll Be Able To Do

- **Comparison articles**: "Best Travel Adapters: EPICKA vs Anker vs Belkin" — each gets its own clickable links
- **Companion bundles**: "What to Pack for Long Flights" with firestick, headphones, and power bank all linked
- **Single product**: still works exactly as it does today — just leave slots 2 and 3 blank

## Files Touched

| File | Change |
|---|---|
| `src/components/dashboard/BlogPostCreator.tsx` | Replace single affiliate block with dynamic 1-3 row list |
| `supabase/functions/generate-blog-post/index.ts` | Accept affiliates array, build numbered prompt, per-product fallback |

No database changes. No schema changes. Backward compatible with existing single-affiliate calls.


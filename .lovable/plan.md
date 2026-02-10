

## Restore Tabs on the Gear Page

The Gear page previously had two tabs letting you switch between the AI-powered packing list and your curated gear reviews. Those tabs disappeared, leaving only the AI search view. Here's how to bring them back:

### What Changes

**File: `src/pages/Gear.tsx`**

1. Import the `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` components
2. Import the curated gear reviews data (`gearReviews` from `src/data/gearReviews.ts`) and related icons
3. Wrap the content area (below the hero) in a `Tabs` component with two tabs:
   - **"AI Packing List"** -- contains the current search results, loading states, and empty state
   - **"Our Gear Reviews"** -- displays the 7 curated, personally-tested gear reviews as cards (adapter, packing cubes, phone holder, water hammock, Thermacell, shoe organizer, Liquid IV) with ratings, Amazon links, and full review details
4. Each curated gear card will show the product image, rating stars, brand, name, excerpt, "Tested on" info, and an Amazon link button -- matching the existing card style used on the homepage carousel

### Technical Details

| Item | Detail |
|------|--------|
| File modified | `src/pages/Gear.tsx` |
| New imports | `Tabs, TabsList, TabsTrigger, TabsContent` from ui/tabs; `gearReviews` from data; `MessageCircle` icon |
| Tab default | "AI Packing List" tab selected by default |
| Tab placement | Centered below the hero section, above the content area |
| Curated reviews layout | 3-column grid on desktop, 2 on tablet, 1 on mobile |
| No new files | Everything fits in the existing page file |


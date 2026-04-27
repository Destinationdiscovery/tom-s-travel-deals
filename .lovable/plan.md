# Make Tool Cards Clickable + Add Indexable AEO Content to Each Tool Page

## Goal
Every tool card on the homepage should be a single clickable link, and every tool page should ship with pre-rendered, answer-engine-style content (an intro question, what the tool does, and 3 real worked examples) so Google and AI crawlers index a substantive page even without running a query.

All 8 tool pages and routes already exist (`/destinations`, `/best-time`, `/itinerary`, `/flights`, `/gear`, `/currency`, `/safety`, `/travel-intel`). No new routing required.

## Part 1: Clickable Tool Cards

Edit `src/components/ToolsDirectorySection.tsx`:
- Wrap each `<article>` in a `<Link to={tool.href}>` so the entire card is one click target.
- Remove the redundant "Try this tool →" link (or keep as a styled label inside the card, not a separate link).
- Add hover lift (`hover:-translate-y-0.5`, `hover:border-primary/40`) and `cursor-pointer` for affordance.

## Part 2: AEO Content Block Component

Create one reusable component `src/components/tools/ToolAEOContent.tsx` that renders:
- **H2 conversational hook** (e.g. "Want to know the best time of year to visit Japan?")
- **Short paragraph** explaining what the tool does and how to use it (1 to 2 sentences, brand voice).
- **3 pre-written example answers** as expandable / always-visible cards. Each example has: question (H3), short summary answer (2 to 3 sentences with concrete data points), and a CTA link that pre-fills the tool (e.g. `/best-time?q=Japan`).
- **FAQ accordion** with 3 to 4 common questions per tool (uses existing `Accordion` from `ui/accordion.tsx`).
- **JSON-LD `FAQPage` schema** injected via `react-helmet-async` for AEO citations.

Props: `{ hookQuestion, intro, examples: [{question, answer, ctaQuery}], faqs: [{q, a}], toolPath }`.

The block renders BELOW the hero search and ABOVE the empty state on each tool page, and stays visible (does not unmount) when results load — so the page always has indexable content.

## Part 3: Per-Tool Content (8 pages)

For each page below, import `ToolAEOContent` and pass tool-specific copy. Content focuses on the questions already shown on the homepage card to keep messaging consistent.

1. **Best Time** (`/best-time`) — Examples: Japan (cherry blossoms Mar to early Apr), Bali (Apr to Oct dry season, cheapest Feb), Costa Rica (rainy May to Nov, dry Dec to Apr).
2. **Itinerary Builder** (`/itinerary`) — Examples: 5-day Tokyo budget, Romantic Paris weekend, 7-day Bali adventure.
3. **Flight Deals** (`/flights`) — Examples: NYC to London cheapest months, Toronto to Cancun deals, Hawaii cheapest season.
4. **Trip Packing** (`/gear`) — Examples: Cancun beach, Japan winter, Europe backpacking.
5. **Currency** (`/currency`) — Examples: USD to MXN, 100 EUR to JPY, Thailand exchange tips.
6. **Safety Scores** (`/safety`) — Examples: Mexico City safety, common Paris scams, Bali health tips.
7. **Travel Intel / Visa** (`/travel-intel`) — Examples: Canadians to Cuba visa, Thailand 2026 advisory, Japan entry rules.
8. **Hotel Reviews** (`/destinations`) — Examples: Cancun all-inclusives, Atlantis The Royal verdict, Orlando family hotels. (Links go to `/reviews/:query` since that is the answer flow.)

Each example answer is 2 to 3 sentences of real, evergreen info written in brand voice (no em-dashes per project rule).

## Part 4: Per-Page SEO Updates

For each tool page, update the existing `<SEOHead>`:
- Sharper, question-style `title` (e.g. "Best Time to Visit Any Country | Free Tool by ReviewThenGo").
- `description` mirrors the H2 hook so it matches what bots see in the body.
- `keywords` already present, leave intact.

The `ToolAEOContent` component handles the `FAQPage` JSON-LD via Helmet so it stacks cleanly with existing schemas.

## Files Touched
- `src/components/ToolsDirectorySection.tsx` (clickable cards)
- `src/components/tools/ToolAEOContent.tsx` (new)
- `src/pages/BestTime.tsx`, `Itinerary.tsx`, `Flights.tsx`, `Gear.tsx`, `Currency.tsx`, `Safety.tsx`, `TravelIntel.tsx`, `Destinations.tsx` (insert content block + tighten SEO meta)

## Out of Scope
- No new routes, no edge function changes, no DB changes.
- The existing crawler feed (`articles-feed`) covers blog posts only; tool pages are crawlable directly via the SPA + sitemap, and the new on-page AEO content is what bots will index.

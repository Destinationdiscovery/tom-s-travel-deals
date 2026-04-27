# Make AEO Example Cards Fully Clickable

## Goal
On every tool page, the three "Real answers from this tool" example cards should be fully clickable (entire card opens the prefilled tool page in a new view), not just the small "Get the full answer" link at the bottom.

## Change
Edit `src/components/tools/ToolAEOContent.tsx`:
- Replace the `<article>` wrapper with a `<Link to={href}>` so the whole card is one click target.
- Move the existing CTA link into a `<span>` inside the card (kept for visual affordance).
- Add hover lift (`hover:-translate-y-0.5`), border glow, title color shift on hover, and `cursor-pointer` for clear affordance.
- Add `aria-label` on the Link for screen-reader clarity.

This automatically applies to all 8 tool pages since they share the same component. No other files change.

## Notes
- Default behavior is in-page navigation (consistent with the rest of the site). Users can still cmd/ctrl-click to open in a new tab.
- The FAQ accordion below stays as-is (accordions need to expand in place, not navigate).

Plan to make the example cards actually run each tool

1. Make every "Real answers from this tool" card act like a tool starter
- Keep the existing card layout, but make the destination query reliable.
- When clicked, each card will route to the relevant tool page with the card's example query in the URL.
- The target tool page will immediately populate the input and run the backend function.

2. Fix tools that do not currently auto-run from card clicks
- Safety Scores: add support for `?q=` so cards like "Common scams in Paris?" start the Safety tool automatically.
- Know Before You Go: add better card routing by including the correct tab/type in the URL, then auto-run the right tab where possible.
- Best Time, Itinerary, Gear, Flights, and Currency already have partial `?q=` handling, but I will normalize it so clicks consistently launch the tool and display results.

3. Improve the shared card component behavior
- Update `ToolAEOContent` so it can optionally add extra query parameters, such as `type=advisories` for Know Before You Go.
- Preserve the current SEO-friendly links and card styling.
- Ensure cards are accessible keyboard-clickable links, not dead visual cards.

4. Map Know Before You Go examples to the right tool mode
- "Do Canadians need a visa for Cuba?" should open the Requirements tab, prefill destination Cuba, and use Canada as citizenship so it can run immediately.
- "Thailand travel advisory 2026?" should open the Advisories tab and run Thailand.
- "Japan entry rules for tourists?" should open Requirements or destination-focused entry rules with a default citizenship so it can produce an answer instead of just filling one field.

5. Validation after implementation
- Test each visible card set: Gear, Best Time, Itinerary, Currency, Flights, Safety, Know Before You Go, and destination review cards.
- Confirm each card click either starts the tool and shows loading/results, or navigates to the appropriate review answer page.
- Check browser console and edge function responses for errors.

Technical details
- Files likely to change:
  - `src/components/tools/ToolAEOContent.tsx`
  - `src/components/tools/toolAEOContent.ts`
  - `src/pages/Safety.tsx`
  - `src/pages/TravelIntel.tsx`
  - Possibly small cleanup in `src/pages/Currency.tsx` and `src/pages/Flights.tsx` to replace the current `useState(() => ...)` auto-run pattern with `useEffect`.
- No database changes are required.
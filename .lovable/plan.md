
# Populate Search Bar on Card Click (No Auto-Search)

## Overview

When a user clicks a category card (Entry Requirements, Safety Advisories, Travel News) in the Travel Intel section on the homepage, the search bar should only be populated with the example query text -- not automatically execute the search. The user can then review/edit the query and click "Get Intel" themselves.

## Changes

### File: `src/components/IntelPreviewSection.tsx`

Update the `handleCardClick` function to only set the query text without calling `doSearch`:

- **Current behavior**: Clicking a card sets the query AND immediately triggers the search
- **New behavior**: Clicking a card only sets the query in the search input, letting the user initiate the search manually

The updated function will simply call `setQuery(card.query)` for all card types, removing the `doSearch()` calls and the citizenship prompt trigger. The user can then click "Get Intel" or press Enter to run the search.

## Technical Details

Replace the `handleCardClick` function body (lines 63-77) with:

```typescript
const handleCardClick = (card: typeof intelCards[0]) => {
  setQuery(card.query);
};
```

This removes:
- The automatic `doSearch()` calls for advisories and news cards
- The automatic requirements search and citizenship prompt for requirements cards

The existing `handleSearch` function (triggered by the "Get Intel" button or Enter key) already handles parsing "X to Y" patterns and citizenship prompts correctly, so no other changes are needed.

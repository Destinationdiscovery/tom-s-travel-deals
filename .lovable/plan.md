
# Replace Single Search Bar with Tabbed Inputs on Homepage Travel Intel

## What Changes

Replace the current single generic search bar in the homepage Travel Intel section with the same tabbed search interface used on the full Travel Intel page. Each tab shows the correct input fields with proper placeholder examples.

## How It Works

- **Three tabs**: Requirements, Advisories, News (matching the full Travel Intel page)
- **Requirements tab**: Two inputs -- "Your citizenship (e.g., Canada)" and "Destination (e.g., Cuba)" with a "Check" button
- **Advisories tab**: Single input -- "Destination (e.g., Cuba)" with a "Check" button
- **News tab**: Single input -- "Destination (e.g., Cuba)" with a "Get News" button
- **Clicking a category card**: Switches to the corresponding tab (no auto-search)
- Results still display below the tabs as they do now

## Technical Details

### File: `src/components/IntelPreviewSection.tsx`

- Remove the single `query` search bar and the generic `handleSearch` function
- Remove `citizenshipPrompt`, `citizenship`, `pendingDest` state (no longer needed since Requirements tab has its own citizenship field)
- Add `activeTab` state and per-tab input states: `reqCitizenship`, `reqDestination`, `advDestination`, `newsDestination`
- Import `Tabs, TabsContent, TabsList, TabsTrigger` from UI components and `FileText, Loader2` from lucide-react
- Add a `handleSubmit(type)` function matching the full page logic
- Update `handleCardClick` to set `activeTab` to the card's type
- Replace the search bar section with the `Tabs` component containing three `TabsContent` blocks, each with the appropriate inputs (copied from the full Travel Intel page pattern)
- Keep the category cards, results display, and error handling as-is

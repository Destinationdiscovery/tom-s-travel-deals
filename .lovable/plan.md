
# Enhanced Quote Builder with Resort Review, Multi-Select Inclusions, and Client Files

## What Changes

Three major enhancements to the Quote Builder:

1. **"Include Review?" toggle at quote start** -- When you begin a new quote and select/search a resort, you get asked "Include resort review in this quote?" If yes, the full AI review (ratings, summary, traveler comments, tips -- no affiliate links) is embedded in the quote preview and public quote page, appearing before the flight/pricing details.

2. **Multi-select dropdowns for form fields** -- Inclusions, room type, and other fields that benefit from multiple selections become tag-based multi-select inputs. You can pick from preset options (e.g. "All-Inclusive", "Airport Transfers", "Travel Insurance", "Spa Package") and also type custom ones.

3. **Client file system** -- Quotes are grouped by client. The first quote for a new client auto-creates a "client file." The Recent Quotes list becomes a client-focused view showing client names with their quote count. Clicking a client expands to show all their quotes. This uses the existing `client_quotes` table grouped by `client_name`/`client_email` -- no new tables needed.

## How It Works

### Include Review Flow
- Step 1 (Resort Selection) gains a checkbox: "Include resort review in quote"
- When checked and a resort is selected, the full `review_data` JSON is stored alongside the quote in a new `review_data` JSONB column on `client_quotes`
- The QuotePreview and PublicQuote pages render the review first (property name, rating stars, summary, rating breakdown, traveler paragraphs, tips) followed by flight details and pricing
- Affiliate links (AffiliateLinks, InlineAffiliateCTA) are excluded from the quote version
- When unchecked, quotes work exactly as they do now

### Multi-Select Inclusions
- Replace the single "Inclusions" text input with a tag-based multi-select
- Preset options: "All-Inclusive", "Airport Transfers", "Travel Insurance", "Spa Package", "Kids Club", "Room Upgrade", "Late Check-Out", "Excursions"
- You can type a custom inclusion and press Enter to add it
- Tags display as removable chips
- Same pattern available for Room Type if desired
- Stored as a string array in the quote's JSONB or as comma-separated in the existing fields

### Client File Grouping
- The "Recent Quotes" section on Step 1 is reorganized: quotes are grouped by client name
- Each client row shows: name, email, number of quotes, most recent quote date
- Clicking a client expands to show all their quotes for that client
- Creating a new quote for an existing client name automatically files it under that client
- No new database table -- this is purely a UI grouping of existing `client_quotes` data

## Technical Details

### Database Migration
Add one new column to `client_quotes`:

```text
ALTER TABLE client_quotes
  ADD COLUMN include_review boolean DEFAULT false,
  ADD COLUMN review_data jsonb DEFAULT null;
```

This stores the full review data with the quote so the public quote page can render it without needing to look up cached_reviews.

### File Changes

**`src/components/dashboard/QuoteBuilder.tsx`**
- Add `includeReview: boolean` and `reviewData: ReviewData | null` to QuoteData interface
- Add checkbox "Include resort review in this quote?" on Step 1
- When selecting a resort with include_review=true, fetch and store the full review_data from cached_reviews
- Replace inclusions text input with a multi-tag input component (preset options + custom entry)
- Save `include_review` and `review_data` to the database payload
- Group existing quotes by client in the Recent Quotes panel (accordion-style: client name -> list of their quotes)

**`src/components/dashboard/QuotePreview.tsx`**
- When `quote.includeReview` is true and `quote.reviewData` exists, render the resort review section first:
  - Property name, star rating, "Compiled from Real Traveler Reviews" badge
  - Summary paragraph
  - Rating breakdown bars
  - "What Travelers Say" paragraphs
  - Travel tips
  - Best For tags
  - No affiliate links, no save button, no "search another" button
- Then render the existing vacation details, flights, and pricing below

**`src/pages/PublicQuote.tsx`**
- Read `include_review` and `review_data` from the fetched quote
- When present, render the same review section (matching the preview) before flights and pricing
- Clean, professional presentation for the client

**New: `src/components/dashboard/MultiTagInput.tsx`**
- Reusable component: displays preset options as a dropdown, selected items as removable chips
- Props: `presets: string[]`, `value: string[]`, `onChange: (tags: string[]) => void`, `placeholder: string`
- Supports typing custom values and pressing Enter to add
- Used for Inclusions (and optionally Room Type)

### Quote Preview Layout (with review included)

```text
+----------------------------------+
| Vacation Quote                   |
| Prepared for [Client]    RTG logo|
+----------------------------------+
| [Resort Name]                    |
| [Location]                       |
| *** 4.2 - Compiled from Reviews |
| [Summary paragraph]             |
|                                  |
| Rating Breakdown                 |
|  Rooms        ====== 4.5        |
|  Service      ===== 4.0         |
|  Food         ====== 4.3        |
|                                  |
| What Travelers Say               |
| [paragraphs...]                  |
|                                  |
| Travel Tips                      |
| 1. [tip]  2. [tip]              |
|                                  |
| Best For: Couples, Beach, ...    |
+----------------------------------+
| Flight Details                   |
|  WestJet WS1234  YYZ -> CUN     |
+----------------------------------+
| Pricing Breakdown                |
|  Hotel         $3,200            |
|  Flights       $1,800            |
|  Total     CAD $5,000            |
+----------------------------------+
| Inclusions: All-Inclusive,       |
|   Airport Transfers, Spa Package |
+----------------------------------+
| Notes: ...                       |
+----------------------------------+
```

### Client File UI (Step 1)

```text
Recent Clients
+-- John Smith (3 quotes) --------+
|   > Barcelo Maya - Draft  Feb 15|
|   > Sandals Jamaica - Sent Feb 1|
|   > Riu Cancun - Accepted Jan 20|
+-- Sarah Lee (1 quote) ----------+
|   > Bellagio LV - Draft  Feb 18 |
+---------------------------------+
```

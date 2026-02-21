

# Attach Documents and Additional Line Item Types in Quote Builder

## Overview

Two enhancements to the Quote Builder's Pricing section (Step 3):

1. **Attach Document** -- Upload a full quote PDF or image to the quote record, stored in the existing `booking-documents` bucket
2. **Line Item Categories** -- Add a type/category selector to each line item so you can clearly label things as Hotel, Transfer, Excursion, Insurance, etc.

## Changes

### File: `src/components/dashboard/QuoteBuilder.tsx`

**1. Update LineItem interface to include a category field**

```typescript
interface LineItem {
  description: string;
  amount: number;
  category?: string;
}
```

Categories available via a dropdown: Hotel, Transfer, Excursion, Insurance, Flights, Car Rental, Other.

**2. Add attachment state and upload handler**

- New state: `attachmentUrl` (string), `uploading` (boolean)
- Upload handler uploads to `booking-documents` bucket under a `quotes/` prefix
- The URL is stored on the quote record in a new `attachment_url` column

**3. Update the Pricing section UI (Step 3)**

- Each line item row gets a small category `Select` dropdown before the description input
- Below the line items, add an "Attach Document" area with a file input (accepts PDF, images)
- Show the attached file name with a remove button if one is already attached

**4. Save/load the attachment URL and line item categories**

- `handleSave` includes `attachment_url` in the payload
- `loadQuote` restores `attachmentUrl` from the saved record
- Line item categories are already stored in the `line_items` JSONB column, no schema change needed for that

### Database Migration

Add an `attachment_url` column to `client_quotes`:

```sql
ALTER TABLE public.client_quotes ADD COLUMN IF NOT EXISTS attachment_url text;
```

### File: `src/components/dashboard/QuotePreview.tsx`

- Show attached document as a download link in the preview
- Show line item categories in the pricing breakdown if present

## Technical Details

### Line Item Category Dropdown

Each line item row will have a compact category selector:

```
[Hotel v] [Sonya Hotel 3 rooms___________] [$___]  [x]
[Transfer v] [Airport roundtrip___________] [$___]  [x]
[Excursion v] [Snorkeling tour____________] [$___]  [x]
```

Categories: Hotel, Transfer, Excursion, Insurance, Flights, Car Rental, Spa, Other

### Attach Document Section

Below the line items total, a bordered area:

```
Attach Document
[Choose File] quote-document.pdf  [x Remove]
```

- Uploads to `booking-documents/quotes/{quoteId || timestamp}-{filename}`
- Accepts: PDF, JPG, PNG, WEBP
- Max display: shows filename with a link to view/download

### QuoteData Interface Update

Add `attachmentUrl?: string` to the `QuoteData` interface so it flows through to preview and save/load.


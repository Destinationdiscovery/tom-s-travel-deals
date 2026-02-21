

# Support Multiple Document Attachments in Quote Builder

## Overview

Convert the single-document attachment feature to support multiple documents per quote. The current `attachment_url` (text) column will be migrated to `attachment_urls` (text array).

## Changes

### Database Migration

Migrate the column from single text to text array, preserving existing data:

```sql
ALTER TABLE public.client_quotes ADD COLUMN IF NOT EXISTS attachment_urls text[];
UPDATE public.client_quotes SET attachment_urls = ARRAY[attachment_url] WHERE attachment_url IS NOT NULL AND attachment_url != '';
ALTER TABLE public.client_quotes DROP COLUMN IF EXISTS attachment_url;
```

### File: `src/components/dashboard/QuoteBuilder.tsx`

1. **State change**: Replace `attachmentUrl` (string) with `attachmentUrls` (string array) and keep `uploading` boolean.

2. **Upload handler**: On file select, upload to storage and append the new path to the `attachmentUrls` array (instead of replacing).

3. **Attach Document UI**: Show a list of all attached files, each with a view link and remove (X) button. The "Choose File" button is always visible below the list so you can keep adding more.

4. **Save/load**: Write `attachment_urls` (the array) to the database. On load, restore the array.

5. **QuoteData interface**: Change `attachmentUrl?: string` to `attachmentUrls?: string[]`.

6. **Reset**: Clear to empty array on new quote.

### File: `src/components/dashboard/QuotePreview.tsx`

1. Replace `quote.attachmentUrl` single-document rendering with a loop over `quote.attachmentUrls`, showing each as a clickable download link with a paperclip icon.

## Technical Details

### Attach Document Section (updated layout)

```
Attach Document
  [paperclip] hotel-quote.pdf         [x]
  [paperclip] transfer-invoice.pdf    [x]
  [Choose File]
  PDF, JPG, PNG, or WEBP
```

- Each uploaded file gets its own row with view/remove
- "Choose File" always visible for adding more
- Upload path: `quotes/{quoteId|timestamp}-{filename}`

### Data Flow

- Builder state: `attachmentUrls: string[]`
- Database column: `attachment_urls text[]`
- Preview receives the array via `QuoteData.attachmentUrls`

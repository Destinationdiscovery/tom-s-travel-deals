

# Professional Quote Output Overhaul

## Problems Identified

1. **"Quote Builder" header, step tabs, and "New Quote" button** all appear in the preview and get printed in PDFs
2. **Duplicate resort name** -- the quote card shows "Hotel Sonya / Rome, Italy" and then the embedded review repeats "Hotel Sonya / Rome, Italy" again right below
3. **No print styles** -- the site header, sidebar, and other UI chrome all appear in the PDF; text gets cut off across pages
4. **Email is plain text** -- when sent via "Send Direct" (Resend) or opened in Outlook/Gmail, the email is just flat text with no formatting

---

## Solution

### 1. Hide builder chrome in preview (QuoteBuilder.tsx)

When `step === 4`, hide:
- The "Quote Builder" / "Create professional vacation quotes" header block
- The step indicator tabs (1. Resort, 2. Details, etc.)
- The "New Quote" button

These elements will get a conditional render so they only show when `step !== 4`.

### 2. Remove duplicate resort name (QuoteReviewSection.tsx)

Add an optional `hideHeader` prop to `QuoteReviewSection`. When `true`, the big property name and location header at the top of the review section is skipped (since QuotePreview already shows it). Both `QuotePreview.tsx` and `PublicQuote.tsx` will pass `hideHeader={true}`.

### 3. Add print styles (index.css + component classes)

Add a `@media print` block to `index.css` that:
- Hides the site `header` (fixed nav bar)
- Hides all elements with `print:hidden` (action buttons already have this)
- Sets white background, removes shadows/borders for clean output
- Adds proper page-break rules: `break-inside: avoid` on cards and sections so content doesn't get sliced mid-element
- Forces the quote preview to full-width with no padding from the layout

Also add `print:hidden` to the Header component in `GearAdmin.tsx`.

### 4. HTML email for "Send Direct" (send-email edge function + QuotePreview.tsx)

**QuotePreview.tsx**: Build an `html` string version of the quote (inline-styled HTML table layout) containing:
- Branded header with ReviewThenGo colors
- Resort name, destination, dates, travellers
- Pricing table with line items and total
- Inclusions as styled badges
- Notes
- "View Full Quote" button linking to the share URL
- Agent contact footer

Pass this `html` field alongside `text` to the edge function.

**send-email/index.ts**: Accept an optional `html` parameter and pass it to Resend's API as the `html` field. This makes the email render beautifully in all clients.

The mailto/Gmail/Yahoo links will keep using plain text (that's a browser limitation), but they'll include the share URL prominently so clients click through to the polished web version.

---

## Technical Details

### Files modified

- **`src/components/dashboard/QuoteBuilder.tsx`** -- Wrap header/steps in `{step !== 4 && (...)}`
- **`src/components/dashboard/QuoteReviewSection.tsx`** -- Add `hideHeader?: boolean` prop, conditionally skip the property name/location header block
- **`src/components/dashboard/QuotePreview.tsx`** -- Pass `hideHeader` to `QuoteReviewSection`; build HTML email body string; pass `html` to send-email
- **`src/pages/PublicQuote.tsx`** -- Pass `hideHeader` to `QuoteReviewSection`
- **`src/pages/GearAdmin.tsx`** -- Add `print:hidden` to the Header wrapper
- **`src/index.css`** -- Add `@media print` rules for clean PDF output
- **`supabase/functions/send-email/index.ts`** -- Accept and forward `html` field to Resend API

### No new dependencies needed


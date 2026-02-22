

# Add Email Button to Quote Preview

## Problem

The "Send Email" dropdown button in the Quote Preview only appears when a client email address has been entered. If the email field was left blank, the button is completely hidden -- which is what's happening in your case.

## Solution

Make the "Send Email" dropdown always visible in the Quote Preview action bar (alongside Back, Save, Print/PDF, and Copy Link). When no client email is on file, the email providers (Outlook, Gmail, Yahoo) will open with an empty "to" field so you can type it in manually. The "Send Direct" option will show a toast asking you to add an email first.

## Technical Details

### File: `src/components/dashboard/QuotePreview.tsx`

- Remove the `{quote.clientEmail && (...)}` conditional wrapper around the email `DropdownMenu`
- The button will always render in the action bar
- mailto/Gmail/Yahoo links already work fine with an empty "to" -- the compose window just opens without a pre-filled recipient
- The `sendDirect` function already has a guard that toasts "Client email is required" if missing

This is a one-line change: removing the conditional wrapper.


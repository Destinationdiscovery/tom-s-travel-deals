

# Email Quote with Provider Choice

## Overview

Replace the single "Send via Outlook" button in the Quote Preview with a dropdown that lets you choose your email provider (Outlook, Gmail, Yahoo, or send directly via Resend API).

## What You'll See

The current "Send via Outlook" button will become a split action:

- **Send Email** (primary button) -- Opens a dropdown with provider choices:
  - **Outlook** -- Opens Outlook mailto link (current behavior)
  - **Gmail** -- Opens Gmail compose window in browser
  - **Yahoo Mail** -- Opens Yahoo compose window in browser
  - **Send Direct** -- Sends via the existing Resend API integration (no email client needed)

Each option pre-fills the recipient, subject, and body with the quote details and share link, just like the current Outlook button does.

## Technical Details

### File: `src/components/dashboard/QuotePreview.tsx`

1. Replace the "Send via Outlook" `Button` with a `DropdownMenu` containing the four provider options.

2. Add provider-specific compose URL builders:
   - **Outlook**: `mailto:` link (existing logic)
   - **Gmail**: `https://mail.google.com/mail/?view=cm&to=...&su=...&body=...`
   - **Yahoo**: `https://compose.mail.yahoo.com/?to=...&subject=...&body=...`
   - **Resend**: Calls the existing `send-email` edge function with the quote template, same as the Email Composer does

3. For the Resend "Send Direct" option, add a loading state and toast feedback on success/failure.

4. Import `DropdownMenu` components from the existing UI library.

### No database or backend changes required -- this uses the existing `send-email` edge function and email templates.


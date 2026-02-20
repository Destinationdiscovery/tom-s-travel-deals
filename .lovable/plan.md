
# Send Emails Directly via Resend API

## Overview
Replace the current "Send via Outlook" (mailto link) approach with direct email sending through Resend's REST API. Emails will be sent from your Resend-verified domain via a backend function.

## Steps

### 1. Store Your Resend API Key
- Securely store your Resend API key as a backend secret called `RESEND_API_KEY`
- You'll be prompted to paste it in during implementation

### 2. Create a Backend Function (`send-email`)
- New backend function that receives `to`, `subject`, `body`, and `from` fields
- Calls Resend's REST API (`https://api.resend.com/emails`) to send the email
- Returns success/error status
- The "from" address will use your verified domain (e.g., `you@mail.travelonly.com`)

### 3. Update the Email Composer
- Add a **"Send Email"** button alongside the existing "Send via Outlook" button (keeping Outlook as a fallback)
- Clicking "Send Email" calls the backend function directly
- Shows loading state while sending
- On success: logs the email and shows a confirmation
- On failure: shows error message with details
- Add a "From" email field so you can customize the sender address

## Technical Details

**Backend function (`send-email`):**
- Endpoint: Resend REST API `POST https://api.resend.com/emails`
- Headers: `Authorization: Bearer RESEND_API_KEY`
- Body: `{ from, to, subject, text }`
- JWT verification disabled (matches existing function patterns)

**EmailComposer changes:**
- New `from` state field defaulting to `info@mail.travelonly.com`
- New `isSending` loading state
- New `handleSendViaResend` function that invokes the edge function
- Both send buttons available: "Send via Resend" (primary) and "Send via Outlook" (secondary)
- Email log updated with a `sent_via` indicator

**Config update:**
- Add `[functions.send-email]` with `verify_jwt = false` to config

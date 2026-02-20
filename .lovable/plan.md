

# Update Resend API Key

## Overview
Replace the existing `RESEND_API_KEY` secret with the new key from your Resend account registered under `tlaracy@travelonly.com`.

## Steps

### 1. Update the RESEND_API_KEY secret
- Replace the current API key with your new one
- You'll be prompted to paste it in

### 2. Test the integration
- Send a test email to `tlaracy@travelonly.com` using `onboarding@resend.dev` as the sender
- Verify delivery

No code changes are needed -- the existing edge function and email composer will work with the new key automatically.


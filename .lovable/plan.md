

# Plan: Streamlined "Attach & Generate" Quote Builder

## What You Want
A simplified workflow: attach 4-5 screenshots of pricing/flights/resort info, type the client's name, hit generate, and get a professional branded quote ready to PDF/email. No manual data entry needed.

## Current State
The AI Quote Assistant already supports attachments + prompt, but requires a text prompt and buries the client name inside the generated output. The agent branding is hardcoded in the preview but not passed to the AI for inclusion in the quote narrative.

## Changes

### 1. Streamline the AI Generate UI (`QuoteBuilder.tsx`)
- Add a dedicated **Client Name** input field (required) and optional **Client Email** field at the top of the generate mode
- Allow **multiple file uploads at once** (change `<input>` to `multiple`)
- Make the prompt textarea **optional** with updated placeholder: "Optional: add any extra context (e.g. 'couple trip, wants ocean view')..."
- If no prompt text is provided but attachments exist, auto-generate a prompt like "Build a quote for [client name] using the attached documents"

### 2. Update `generate-quote` edge function
- Accept `clientName` in the request body and inject it into the AI prompt so the output always has the correct client name
- Add agent branding context to the system prompt (Tom Laracy, TravelOnly, tlaracy@travelonly.com) so the AI's `notes` field can include a professional sign-off
- Add a `summary` field to the tool schema -- a 2-3 sentence professional introduction paragraph (like the Grok example: "Thank you for considering us...")
- Make `prompt` optional when `attachmentPaths` has items

### 3. Add summary to QuotePreview (`QuotePreview.tsx`)
- Display the AI-generated `summary` paragraph between the header and trip details, giving the quote that personal touch from the Grok example

### 4. Add summary field to QuoteData interface and save/load flow
- Add `summary` to the `QuoteData` interface
- Store it in the `client_quotes` table (new `summary` text column via migration)
- Include it in save/load/public quote rendering

## Files Changed

| File | Change |
|------|--------|
| Migration SQL | Add `summary` text column to `client_quotes` |
| `supabase/functions/generate-quote/index.ts` | Accept `clientName`, make prompt optional, add `summary` to tool schema, inject agent branding |
| `src/components/dashboard/QuoteBuilder.tsx` | Add client name/email fields to generate mode, multi-file upload, optional prompt |
| `src/components/dashboard/QuotePreview.tsx` | Render summary paragraph |
| `src/pages/PublicQuote.tsx` | Render summary paragraph on public view |


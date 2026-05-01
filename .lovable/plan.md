## Problem

The Quote Builder is still failing inside the `generate-quote` backend function. The recent logs show the same root cause: the AI is returning a long markdown quote inside JSON, but the JSON is sometimes malformed. The current repair logic still gives up and returns the edge function error.

## Plan

1. Make quote generation resilient by removing the fragile AI JSON wrapper for the long document.
   - Update `supabase/functions/generate-quote/index.ts` so the AI returns the quote as plain markdown instead of embedding the entire quote inside a JSON string.
   - This avoids the exact failure shown in the logs, where apostrophes, quotes, newlines, tables, and long markdown content break JSON parsing.

2. Generate metadata separately and safely.
   - After the markdown is created, run a second small AI call that extracts only structured metadata: client name, email, resort name, destination, price, currency, dates, and traveller count.
   - Keep this JSON small so parsing is much more reliable.
   - Add fallback metadata from the prompt and client fields if the extraction fails, so the quote still opens in preview instead of failing completely.

3. Add final content cleanup before returning the quote.
   - Strip any accidental `quote valid until`, `valid until`, `expires on`, or similar expiry-date lines from generated markdown.
   - Keep warnings such as prices and availability are subject to change until booked.
   - Keep the existing Google Places photo injection, but apply it after the markdown is safely generated.

4. Improve error handling shown to the Quote Builder.
   - If research or metadata extraction fails, continue with the quote wherever possible.
   - Only fail when the main markdown generation itself cannot return content.
   - Return clearer error messages with CORS headers so the UI displays the real issue instead of a generic edge code error.

5. Clean up the misleading manual field.
   - Remove the `Valid Until` input from the manual quote builder form so it does not confuse you while building quotes.
   - Keep the database column untouched for compatibility, but do not show it or use it in generated quote content.

## Files to update

- `supabase/functions/generate-quote/index.ts`
- `src/components/dashboard/QuoteBuilder.tsx`

## Expected result

Quote generation should stop failing with malformed JSON errors, AI-generated quotes should open in preview, expiry-date language should stay out of the quote, and you will still be able to edit the quote before sending it.
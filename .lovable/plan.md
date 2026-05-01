## Problem

The Quote Builder fails with "Edge Function returned a non-2xx status code". Edge function logs show:

```
generate-quote error: SyntaxError: Expected ',' or '}' after property value in JSON at position 3849
```

Gemini is returning malformed JSON (likely unescaped quotes/newlines inside the `markdown` string field, which is large), and the bare `JSON.parse(cleaned)` on line 250 crashes.

## Fix

Update `supabase/functions/generate-quote/index.ts`:

1. **Force structured JSON output** by adding `response_format: { type: "json_object" }` to the AI gateway request body. This dramatically reduces malformed output from Gemini.

2. **Add a defensive JSON repair + parse helper** (same pattern already used in `travel-search` and `generate-review` per project memory):
   - Strip markdown code fences (already done).
   - Extract substring between first `{` and last `}` to drop any prose preamble.
   - Try `JSON.parse`; on failure, run light repairs: remove trailing commas before `}`/`]`, escape stray control characters (raw `\n`, `\r`, `\t`, unescaped quotes inside string values are the usual culprits in long markdown blobs).
   - Try parse again; if still failing, log the first 500 chars of the offending payload and return a friendly 502 error so the UI shows a real message instead of a generic non-2xx.

3. **Better client-visible error**: when parsing ultimately fails, return `{ error: "The AI returned an invalid response. Please try generating the quote again." }` with status 502 + CORS headers, so the toast in Quote Builder shows actionable text instead of "Function returned a non-2xx status code".

No other files change. No DB or config changes needed.

## Files

- `supabase/functions/generate-quote/index.ts` — add `response_format`, replace the single `JSON.parse` call with a `safeParseAIJson()` helper, return a friendly 502 on unrecoverable parse errors.

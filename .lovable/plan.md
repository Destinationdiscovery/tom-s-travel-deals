

# Fix FAQ Items Not Appearing After Blog Post Regeneration

## Root Cause Analysis

The edge function successfully generates articles (confirmed in logs), and the code correctly saves `faq_items` to the database. The schema fix was just deployed. Two remaining issues:

1. **No em-dash cleanup on FAQ answers** — the `cleanEmDashes` post-processing only runs on `title`, `excerpt`, and `blocks`, but NOT on `faq_items`. This means FAQ answers could contain em-dashes, but more importantly, this inconsistency suggests FAQs may need explicit post-processing validation.

2. **No debug logging** — when regeneration appears to succeed but FAQs are missing, there's no way to verify the AI actually returned them. Adding a log of the FAQ count will confirm the data flow.

3. **Silent data loss possibility** — if the AI returns `faq_items` as `undefined` (unlikely with `required` in schema, but possible if the tool call parsing strips it), the `|| []` fallback saves an empty array, which looks like "no FAQs."

## Fix

### `supabase/functions/generate-blog-post/index.ts`
- Add em-dash cleanup to `faq_items` answers
- Add a log line: `"FAQ items: N, Internal links: N"` after parsing
- Clean FAQ answers for em-dashes just like blocks

### `src/components/dashboard/BlogPostCreator.tsx`
- Add `console.log` of the regeneration response data (faq count, internal link count) so we can debug in browser console
- After successful regeneration, show FAQ count in the success toast message so the user has immediate confirmation

## Files

| File | Change |
|------|--------|
| `supabase/functions/generate-blog-post/index.ts` | Add FAQ em-dash cleanup + logging |
| `src/components/dashboard/BlogPostCreator.tsx` | Add response logging + FAQ count in toast |


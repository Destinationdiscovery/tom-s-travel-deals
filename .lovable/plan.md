

# Fix Blog Post Generation Schema Error

## Problem
The `generate-blog-post` edge function fails with a 400 error: "property is not defined" for `primary_keyword`, `faq_items`, and `internal_links`. These three fields are placed **outside** the `properties` object (after the closing `}` on line 195) but listed in `required`. The AI gateway rejects the malformed schema.

## Fix

**`supabase/functions/generate-blog-post/index.ts`** (lines 194-223):

Move `primary_keyword`, `faq_items`, and `internal_links` inside the `properties` object by fixing the brace placement:
- Line 195: closing brace of `properties` → remove it
- Line 222: add the closing brace for `properties` here instead
- This puts all three fields inside `properties` where `required` can reference them

Single structural fix, no logic changes. Redeploy the edge function.

| File | Change |
|------|--------|
| `supabase/functions/generate-blog-post/index.ts` | Move 3 fields inside `properties` object |


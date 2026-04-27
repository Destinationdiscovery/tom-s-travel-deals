## Sitemap Fix Plan

Three connected problems, fixed in one pass.

### Problem summary

1. **`public/sitemap.xml` line 75** has an unencoded title-as-slug with spaces, capitals, colons, ampersands, and commas. Google sees a parse error and abandons the entire sitemap → 0 of 110 pages discovered via XML sitemap.
2. **The same bad slug exists in the `blog_posts` database table** (`Edinburgh Scotland Travel Guide 2026: Itinerary, Hidden Gems & Haunted History`). This means the article's actual URL is unreachable, the React route can't render it cleanly, and any future regenerated sitemap would re-introduce the error.
3. **GSC submission used the wrong domain** (`reviewthengo.com` instead of `www.reviewthengo.com`).

### Fix steps

**Step 1: Repair the database row**
- Run a one-off SQL update on `blog_posts` to change the bad slug to a clean one: `edinburgh-scotland-travel-guide-2026`.
- This unblocks the article URL itself: `https://www.reviewthengo.com/compass/edinburgh-scotland-travel-guide-2026` will now actually load.

**Step 2: Repair `public/sitemap.xml` line 75**
- Replace the broken `<loc>` value with the corrected slug.
- No other lines in the file have malformed slugs (verified by scan — only line 75 contains spaces/percent encoding/uppercase).

**Step 3: Harden the dynamic sitemap generator (`supabase/functions/generate-sitemap`)**
- Add a slug-sanity filter: skip any `blog_posts` row whose slug contains characters outside `[a-z0-9-]` so a future bad slug can never poison the XML again.
- Also URL-encode each slug as a defense-in-depth measure when writing `<loc>`.

**Step 4: Add a slug normalizer to the blog generator (`supabase/functions/generate-blog-post`)**
- Even though the AI is instructed to return a lowercase-hyphen slug, it clearly drifted at least once. Add a deterministic `slugify()` post-processing step that runs on the returned `slug` field before insert: lowercase, replace non-alphanumeric runs with `-`, strip leading/trailing `-`, cap at 80 chars.
- This means the AI's slug is treated as a hint, never raw input.

**Step 5: Tell you the right thing to submit in GSC**
- After deploy, you'll resubmit `https://www.reviewthengo.com/sitemap.xml` (with `www`) and remove the broken non-www entry. I'll give you the exact click path.

### Files changed

| File | Change |
|---|---|
| Database `blog_posts` table | UPDATE one row's slug |
| `public/sitemap.xml` | Fix line 75 |
| `supabase/functions/generate-sitemap/index.ts` | Filter + encode slugs |
| `supabase/functions/generate-blog-post/index.ts` | Slugify post-processing |

### Out of scope (we'll come back to it)

The bot-redirect work for `/compass/[slug]` URLs is paused until the sitemap is healthy and Google starts discovering articles again.

### What I'll verify before handing back

- `xmllint` (or equivalent) parses the new `public/sitemap.xml` cleanly.
- A `curl` to the live `generate-sitemap` edge function returns valid XML containing the corrected slug.
- The Edinburgh article loads at the new clean URL on the React side.
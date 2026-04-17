
The user wants me to test the Content Studio to verify affiliate links render as clickable hyperlinks in published articles. Testing requires browser automation + creating a real blog post, which is a default-mode action (writes to DB, calls edge functions).

Let me check the current state of the renderer and the BlogPostCreator to confirm what's wired up before proposing the test plan.

I already have the CompassArticle.tsx context showing the renderInlineMarkdown helper was added. I should verify:
1. BlogPostCreator passes affiliateUrl/anchorText/brandName to the edge function
2. Edge function uses them in the prompt
3. Renderer parses markdown links

Let me quickly view those files to confirm wiring before testing.

# Test Plan: Verify Affiliate Links Render as Clickable

## What I'll Do

1. **Quick wiring check** (read-only): Verify `BlogPostCreator.tsx` sends affiliate fields and `generate-blog-post/index.ts` injects them into the AI prompt. Confirm `CompassArticle.tsx` has the `renderInlineMarkdown` helper for `[text](url)`, `**bold**`, `*italic*`.

2. **End-to-end browser test**:
   - Navigate to `/gear-admin` → Content Studio
   - Fill in a test prompt (e.g. "Best travel adapters for Europe 2026")
   - Fill the 3 affiliate fields:
     - URL: `https://www.amazon.ca/dp/B07S98YL3R`
     - Anchor text: `this universal travel adapter`
     - Brand: `EPICKA Universal Travel Adapter`
   - Click Generate, wait for completion
   - Open the published article at `/compass/{slug}`
   - Verify:
     - No raw `[text](url)` markdown visible
     - Affiliate mentions are clickable, styled as primary-colored underlined links
     - Links open in new tab with `rel="sponsored noopener noreferrer"` (inspect via observe)
     - 2-4 affiliate links present, naturally placed (not in intro, varied anchor text)
     - Bold/italic markdown also renders correctly

3. **Report findings**: If any issue found (markdown not parsing, wrong rel attributes, AI ignoring affiliate instructions), I'll fix it in the same loop and re-test.

## What Could Go Wrong (and how I'll handle it)
- AI ignores affiliate instructions → Strengthen the prompt in `generate-blog-post/index.ts`
- Markdown still shows as raw text → Patch the renderer regex
- Links missing `rel="sponsored"` → Adjust the renderInlineMarkdown helper

## Files Possibly Touched (only if bugs found)
- `supabase/functions/generate-blog-post/index.ts`
- `src/pages/CompassArticle.tsx`

The test article will be created in your DB. I'll note its slug so you can delete it after if you don't want to keep it.

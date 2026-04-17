

The user is asking: does the Content Studio currently produce articles where affiliate/markdown links render as clickable, and if not, can we make it so?

From the prior conversation:
1. The renderer in CompassArticle.tsx WAS updated with `renderInlineMarkdown` that parses `[text](url)`, `**bold**`, `*italic*` — confirmed working in a test post.
2. BUT the AI noted a "feature gap": BlogPostCreator.tsx doesn't have the affiliate input fields, and generate-blog-post edge function prompt wasn't updated to inject affiliate links.

So the situation is:
- ✅ Renderer can display clickable links if markdown is in the content
- ❌ Content Studio has no UI to specify an affiliate link
- ❌ Edge function doesn't instruct AI to insert affiliate hyperlinks

Let me quickly verify the current state of BlogPostCreator and the edge function to confirm before planning.

I already have generate-blog-post/index.ts in context — confirmed: NO affiliate logic in the prompt, no affiliateUrl/anchorText/brandName fields accepted.

I need to check BlogPostCreator.tsx briefly.

# Make Content Studio Produce Clickable Affiliate Links

## Current State
- **Renderer**: ✅ Already converts `[text](url)` markdown into clickable `<a>` tags (verified in last test)
- **Content Studio UI**: ❌ No affiliate fields exist yet
- **AI Prompt**: ❌ Doesn't tell the AI to insert any links

So right now, the AI isn't producing affiliate hyperlinks because nothing tells it to. We just need to wire up the input → prompt instruction chain.

## Plan

### 1. Add affiliate inputs to Content Studio
`src/components/dashboard/BlogPostCreator.tsx` — add a collapsible "Affiliate Link (optional)" section with 3 fields:
- **Affiliate URL** — e.g. `https://www.amazon.ca/dp/...?tag=reviewthengo-20`
- **Brand/Product Name** — e.g. `EPICKA Universal Adapter`, `Expedia`
- **Suggested Anchor Text** — e.g. `this travel adapter` (AI will vary it naturally)

Pass these to the edge function call.

### 2. Update edge function prompt
`supabase/functions/generate-blog-post/index.ts` — when affiliate fields are provided, append to the system prompt:

> **Affiliate Integration:**
> - Naturally weave 2 to 4 contextual mentions of [Brand] in body paragraphs where genuinely relevant (recommendations, comparisons, examples)
> - Hyperlink each using markdown: `[varied anchor text](AFFILIATE_URL)`
> - Vary anchor text — never repeat the same phrase. Examples: "{anchor}", "check current pricing", "see availability", "view this option"
> - DO NOT place affiliate links in the intro, FAQ, or every paragraph
> - DO NOT use pushy phrases like "Click here", "Buy now", "Best deal"
> - Maximum 4 links per article

Also accept `affiliateUrl`, `brandName`, `anchorText` from request body.

### 3. Renderer is already done
`CompassArticle.tsx` already parses markdown links with proper `rel="sponsored noopener noreferrer"` for external URLs. No changes needed.

## Files Changed

| File | Change |
|------|--------|
| `src/components/dashboard/BlogPostCreator.tsx` | Add 3 optional affiliate input fields, send to edge function |
| `supabase/functions/generate-blog-post/index.ts` | Accept affiliate params, conditionally inject natural-link rules into AI prompt |

## After This
You enter an affiliate URL in Content Studio → AI generates an article with 2-4 naturally placed `[anchor](url)` mentions → renderer displays them as clickable, SEO-compliant `<a rel="sponsored">` links in the published article.


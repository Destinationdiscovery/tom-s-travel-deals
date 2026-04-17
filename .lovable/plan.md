

Yes, exactly. Here's the flow now in place:

## How It Works

1. **Open Content Studio** at `/gear-admin` → Content Studio tab
2. **Enter a topic** (e.g. "Best Travel Adapters for Europe 2026")
3. **Fill the optional Affiliate Link section**:
   - Affiliate URL (your tagged link, e.g. Amazon Associates)
   - Brand/Product Name (e.g. "EPICKA Universal Adapter")
   - Suggested Anchor Text (e.g. "this travel adapter")
4. **Click Generate** — AI writes a 2,500+ word article and naturally weaves 2 to 4 clickable affiliate mentions into the body using markdown
5. **Publish** — the article appears at `/compass/{slug}` with hyperlinks rendered as proper clickable `<a>` tags styled in primary color, opening in new tab with `rel="sponsored noopener noreferrer"` (Google-compliant)

## What's Guaranteed
- No raw `[text](url)` markdown will show — the renderer parses it into real links
- Links are placed in body paragraphs only (not intro, headings, or FAQ)
- Anchor text is varied across the article, never spammy
- Bold (`**`) and italic (`*`) markdown also render correctly

## If You Leave Affiliate Fields Blank
The AI generates a normal article with no affiliate links. The fields are fully optional.

## One Recommendation
Run a real test: generate one article with a live affiliate URL, open it on the live site, and click a link to confirm it routes to your tagged URL. If anything looks off (markdown showing, wrong rel attribute, no links injected), I'll fix it immediately.


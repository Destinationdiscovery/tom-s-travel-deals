## RSS Feed for The Compass

Yes, an RSS feed is straightforward to add and there is **no extra cost**. It runs on the same Lovable Cloud edge functions you're already using (free tier covers this easily — the feed is a single small XML response, cached for an hour, hit at most a few times a day by aggregators like Feedspot/Alltop/Blogarama).

### What gets built

**1. New edge function: `generate-rss`**

Lives at `supabase/functions/generate-rss/index.ts`, deploys automatically. Mirrors how `generate-sitemap` works:

- Pulls all rows from the `blog_posts` table (DB-backed Compass articles)
- Merges in the 9 hardcoded Compass articles from `supabase/functions/articles-feed/static-articles.json` (so the feed includes everything, not just the DB ones)
- De-dupes by slug (DB wins if there's a collision)
- Sorts newest first, caps at the 50 most recent items (RSS best practice)
- Filters out any malformed slugs using the same `^[a-z0-9-]+$` safety regex from the sitemap fix
- Returns valid **RSS 2.0** XML with `Content-Type: application/rss+xml; charset=utf-8` and a 1-hour cache

**2. Feed shape (matches what Alltop / Feedspot / Blogarama expect)**

```text
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>The Compass by ReviewThenGo</title>
    <link>https://www.reviewthengo.com/compass</link>
    <description>Travel guides, destination journalism, and Canadian travel news.</description>
    <language>en-us</language>
    <atom:link href="https://www.reviewthengo.com/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>...</lastBuildDate>
    <item>
      <title>...</title>
      <link>https://www.reviewthengo.com/compass/&lt;slug&gt;</link>
      <guid isPermaLink="true">https://www.reviewthengo.com/compass/&lt;slug&gt;</guid>
      <description>...excerpt, HTML-escaped...</description>
      <pubDate>RFC-822 date</pubDate>
      <author>noreply@reviewthengo.com (Tom)</author>
      <category>Travel Tips</category>
    </item>
    ...
  </channel>
</rss>
```

**3. Make it live at `https://www.reviewthengo.com/rss.xml`**

The edge function natively answers at a Supabase URL. To serve it from your own domain at the clean `/rss.xml` path (which is what Alltop/Feedspot will store), I'll add a small static `public/rss.xml` placeholder that gets regenerated, **plus** an in-page note in `robots.txt`:

- Add `public/rss.xml` — a one-time generated snapshot of the feed (so a direct hit returns valid RSS immediately, even before the edge function caches)
- Add a line to `public/robots.txt`: a `# Feed:` comment pointing aggregators to the live edge function URL
- Add `<link rel="alternate" type="application/rss+xml" title="The Compass by ReviewThenGo" href="/rss.xml" />` to `index.html` so feed-reader browser extensions auto-detect it

> **Note on freshness:** the static `public/rss.xml` is a snapshot; it updates whenever I (or you) ask me to regenerate it, or when we publish new articles I can re-run it. The edge function (`/functions/v1/generate-rss`) is always live with current data. Most aggregators (Feedspot, Alltop, Blogarama) will accept either URL — I'll recommend submitting the **edge function URL** for true real-time updates, and keep `/rss.xml` as a friendly canonical alias.

**4. Footer link (optional but standard)**

Add a small "RSS" link in the footer next to your existing links so readers / aggregator scouts can find the feed.

### Files changed

| File | Change |
|---|---|
| `supabase/functions/generate-rss/index.ts` | New — builds and serves the RSS 2.0 feed |
| `public/rss.xml` | New — static snapshot for direct domain access |
| `public/robots.txt` | Add `# Feed:` reference line |
| `index.html` | Add `<link rel="alternate" type="application/rss+xml">` in `<head>` |
| `src/components/Footer.tsx` | Add small RSS link |

### Cost

**Zero.** Edge function invocations and bandwidth for a feed this small (~50 items, ~30KB XML, hourly cache) are well inside the Lovable Cloud free tier. Aggregators typically poll once or twice a day per source.

### What you'll do after I build it

Submit this URL to Alltop / Blogarama / Feedspot:

`https://www.reviewthengo.com/rss.xml`

(or, if any of them complain it's stale, the always-live version: `https://iomrjljlydboniioohkv.supabase.co/functions/v1/generate-rss`)

### Out of scope

- Full-text content in `<content:encoded>` (RSS readers can show full articles, not just excerpts). Skipping for now because (a) it bloats the feed, (b) it can encourage scrapers to republish without traffic. Excerpts + link is the standard for blogs that want clicks. Easy to add later if you want.

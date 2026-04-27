No, you should not have to do this every day.

What happened is that yesterday fixed the direction, but not every live entry point is actually serving the fresh version yet:

1. The **live backend RSS feed is updating correctly**. Your new articles are in the dynamic feed.
2. The public **`https://www.reviewthengo.com/rss.xml` path is still serving an old cached/static version** on the live domain. That is likely what Claude, Perplexity, Grok, and feed directories are checking.
3. The AI crawler HTML feed also needs one backend config fix so anonymous AI bots can reliably access it without a login token.

## Permanent fix

### 1. Make the AI crawler feed explicitly public
Add the missing backend function config for `articles-feed` so bots can access it anonymously:

```text
[functions.articles-feed]
verify_jwt = false
```

### 2. Redeploy the RSS + crawler feed functions
Redeploy:
- `generate-rss`
- `articles-feed`

This makes the dynamic RSS and AI crawler HTML feed live immediately.

### 3. Remove the stale `/rss.xml` dependency
Keep the dynamic feed as the source of truth and make sure all discovery links point to it.

For feed directory submissions, use the dynamic RSS feed URL, not `/rss.xml`.

### 4. Publish the frontend update
The custom domain can keep serving old static files until the frontend is published/updated. After the code changes, you should click **Publish / Update** so `index.html`, `robots.txt`, and the removal of stale `rss.xml` are reflected on `www.reviewthengo.com`.

### 5. Verify the final live result
After implementation and publish, check:

- Dynamic RSS feed includes the newest articles.
- AI crawler feed returns article links and full article pages.
- `robots.txt` points crawlers to the correct live feeds.
- `/rss.xml` no longer misleads bots with stale content.

## Expected maintenance

No daily task. Once this is fixed and the frontend is published, new Compass articles should automatically appear in:

- the RSS feed
- the AI crawler feed
- the dynamic sitemap feed if needed

There may still be a normal delay before Claude, Perplexity, or Grok re-crawl the site. That delay is on their side, not something you need to manually fix every day.
## Goal

Make the RSS feed always reflect newly published articles automatically, with zero manual snapshot work.

## Changes

1. **`index.html`** — Update the `<link rel="alternate" type="application/rss+xml">` href to point at the always-live edge function:
   `https://iomrjljlydboniioohkv.supabase.co/functions/v1/generate-rss`

2. **`src/components/Footer.tsx`** — Update the RSS icon link (currently `/rss.xml`) to the same live edge function URL.

3. **`public/robots.txt`** — Replace the two-line "static snapshot + always-live" comment with a single always-live reference.

4. **`public/rss.xml`** — Delete the stale static snapshot file so it can't be served outdated to anyone who has bookmarked it.

5. **Memory** — Update `mem://features/seo/rss-feed.md` to note the canonical RSS URL is now the live edge function (no snapshot maintenance needed).

## Aggregator submission URL

Going forward, submit this URL to Alltop, Feedspot, and Blogarama:
`https://iomrjljlydboniioohkv.supabase.co/functions/v1/generate-rss`

If you've already submitted `https://www.reviewthengo.com/rss.xml` somewhere, that URL will start returning 404 once `public/rss.xml` is deleted. Two options:

- **Re-submit** the new live URL on those aggregators (recommended, takes 30 seconds each).
- **Or** keep `public/rss.xml` and just re-snapshot it manually whenever you want it fresh (current behavior).

I recommend deleting and resubmitting since you only just submitted to a few places. Confirm you want me to delete `public/rss.xml` as part of this, or say "keep the snapshot" and I'll only update the auto-discovery links.
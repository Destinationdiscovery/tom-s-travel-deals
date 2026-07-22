## Restore same-domain sitemap at `/sitemap.xml`

Google Search Console needs the sitemap on `reviewthengo.com`, not `supabase.co`. Bring back the build-time generator that mirrors the Edge Function output into `public/sitemap.xml`.

### Changes

1. **Create `scripts/generate-sitemap.ts`** — fetches `https://iomrjljlydboniioohkv.supabase.co/functions/v1/generate-sitemap` and writes the XML response to `public/sitemap.xml`.
2. **Update `package.json`** — add `predev` and `prebuild` scripts running `bunx tsx scripts/generate-sitemap.ts` so the file regenerates on every dev start and production build.
3. **Update `public/robots.txt`** — point `Sitemap:` back to `https://www.reviewthengo.com/sitemap.xml`.

### Tradeoff (already discussed)

Sitemap freshness = last deploy. After publishing a new trip/blog post, click **Publish** in Lovable to redeploy so Google sees it. Database-only writes won't refresh the file.

### Submit to Search Console

`https://www.reviewthengo.com/sitemap.xml`

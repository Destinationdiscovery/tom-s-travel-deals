

## Image Proxy for Gear Products

Create a backend edge function that fetches product images server-side, just like `place-photos` does for resort images. This bypasses hotlink protection because the request comes from your server, not the user's browser.

### How It Works

1. Perplexity already returns `imageUrl` for each gear item (Amazon thumbnails, manufacturer photos, etc.)
2. The browser currently tries to load these URLs directly and gets blocked by hotlink protection
3. A new `gear-image-proxy` edge function will fetch the image server-side and pipe the binary data back to the browser
4. The frontend routes all gear product images through this proxy instead of loading them directly

### Files to Create/Change

**New: `supabase/functions/gear-image-proxy/index.ts`**
- Accepts a `url` query parameter (the Perplexity-provided image URL)
- Fetches the image server-side with a generic User-Agent header to avoid bot detection
- Returns the raw image bytes with proper Content-Type and 24-hour cache headers
- Follows the same pattern as `place-photos` (CORS headers, error handling, binary response)
- Validates the URL to prevent abuse (only allow image content types)

**Edit: `supabase/config.toml`**
- Add `[functions.gear-image-proxy]` with `verify_jwt = false`

**Edit: `src/pages/Gear.tsx`**
- Update `PackingResultCard` to route `item.imageUrl` through the proxy: instead of `src={item.imageUrl}`, use `src={proxyUrl(item.imageUrl)}`
- Update `ProductReviewPanel` hero image to also use the proxy
- Add a helper function that constructs the proxy URL: ``https://iomrjljlydboniioohkv.supabase.co/functions/v1/gear-image-proxy?url=${encodeURIComponent(imageUrl)}``
- Keep the existing category-icon fallback for cases where no image URL exists at all

### Why This Should Work
- The `place-photos` function uses the exact same approach (server-side fetch, return binary) and it works perfectly for resort images
- The server request won't have a browser `Referer` header, so Amazon/manufacturer hotlink checks won't block it
- No new API keys or costs required -- just proxying URLs Perplexity already provides

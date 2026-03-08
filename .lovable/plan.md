

## Add Google AdSense Verification Snippet

**What**: Add the AdSense verification script to `index.html` so Google can verify site ownership and begin the review process.

**Change**: One file — `index.html`
- Add the AdSense `<script>` tag inside the `<head>`, after the existing Google Analytics tags.

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7122383865667044" crossorigin="anonymous"></script>
```

**After deployment**: Go back to your AdSense dashboard and click "Request review." Google typically takes 1–14 days to approve. Once approved, you can start placing ad units.


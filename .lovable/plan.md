

# Fix Email Links: Clickable URLs + Outlook Opening

## Problems

1. **Gmail/Yahoo compose links show the raw URL as plain text** -- it's too long and not clickable. The Gmail/Yahoo compose URLs only support plain text in the body parameter, so there's no way to make a hyperlink. The fix is to use the published domain URL (shorter) and add clear "click here" text so the link is obviously clickable even as plain text.

2. **Outlook mailto doesn't open** -- `window.open()` with mailto: links gets blocked by popup blockers. The fix is to use `window.location.href` instead, which browsers handle natively without blocking.

## Changes

### File: `src/components/dashboard/QuotePreview.tsx`

1. **Use the published URL instead of the preview URL** -- Replace `window.location.origin` (which gives the long preview domain) with the shorter published domain `https://reviewthengo.lovable.app` for the share link used in emails. This makes the URL much shorter and more clickable in plain text contexts.

2. **Fix Outlook mailto** -- Change `window.open(mailto:...)` to `window.location.href = mailto:...` so it opens the default mail client without being blocked by popup blockers.

3. **Improve plain text email body** -- Reword the body so the link stands alone on its own line with a clear call-to-action, making it easier for email clients to auto-detect and make clickable:

```
Hi Pat & Holly,

Your vacation quote for Hotel Sonya in Rome, Italy is ready!

Click below to view your quote:

https://reviewthengo.lovable.app/quote/abc123

Let me know if you have any questions!

Best regards,
Tom Laracy - TravelOnly
```

4. **Keep the Send Direct (Resend) HTML email as-is** -- The HTML email sent via Resend already has a proper clickable button, so no changes needed there.


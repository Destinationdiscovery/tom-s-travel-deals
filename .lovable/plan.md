

# Plan: Fix Outlook Links Being Blocked

## Root Cause

Microsoft's Outlook servers return a `Cross-Origin-Opener-Policy: same-origin` header. When `window.open(url, "_blank")` is called from the Lovable preview iframe, the new tab retains an "opener" relationship back to the cross-origin iframe. Microsoft detects this and blocks the connection with `ERR_BLOCKED_BY_RESPONSE`.

Gmail does not set these same restrictive COOP headers, which is why it loads fine.

## Solution

Replace all `window.open(url, "_blank")` calls for Outlook with a method that severs the opener relationship:

```typescript
// Instead of:
window.open("https://outlook.live.com/mail/", "_blank")

// Use:
const a = document.createElement('a');
a.href = "https://outlook.live.com/mail/";
a.target = '_blank';
a.rel = 'noopener noreferrer';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
```

The `noopener` attribute breaks the cross-origin opener relationship so Microsoft's security headers won't block the page.

## Files to Update

| File | Locations |
|------|-----------|
| `src/components/dashboard/DashboardOverview.tsx` | 2 Outlook `window.open` calls (lines 220, 256) |
| `src/components/dashboard/EmailComposer.tsx` | 1 Outlook `window.open` call (line 191) |

I will create a small helper function (e.g., `openExternal(url)`) to avoid duplicating the anchor-click logic, and use it for all three Outlook links. Other external links (Sirev, Expedia TAAP) can optionally use the same helper for consistency.


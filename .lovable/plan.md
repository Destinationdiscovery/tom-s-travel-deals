

# Plan: Replace All Outlook Links with Office 365 Web Deeplinks

## Problem

All Outlook links use either `mailto:` (opens default Linux mail client, not Outlook) or `ms-outlook://` (Windows-only protocol, doesn't work on Linux). Neither works on Linux Mint.

## Solution

Create a shared utility function `openWorkOutlook` that uses the Office 365 web deeplink URL, then replace all `mailto:` and `ms-outlook://` Outlook references across the dashboard.

### New Utility: `src/lib/openWorkOutlook.ts`

```typescript
export const openWorkOutlook = (to: string, subject: string, body: string) => {
  const params = new URLSearchParams();
  if (to) params.append('to', to);
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  const url = `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
  window.open(url, '_blank');
};
```

### Files to Update

| File | Current | Change |
|------|---------|--------|
| `src/components/dashboard/QuotePreview.tsx` | `openOutlook` uses `mailto:` | Use `openWorkOutlook(email, subject, body)` |
| `src/components/dashboard/EmailComposer.tsx` | `handleSendViaOutlook` uses `mailto:`, Quick Link uses `ms-outlook://` | Use `openWorkOutlook` for send; change Quick Link to `window.open('https://outlook.office.com/mail', '_blank')` |
| `src/components/dashboard/DealMaker.tsx` | `openInOutlook` uses `mailto:` | Use `openWorkOutlook` |
| `src/components/dashboard/DashboardOverview.tsx` | Two buttons use `ms-outlook://` | Change both to `window.open('https://outlook.office.com/mail', '_blank')` |

All "Open Outlook App" buttons will open the Outlook Web inbox. All "Send via Outlook" actions will open the Office 365 compose deeplink with pre-filled To/Subject/Body.


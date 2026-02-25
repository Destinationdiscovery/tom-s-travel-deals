

# Plan: Fix Outlook URL Across Dashboard

## Problem
`https://www.outlook.com/mail/` redirects to `outlook.live.com` which is getting blocked (ERR_BLOCKED_BY_RESPONSE). This is because Outlook sets `X-Frame-Options` headers that block iframe embedding, but more importantly the redirect chain lands on a blocked domain.

## Solution
Replace all instances with `https://outlook.office.com/mail/` — this is the direct Outlook Web App URL used by Microsoft 365 / Office 365 accounts and does not redirect through `outlook.live.com`.

## Files to Update

| File | Line | Current URL | New URL |
|------|------|-------------|---------|
| `DashboardOverview.tsx` | 220 | `https://www.outlook.com/mail/` | `https://outlook.office.com/mail/` |
| `DashboardOverview.tsx` | 256 | `https://www.outlook.com/mail/` | `https://outlook.office.com/mail/` |
| `EmailComposer.tsx` | 191 | `https://www.outlook.com/mail/` | `https://outlook.office.com/mail/` |

Three simple string replacements. The `mailto:` links in QuotePreview and DealMaker are fine — those use the OS mail client, not a web URL.


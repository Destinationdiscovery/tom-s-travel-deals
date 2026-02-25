

# Plan: Fix Outlook URL to Use outlook.live.com

## Problem
`outlook.office.com/mail/` redirects to `outlook.cloud.microsoft/mail/` which returns `ERR_BLOCKED_BY_RESPONSE`. This is a Microsoft server-side redirect issue -- the destination domain blocks the connection.

## Investigation Results
- `outlook.office.com/mail/` -- redirects to `outlook.cloud.microsoft` -- **BLOCKED**
- `outlook.live.com/mail/` -- loads the Outlook sign-in/loading screen successfully -- **WORKS**

## Solution
Replace all 3 instances with `https://outlook.live.com/mail/`.

## Files to Update

| File | Location | Change |
|------|----------|--------|
| `DashboardOverview.tsx` | "Open Outlook" button | `outlook.office.com` to `outlook.live.com` |
| `DashboardOverview.tsx` | Quick Links section | `outlook.office.com` to `outlook.live.com` |
| `EmailComposer.tsx` | Quick Links section | `outlook.office.com` to `outlook.live.com` |

Three string replacements: `https://outlook.office.com/mail/` to `https://outlook.live.com/mail/`.


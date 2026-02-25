

# Plan: Update Outlook Links to https://www.outlook.com/mail/

## Changes

Three files contain hardcoded Outlook URLs (`https://outlook.cloud.microsoft/mail/`) that need updating to `https://www.outlook.com/mail/`:

| File | Lines | Change |
|------|-------|--------|
| `src/components/dashboard/EmailComposer.tsx` | Line 191 | Update Quick Links Outlook URL |
| `src/components/dashboard/DashboardOverview.tsx` | Line 220 | Update "Open Outlook" button URL |
| `src/components/dashboard/DashboardOverview.tsx` | Line 256 | Update Quick Links Outlook URL |

All three are simple string replacements: `https://outlook.cloud.microsoft/mail/` → `https://www.outlook.com/mail/`

No other files or logic affected.


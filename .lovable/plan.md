

# Plan: Open Outlook Desktop App Instead of Web

## Problem
Every attempt to open Outlook's web interface gets blocked by Microsoft's `Cross-Origin-Opener-Policy` headers. The `about:blank` intermediate step also fails — the navigation never completes.

## Solution
Stop trying to open Outlook's web interface entirely. Instead, use the `ms-outlook:` protocol URL, which prompts the OS to open the Outlook desktop/native app directly. This is the same mechanism websites use to open Slack, Zoom, Teams, etc.

If the user doesn't have the Outlook app installed, the browser will show its standard "no app found" prompt — no blocked pages, no blank tabs.

## Implementation

**File: `src/components/dashboard/DashboardOverview.tsx`** (2 locations)
- Replace `openExternal("https://outlook.live.com/mail/")` with `window.location.href = "ms-outlook://"`

**File: `src/components/dashboard/EmailComposer.tsx`** (1 location)
- Same replacement

The button labels will change from "Open Outlook" / "Outlook Email" to "Open Outlook App" to set the right expectation.

We can also add `https://outlook.live.com/mail/` as a secondary fallback link (plain `<a>` tag) labeled "Open Outlook Web" for cases where the desktop app isn't installed.

## Technical Details
- `ms-outlook://` is the registered protocol handler for Microsoft Outlook on macOS/Windows
- Protocol URLs bypass all COOP/iframe restrictions because they're handled by the OS, not the browser
- No changes needed to `openExternal.ts` — these links won't use it


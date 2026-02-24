
# Fix Attachment Downloads Being Blocked by Browser

## Problem
When clicking a document attachment in the quote, the app opens a new tab pointing directly to the backend storage URL. Microsoft Edge (and some ad-blockers) block this navigation, showing "ERR_BLOCKED_BY_CLIENT".

## Solution
Instead of opening the signed URL in a new tab, fetch the file content in the background and trigger a proper file download using a temporary blob URL. This avoids the browser ever navigating to the backend domain.

## Technical Change

**File: `src/components/dashboard/TripDetailsCard.tsx`** (lines 196-198)

Replace the `window.open` approach with a fetch-and-download pattern:

1. Get the signed URL (same as now)
2. `fetch()` the file content from that signed URL
3. Create a `Blob` from the response
4. Create a temporary `URL.createObjectURL()` link
5. Programmatically click a hidden `<a>` element with the `download` attribute to trigger a native browser download
6. Revoke the blob URL after download starts

This ensures the file downloads correctly regardless of browser security settings or ad-blockers, since the download originates from the page itself rather than navigating to an external domain.

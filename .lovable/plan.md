

# Fix: Merge Duplicate Client Files (Case-Insensitive Matching)

## Problem
The Clients tab groups entries by exact `client_name` match, so "tom mercante" and "Tom Mercante" appear as two separate client files. The same issue would occur with any minor capitalization differences.

## Solution
Update the `ClientList` component to group clients using a **case-insensitive key** (lowercase name) while preserving the most recent or best-formatted display name.

## Technical Details

**File: `src/components/dashboard/ClientList.tsx`**

- Change the grouping key from `q.client_name` to `q.client_name.toLowerCase().trim()` (and same for bookings)
- Use the original casing from the most recent record as the display name
- This merges "tom mercante", "Tom Mercante", "TOM MERCANTE" etc. into a single client file automatically
- No database changes required -- this is purely a display/grouping fix


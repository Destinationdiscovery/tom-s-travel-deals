
# Fix: Latest Blog Post Not Appearing on Homepage

## Root Cause

The sorting logic in `BlogPreviewSection.tsx` uses string comparison (`localeCompare`) on dates like "February 23, 2026" and "January 29, 2026". Alphabetically, "F" comes before "J", so "February" sorts before "January" -- the opposite of what we want.

Your new article dated "February 23, 2026" is being sorted incorrectly and falls below the top 3.

## Fix

**File:** `src/components/BlogPreviewSection.tsx`

Replace the alphabetical sort with a proper date sort using `Date.parse()` to convert the human-readable dates into actual timestamps before comparing:

```typescript
// Before (broken):
.sort((a, b) => b.datePublished.localeCompare(a.datePublished))

// After (correct):
.sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
```

This is a one-line change on line 73. Since all dates are in standard English format (e.g. "February 23, 2026"), `new Date()` will parse them correctly and sort chronologically, putting your newest post first.

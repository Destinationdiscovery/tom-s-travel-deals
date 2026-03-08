

# Plan: Add Navigation Buttons to Quote Preview + Investigate Missing Quotes

## Missing Quotes

The database only contains **2 quotes** for Loretta (Fellskot Guesthouse and Bjork Guesthouse). The other 2 were never persisted — likely the Save button wasn't clicked after previewing, or saves failed silently. To prevent this in future, I'll add a more prominent save indicator.

## Changes

### 1. Add "Generate New Quote" and "Return to Dashboard" buttons to `QuotePreview.tsx`

Add two new buttons to the action bar at the bottom of the preview:
- **Generate New Quote** — calls a new `onNewQuote` callback that resets the form and goes back to step 1
- **Return to Dashboard Home** — calls a new `onDashboardHome` callback that switches to the overview tab

### 2. Wire the callbacks in `QuoteBuilder.tsx`

- Pass `onNewQuote={resetQuote}` and `onDashboardHome` (which calls `onPreviewMode(false)` and sets the parent tab to "overview") to `QuotePreview`
- The `QuotePreview` component needs two new props: `onNewQuote` and `onDashboardHome`

### 3. Auto-save improvement

Currently the user must manually click Save. I'll add a subtle unsaved indicator (yellow dot on the Save button) when the quote hasn't been saved yet, making it more obvious.

## Files Changed

| File | Change |
|------|--------|
| `src/components/dashboard/QuotePreview.tsx` | Add "Generate New Quote" and "Return to Dashboard" buttons |
| `src/components/dashboard/QuoteBuilder.tsx` | Pass new callbacks to QuotePreview |


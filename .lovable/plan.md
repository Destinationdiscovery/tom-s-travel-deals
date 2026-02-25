

# Plan: Implement the about:blank Detachment Approach

## Status
The previously approved plan (using `window.open('about:blank')` + `w.opener = null`) was never implemented. The `openExternal.ts` file still contains the anchor-click approach that doesn't work.

## Why the Current Approach Fails
The anchor-click with `rel="noopener noreferrer"` doesn't fully sever the cross-origin opener relationship when running inside the Lovable preview sandbox. Microsoft's `Cross-Origin-Opener-Policy: same-origin` header still detects the iframe context and blocks the response.

## Solution
Update `src/lib/openExternal.ts` to use the two-step window.open approach:

1. Open `about:blank` first (no cross-origin restrictions)
2. Set `opener = null` to sever the relationship
3. Navigate to the destination URL
4. Fall back to anchor-click if popup is blocked

## File to Update

| File | Change |
|------|--------|
| `src/lib/openExternal.ts` | Replace anchor-click implementation with `window.open('about:blank')` + `opener = null` + navigation approach, with anchor-click fallback |

```typescript
export const openExternal = (url: string) => {
  const w = window.open('about:blank', '_blank');
  if (w) {
    w.opener = null;
    w.location.href = url;
  } else {
    // Fallback if popup blocked
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
```

Only one file changes. All three Outlook buttons (and Sirev/Expedia) already use `openExternal`, so they'll all benefit automatically.


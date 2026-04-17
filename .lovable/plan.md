

User says PWA isn't picking up the new Content Studio updates (multi-affiliate fields + latest articles changes) despite many refreshes. This is a classic PWA service worker caching problem.

Looking at vite.config.ts: `registerType: "autoUpdate"` is set, which is good, but the service worker still serves the old cached shell until the new SW activates. On mobile PWAs (especially iOS), the old version often persists for a long time because:
1. SW updates only check on navigation events
2. The "skipWaiting" + "clientsClaim" aren't set, so the new SW waits idle until ALL tabs/PWA windows close
3. Cached JS chunks are served from `images-cache` / `api-cache` / precache

Also `main.tsx` calls `registerSW({ immediate: true })` but doesn't pass `onNeedRefresh` to actually swap to the new version, and there's no PWA guard for the preview iframe (per the PWA guidance — though that's a separate issue).

The fix needs two parts: an immediate unstick for the user right now, and a code change so this doesn't happen again on future updates.

Keeping it tight per instructions.

# Plan: Fix PWA Stale Cache for Content Studio Updates

## Why the PWA is showing old content

The service worker is set to `autoUpdate` but it doesn't force the new version to activate while the PWA window is open. So even after refreshing, you're still being served the old cached JavaScript bundle that doesn't include the new affiliate fields.

## Immediate unstick (you do this once on the device)

On your phone PWA, do one of these to force a fresh load right now:
1. Fully close the installed PWA (swipe it out of the app switcher), then reopen it. Repeat once more.
2. Or open the site in regular Chrome/Safari (not the installed PWA), confirm new fields appear there, then reopen the PWA.

If that still shows old content, uninstall the PWA from your home screen and reinstall from `/install`.

## Permanent fix (code changes so this stops happening)

**`vite.config.ts`** — add two workbox flags so new service workers activate immediately instead of waiting:
```
workbox: {
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  ...
}
```

**`src/main.tsx`** — replace the current `registerSW({ immediate: true })` with a version that auto-reloads the page when a new build is detected:
```
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true); // activates new SW and reloads
  },
});
```

**Result**: every time you publish a new build, PWA users get the new version on their next app open, no manual refresh needed.

## Files Touched

| File | Change |
|---|---|
| `vite.config.ts` | Add `skipWaiting`, `clientsClaim`, `cleanupOutdatedCaches` to workbox config |
| `src/main.tsx` | Wire up `onNeedRefresh` callback to auto-activate new service worker |

No design changes. No database changes. Backward compatible.


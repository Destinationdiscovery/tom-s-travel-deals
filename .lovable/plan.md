

# Remove Sign-In / Registration for Now

Remove all user-facing sign-in UI and auth prompts so there are zero barriers to entry. The AuthProvider stays in place (it's harmless and hooks like `useAuth` still need it to avoid crashes), but all visible sign-in buttons, modals, and gated pages are removed or simplified.

## Changes

### 1. Header -- Remove Sign In button and user menu
**File:** `src/components/Header.tsx`
- Remove the `AuthModal` import and rendering
- Remove the `authOpen` state
- Remove the Sign In button (desktop and mobile)
- Remove the user dropdown menu (My Reviews, My Trips, Sign Out)
- Keep everything else (nav links, theme toggle, mobile menu)

### 2. SaveReviewButton -- Remove auth gate
**File:** `src/components/SaveReviewButton.tsx`
- Remove the `AuthModal` import and rendering
- Remove the `authOpen` state and sign-in prompt logic
- Remove references to `isAuthenticated`
- When at limit, just show a simple "Limit reached" message instead of prompting sign-in
- Button text: just "Save to Compare" or "Saved" (no "Sign in to Save More")

### 3. Comments Section -- Allow anonymous commenting or remove sign-in gate
**File:** `src/components/comments/CommentsSection.tsx`
- Remove the "Sign in to comment" card with magic link form
- Either hide the comment composer entirely for non-logged-in users (simplest) or allow anonymous comments

### 4. Routes -- Remove My Reviews and My Trips from navigation
**File:** `src/App.tsx`
- Keep the routes (in case someone has a bookmarked URL) but they'll just redirect or show empty state
- No code change strictly needed here since the nav links are already removed from the Header

### 5. Keep AuthProvider in place
**File:** `src/App.tsx` -- No change
- The AuthProvider wrapper stays so that any `useAuth()` calls in hooks like `useSavedReviews`, `useReviewHistory`, and `CommentsSection` don't crash
- Those hooks gracefully handle `user === null` already

## What stays untouched
- `AuthProvider.tsx` and `AuthModal.tsx` files remain in the codebase (just unused for now)
- `useReviewHistory.ts` -- still works, just won't log to DB without a user
- `useSavedReviews.ts` -- still works with localStorage for anonymous users
- `GearAdmin.tsx` -- admin-only page, keeps its auth check
- Routes `/my-reviews` and `/my-trips` stay registered but are inaccessible from nav


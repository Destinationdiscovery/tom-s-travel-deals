

# Admin Dashboard Tab (Visible Only to You)

## What Changes

### 1. Header Component (`src/components/Header.tsx`)
- Add a "Dashboard" nav link that only renders when `isAdmin` is true from the auth context.
- This link will appear in both desktop and mobile navigation, but only when you are signed in as admin.
- Regular visitors will never see it.

### 2. No New Pages Needed (Yet)
- The Dashboard link will point to `/gear-admin` for now (your existing admin page).
- When you're ready for newsletter management later, we can create a proper `/dashboard` page with tabs for Gear Admin, Newsletter, etc.

## Technical Details

- Import `useAuth` in `Header.tsx` and destructure `isAdmin`.
- Conditionally render a "Dashboard" link (using a `Shield` icon for visual distinction) after the regular nav links.
- The link only appears when `isAdmin === true` -- meaning you must be signed in via `/admin-login` first.


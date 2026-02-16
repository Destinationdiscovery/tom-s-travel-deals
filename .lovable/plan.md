
# Compass Icon as Hidden Admin Login Button

## Overview
Turn the Compass icon in the header into a secret admin login trigger. Instead of navigating to a separate `/admin-login` page, clicking the compass icon will open a small login dialog right there. You'll sign in with email and password (replacing the current magic link approach), and only users with the admin role in the database will get access.

## Changes

### 1. Update AuthProvider to support email/password sign-in
**File:** `src/components/auth/AuthProvider.tsx`
- Add a `signInWithPassword(email, password)` method alongside the existing `sendMagicLink`
- This uses standard email/password authentication

### 2. Convert AdminLogin into a dialog component
**File:** `src/components/auth/AdminLoginDialog.tsx` (new file)
- Create a compact dialog/popover that contains:
  - Email + password fields (not magic link)
  - Sign in button
  - When signed in: shows status ("Admin access granted" or "Not admin") and sign out button
- This replaces the full-page `/admin-login` approach

### 3. Make the Compass icon open the admin dialog
**File:** `src/components/Header.tsx`
- The Compass icon (your logo icon) becomes clickable independently from the home link
- Clicking it opens the `AdminLoginDialog` as a popover/dialog
- The logo text ("ReviewThenGo") still links to home as normal
- No visible change to regular visitors -- they'd never know the compass is special

### 4. Keep the Dashboard link behavior
- Once signed in as admin, the "Dashboard" link still appears in the nav (as already implemented)
- The compass icon dialog also shows your signed-in status so you can sign out from there

### 5. Clean up
- Remove the `/admin-login` route from `App.tsx` since it's no longer needed
- Delete `src/pages/AdminLogin.tsx`

## Technical Details

**Authentication flow:**
- `supabase.auth.signInWithPassword({ email, password })` for login
- The `user_roles` table check remains the same for admin verification
- You'll need to set a password for your account (one-time via password reset flow, or we can set it up during implementation)

**Compass icon behavior:**
- Separated from the `<Link to="/">` wrapper so it can trigger the dialog independently
- Regular visitors clicking it just see a login form -- but they can't get admin access without the role in the database

**Security:**
- Admin access is still controlled by the `user_roles` table -- signing in alone doesn't grant admin
- The login dialog is visible to anyone who clicks the icon, but that's harmless since only accounts with the admin role get actual access


# Simplified Admin Login: Email/Password with Registration

## What Changes

### 1. Rewrite `AdminLoginDialog.tsx`
- Remove all magic link functionality (no `sendMagicLink`, no `magicLinkSent` state, no `sendingLink` state)
- Remove the "set password" section for logged-in users
- Add a **Register / Sign In toggle** so the first time you use it, you can create your account with email + password
- No "forgot password" link -- intentionally locked down to just you
- When signed in, show your email, admin status, and a Sign Out button (clean and simple)

### 2. Update `AuthProvider.tsx`
- Remove `sendMagicLink` from the context entirely
- Add a `signUp` method that calls `supabase.auth.signUp({ email, password })`
- The existing `handle_first_admin` database trigger will automatically grant admin role to the first registered user

### 3. Remove `ResetPassword.tsx` and its route
- Delete the `/reset-password` page since there's no forgot password flow
- Remove the route from `App.tsx`

## How It Works

The dialog behind the compass icon will have two modes toggled by a text link:

**Sign In mode (default):**
```
[Admin Sign In]
[Email field]
[Password field]
[Sign In button]
"No account? Register"
```

**Register mode:**
```
[Admin Register]
[Email field]
[Password field]
[Confirm Password field]
[Register button]
"Already have an account? Sign In"
```

**When signed in:**
```
[Admin Access]
you@email.com
Admin access granted (or not)
[Sign Out]
```

## Technical Details

- **Files modified:** `AdminLoginDialog.tsx`, `AuthProvider.tsx`, `App.tsx`
- **File deleted:** `ResetPassword.tsx`
- **No database changes needed** -- the existing `handle_first_admin` trigger already grants admin to the first user who registers
- Email confirmation is kept enabled (default behavior) so registration requires email verification before the account is active



# Fix Admin Login to Support Both Password and Magic Link

## Problem
Your account was created using a magic link, so no password was ever set. The new admin login dialog only has email/password fields, making it impossible to log in on a new browser session (like the preview) without a password.

## Solution
Update the `AdminLoginDialog` to offer both login methods:
1. **Email + Password** (primary) -- for when you eventually set a password
2. **Send Magic Link** (fallback) -- so you can always get in without a password

## Changes

### File: `src/components/auth/AdminLoginDialog.tsx`
- Add a "Send Magic Link" button below the password sign-in button
- When clicked, it sends a magic link to the entered email using the existing `sendMagicLink` method from AuthProvider
- Show a confirmation message after sending ("Check your email for a login link")
- Keep the password fields as the primary method for convenience

The dialog will look like:
```
[Email field]
[Password field]
[Sign In button]
── or ──
[Send Magic Link button]
```

No other files need to change -- `AuthProvider` already has the `sendMagicLink` method wired up.

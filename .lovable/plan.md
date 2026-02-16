

# Clean Admin Login Setup

## The Problem
The current flow has a "Register" option visible on the site, and the existing account was created via magic link so the password isn't working consistently between preview and published environments.

## The Solution

### Step 1: Collect your admin credentials
I'll prompt you for your email and password (like I do for API keys). These will be used to create/reset your admin account on the backend.

### Step 2: Create a one-time setup edge function
A backend function (`setup-admin`) that uses the service role key to either update the existing admin user's password or create a fresh admin account with the credentials you provide. This runs once and ensures your account works in both preview and published environments.

### Step 3: Simplify the login dialog
Remove ALL registration UI. The compass icon dialog will only show:

```
[Admin Sign In]
[Email field]
[Password field]
[Sign In button]
```

No "Register" link. No "Forgot Password" link. Nothing else. Just sign in.

When signed in, it shows your email, admin status, and Sign Out.

### Step 4: Remove signUp from AuthProvider
Since no one should ever register through the UI, the `signUp` method gets removed from the auth context entirely.

## Files Changed
- **`supabase/functions/setup-admin/index.ts`** -- New edge function to create/update admin credentials (run once, then can be deleted)
- **`src/components/auth/AdminLoginDialog.tsx`** -- Strip out register mode, confirm password field, and the toggle link
- **`src/components/auth/AuthProvider.tsx`** -- Remove `signUp` from context
- **`src/components/auth/AuthModal.tsx`** -- Remove register mode (sign-in only)

## Technical Details
- The edge function uses `supabase.auth.admin.updateUserById()` to set the password on your existing account (user ID: `6991cf75-b1d3-4cf0-873a-bca64f7bfaaa`)
- Your admin role is already in the database, so no DB changes needed
- After running the setup function once, you can sign in with your chosen password on both preview and published sites


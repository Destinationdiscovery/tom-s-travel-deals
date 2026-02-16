
# Add "Set Password" Page for Admin Login

## Problem
Your account was created via magic link, so no password exists. You need a way to set one directly in the preview environment.

## Changes

### 1. Create a `/reset-password` page
**New file:** `src/pages/ResetPassword.tsx`
- A simple form with "New Password" and "Confirm Password" fields
- On load, detects the `type=recovery` token in the URL hash (automatically set when you click a password reset link)
- Calls `supabase.auth.updateUser({ password })` to save the new password
- Shows success/error feedback

### 2. Add the route to App.tsx
**File:** `src/App.tsx`
- Add `<Route path="/reset-password" element={<ResetPassword />} />`

### 3. Add "Set Password" option in the Admin Login dialog
**File:** `src/components/auth/AdminLoginDialog.tsx`
- When already signed in (via magic link), show a "Set Password" section with two password fields and a save button
- This calls `supabase.auth.updateUser({ password })` directly (works because you're already authenticated)
- This way you can set a password without needing a reset email at all

### 4. Send a password reset email pointing to the preview URL
- Use the existing `send-password-reset` edge function to send a reset email
- The reset link will redirect to the preview site's `/reset-password` page where you can set your password

## Flow
Once implemented, you have two ways to set a password:
1. **If already signed in via magic link**: Use the "Set Password" section in the compass icon dialog
2. **If not signed in**: Click "Send Magic Link", sign in, then set password from the dialog -- or use the password reset email link

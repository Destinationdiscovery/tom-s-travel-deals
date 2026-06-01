## What's actually happening

Your database has 3 subscribers:
- `jclindustries@outlook.com` (you)
- `ttzeoul@gmail.com` (you)
- `test-user-123@example.com`

All three signed up **before** the `subscribe` function was updated to push new signups into MailerLite. That means **none of them were ever added to your MailerLite group**.

When you published, MailerLite did send to 3 contacts, but those are 3 contacts that already existed in that MailerLite group from somewhere else (manual adds, old imports, MailerLite test contacts). Your two real emails were never in the group, which is why you haven't received anything.

## The fix (two parts)

### 1. New edge function: `sync-subscribers-to-mailerlite`
Admin-only. Reads every `status = 'active'` row from the `subscribers` table and POSTs each one to `https://connect.mailerlite.com/api/subscribers` with `groups: [MAILERLITE_GROUP_ID]`. MailerLite treats duplicate emails as upserts, so it's safe to run repeatedly. Returns a count of how many were synced and how many failed.

### 2. New edge function: `test-mailerlite-connection`
Admin-only diagnostic. Calls three MailerLite endpoints and returns a JSON report:
- `GET /api/groups/{MAILERLITE_GROUP_ID}` to confirm the group exists and show its name + total subscriber count
- `GET /api/groups/{MAILERLITE_GROUP_ID}/subscribers?limit=50` to list who is actually in the group right now
- `GET /api/account` to confirm the API token is valid and show the verified sender domain

### 3. UI buttons in the Compass dashboard Settings tab
Replace the placeholder "Connect provider" cards in `SettingsPanel.tsx` with a real MailerLite panel containing:
- **Test connection** button — shows the diagnostic report in a dialog (group name, subscriber count, who's in the group, sender verification status)
- **Sync subscribers to MailerLite** button — runs the backfill and toasts the result

## After you click those two buttons

You'll immediately see whether your two emails are in the MailerLite group. If the sync adds them, the next Publish & Send will actually deliver to your inbox. If MailerLite reports the group already contains them but you still don't get mail, the diagnostic will tell us whether it's a sender-verification or deliverability problem instead.

## Files touched
- `supabase/functions/sync-subscribers-to-mailerlite/index.ts` (new)
- `supabase/functions/test-mailerlite-connection/index.ts` (new)
- `src/components/dashboard/compass/SettingsPanel.tsx` (rewritten)

No database changes, no new secrets.

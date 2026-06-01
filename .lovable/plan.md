# MailerLite integration for The Compass

Free tier: 1,000 subs, 12,000 emails/mo, automations + campaigns included. Manual publish only — no cron, no auto-send risk.

## 1. Secrets to add
- `MAILERLITE_API_TOKEN` — from MailerLite → Integrations → Developer API
- `MAILERLITE_GROUP_ID` — numeric ID of your "Compass Subscribers" group

## 2. MailerLite account setup (you do this once)
1. Verify sender email at mailerlite.com
2. Create a Group called "Compass Subscribers"
3. Create an Automation: Trigger = "When subscriber joins group: Compass Subscribers" → Action = send welcome email with a link to `https://www.reviewthengo.com/compass` (latest edition)
4. Grab API token + Group ID, paste into Lovable secrets

## 3. Sync subscribers to MailerLite on signup
Edit `supabase/functions/subscribe/index.ts`:
- After successful Supabase upsert, POST to `https://connect.mailerlite.com/api/subscribers` with email, fields (source, interests as comma string), and `groups: [MAILERLITE_GROUP_ID]`
- Fail open: MailerLite errors logged but don't block the user signup
- MailerLite's automation handles the welcome email automatically

## 4. Schema additions
Migration adds to `compass_editions`:
- `published_at timestamptz`
- `mailerlite_campaign_id text`

## 5. New edge function: `publish-compass-edition`
- Admin-guarded via `requireAdmin`
- Input: `{ edition_id }`
- Loads edition, requires `status = 'ready'` and non-empty `full_html` + `subject_line`
- POST `https://connect.mailerlite.com/api/campaigns` with type=regular, subject, from, html, filter targeting the Compass group
- POST `/campaigns/{id}/schedule` with delivery=instant
- Update edition: `status='sent'`, `sent_at=now()`, `published_at=now()`, `mailerlite_campaign_id`, `subscriber_count` (live count from subscribers table)

## 6. Dashboard UI changes
`CompassDashboard.tsx` action column gets two new buttons per row:
- **Mark Ready** (yellow, for `draft` only) — flips status to `ready`
- **Publish & Send** (green, for `ready` only) — opens AlertDialog "Send edition #N to {activeSubs} subscribers now?", then invokes `publish-compass-edition`
- `sent` rows show subject + "Sent {date} to N" — Publish hidden
- Disable both for editions with no `full_html`

## 7. SettingsPanel update
Replace the placeholder Mailchimp/Kit/Brevo cards with a single MailerLite status card showing "Connected" if both secrets exist (checked via a tiny `mailerlite-status` edge function or just assumed-present), plus link to MailerLite dashboard.

## 8. Memory update
Replace the Kit/Resend welcome memory with one describing MailerLite as the active newsletter provider, the welcome-via-group-automation pattern, and the manual Publish flow.

## Files
- New: `supabase/functions/publish-compass-edition/index.ts`
- New: migration adding `published_at` + `mailerlite_campaign_id` columns
- Edit: `supabase/functions/subscribe/index.ts`
- Edit: `src/components/dashboard/compass/CompassDashboard.tsx`
- Edit: `src/components/dashboard/compass/SettingsPanel.tsx`
- Memory: update `mem://integrations/resend/welcome-email-status` (or add `mem://integrations/mailerlite/newsletter-integration`)

## Out of scope (by your request)
- No cron / auto-send
- No RSS feed for MailerLite (manual publish is enough)
- No open/click rate import (MailerLite dashboard shows these)

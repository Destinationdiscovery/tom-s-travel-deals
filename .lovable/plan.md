

## Postmark Email Campaigns Setup

This will store your Postmark API token securely and create three email automation edge functions.

---

### Step 1: Store the Postmark API Token

Your Postmark Server API Token will be stored as a secret called `POSTMARK_SERVER_TOKEN` so the edge functions can use it securely.

---

### Step 2: Create Edge Functions

**a) Welcome Email** (`supabase/functions/send-welcome-email/index.ts`)
- Called from the client after a user signs up (triggered on first auth state change)
- Sends a branded "Welcome to ReviewThenGo" email via Postmark's `/email` API
- Includes links to popular destinations on the site
- Uses the user's email from the auth session

**b) Weekly Digest** (`supabase/functions/send-weekly-digest/index.ts`)
- Scheduled via a cron job (runs once per week)
- Queries all users with `newsletter_opt_in = true`
- Fetches the newest `cached_reviews` from the past 7 days
- Personalizes content based on the user's `user_review_history` locations
- Includes affiliate booking links for each featured review
- Adds an unsubscribe link that sets `newsletter_opt_in = false`

**c) Trip Reminder** (`supabase/functions/send-trip-reminder/index.ts`)
- Scheduled via cron (every 3 days)
- Finds users with saved trip lists who haven't visited in 7+ days
- Sends "Still planning your [Trip Name]?" emails with affiliate links

---

### Step 3: Cron Scheduling

Set up two cron jobs using `pg_cron` and `pg_net`:
- Weekly digest: runs every Monday at 9 AM UTC
- Trip reminder: runs every 3 days at 10 AM UTC

---

### Step 4: Client-Side Integration

Update `AuthProvider.tsx` to call the welcome email function when a new user signs up for the first time.

---

### Step 5: Unsubscribe Endpoint

Add an unsubscribe handler (either as a new edge function or a route in the app) that toggles `newsletter_opt_in` to `false` for the user.

---

### Technical Details

**Postmark API call pattern** (used in all 3 functions):
```text
POST https://api.postmarkapp.com/email
Headers:
  X-Postmark-Server-Token: <POSTMARK_SERVER_TOKEN>
  Content-Type: application/json
Body:
  From: "ReviewThenGo <noreply@your-verified-domain.com>"
  To: user@example.com
  Subject: ...
  HtmlBody: ...
```

**Files created/modified:**
| Action | File |
|--------|------|
| Create | `supabase/functions/send-welcome-email/index.ts` |
| Create | `supabase/functions/send-weekly-digest/index.ts` |
| Create | `supabase/functions/send-trip-reminder/index.ts` |
| Modify | `src/components/auth/AuthProvider.tsx` — trigger welcome email on first sign-up |
| Modify | `supabase/config.toml` — add function entries with `verify_jwt = false` |
| SQL | Cron job setup for weekly digest and trip reminders |

**Pre-requisite question:** What is the verified sender email/domain you have set up in Postmark? (e.g., `noreply@reviewthengo.com`). This is needed for the "From" address in outgoing emails.


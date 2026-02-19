

# Three New Features for Agent HQ

## 1. Add Client Button (Clients Tab)

Add an "Add Client" button to the top of the Clients tab. Clicking it opens a dialog where you can enter a client's name, email, and optional notes. This creates a minimal placeholder record in the database so the client file exists for future quotes and bookings.

Since clients are currently derived from the `client_quotes` table, the new client will be inserted as a draft quote with resort name "General Inquiry" and $0 price. This means the client immediately appears in all client dropdowns across the dashboard (Quote Builder, Calendar, Email Composer) without any architecture changes.

**File: `src/components/dashboard/ClientList.tsx`**
- Add "Add Client" button next to the heading
- Add a dialog with fields: Client Name, Client Email, Notes
- On save: insert into `client_quotes` with `resort_name: "General Inquiry"`, `status: "draft"`, `total_price: 0`
- Refresh the client list after saving

No database changes needed.

---

## 2. Deadline Alert System (Cron + Email + Dashboard)

### Dashboard Notifications
Add a notification bell icon to the dashboard header area. When there are upcoming deadlines (deposit due, final payment) within the next 3 days or overdue, show a red badge count. Clicking opens a dropdown showing the urgent items.

### Email Alerts via Cron Job
Create a backend function that runs daily, checks for bookings due within 3 days (deposit_due, final_payment types that are not completed), and sends an alert email to your admin address.

**Implementation:**
- **New edge function: `supabase/functions/deadline-alerts/index.ts`**
  - Queries `bookings` table for incomplete events where `event_date` is within the next 3 days or overdue
  - Groups them by type (deposit_due, final_payment)
  - Sends an email summary using Resend API (free tier: 100 emails/day)
  - Returns a summary for logging

- **Cron job** (scheduled via pg_cron): Runs once daily at 8:00 AM, calls the deadline-alerts function

- **New secret needed**: `RESEND_API_KEY` -- Resend offers a free tier and is simple to set up. You sign up at resend.com, verify your domain or use their test domain, and get an API key.

- **New secret needed**: `ADMIN_ALERT_EMAIL` -- your Outlook email address where alerts get sent

- **Dashboard notification widget**: Added to `DashboardOverview.tsx` -- a prominent alert card at the top when there are items due within 3 days, styled with warning colors

**Database change**: None needed, uses existing `bookings` table.

---

## 3. Deal Maker / Creator Tab

A new "Deals" tab in the sidebar for creating promotional marketing content. This uses AI to generate social media posts, email blast copy, and visual deal posters.

### Features:
- **Deal Form**: Enter deal details (destination, resort, price, dates, highlights, discount percentage)
- **Content Generator** (3 tabs):
  - **Social Media**: AI generates ready-to-post content for Instagram, Facebook, Twitter with hashtags and emojis. Copy-to-clipboard buttons for each platform.
  - **Email Blast**: AI generates a promotional email body using your deal details. One-click to send via the Email Composer tab.
  - **Deal Poster**: AI generates a visual promotional poster/flyer image using the deal details. Download button to save the image.

### Technical Details:

**New file: `src/components/dashboard/DealMaker.tsx`**
- Deal details form (destination, resort, price, original price, discount, dates, highlights textarea)
- Three output tabs: Social Media, Email Blast, Deal Poster
- Each tab has a "Generate" button
- Social media and email blast use text AI (Gemini Flash via existing Lovable AI)
- Deal poster uses image generation AI (Gemini Flash Image model)

**New edge function: `supabase/functions/generate-deal-content/index.ts`**
- Accepts deal details + content type (social, email, poster)
- For social/email: uses `google/gemini-3-flash-preview` to generate text content
- For poster: uses `google/gemini-2.5-flash-image` to generate a promotional image
- Returns generated content (text or base64 image)

**File: `src/components/dashboard/DashboardSidebar.tsx`**
- Add "Deals" tab with `Megaphone` icon after Emails
- Update `DashboardTab` type to include `"deals"`

**File: `src/pages/GearAdmin.tsx`**
- Import and render `DealMaker` component for the "deals" tab

**`supabase/config.toml`**
- Add `[functions.generate-deal-content]` and `[functions.deadline-alerts]` with `verify_jwt = false`

---

## Summary of All Changes

| Area | Files | Type |
|------|-------|------|
| Add Client | `ClientList.tsx` | Modified |
| Dashboard Alerts | `DashboardOverview.tsx` | Modified |
| Email Cron | `supabase/functions/deadline-alerts/index.ts` | New |
| Deal Maker UI | `src/components/dashboard/DealMaker.tsx` | New |
| Deal Content API | `supabase/functions/generate-deal-content/index.ts` | New |
| Sidebar + Router | `DashboardSidebar.tsx`, `GearAdmin.tsx` | Modified |

**Secrets needed before implementation:**
- `RESEND_API_KEY` -- for sending deadline alert emails (free at resend.com)
- `ADMIN_ALERT_EMAIL` -- your email address for receiving alerts




# Agent HQ Upgrades: Add Client, Deadline Alerts, Deal Maker, Quick Links

## 1. Add Client Button (Clients Tab)

An "Add Client" button at the top of the Clients page opens a dialog with fields for Client Name, Client Email, and Notes. On save, it inserts a placeholder record into `client_quotes` with resort name "General Inquiry", status "draft", and $0 price. The client then appears everywhere automatically.

**File changed:** `src/components/dashboard/ClientList.tsx`

---

## 2. Dashboard Deadline Alerts + Quick Links

### Urgent Deadlines Banner
A prominent warning card at the top of the Dashboard Overview that shows bookings due within the next 3 days (deposit_due, final_payment, etc.) that are not yet completed. Includes an "Open Outlook" button that opens your Outlook email in a new tab so you can quickly follow up.

### Quick Links Row
Three buttons after the Quick Actions row:
- **Outlook Email** -- opens https://outlook.cloud.microsoft/mail/
- **Sirev Booking** -- opens https://tob.sax.softvoyage.com/
- **Expedia TAAP** -- opens https://www.expediataap.ca/

**File changed:** `src/components/dashboard/DashboardOverview.tsx`

---

## 3. Quick Links in Email Sidebar

Replace the "Booking Portal" card (with its manual URL input/save) with a clean "Quick Links" card containing the same three buttons stacked vertically. No more typing/saving URLs.

**File changed:** `src/components/dashboard/EmailComposer.tsx`

---

## 4. Deal Maker / Creator Tab

A new "Deals" tab in the sidebar for creating promotional marketing content using AI.

### Deal Form
Enter deal details: destination, resort name, price, original price, discount percentage, travel dates, and highlights.

### Three Output Tabs
- **Social Media** -- AI generates ready-to-post content for Instagram, Facebook, and Twitter with hashtags and emojis. Copy-to-clipboard button for each.
- **Email Blast** -- AI generates a promotional email body. One-click copy or open in Outlook.
- **Deal Poster** -- AI generates a visual promotional image. Download button to save.

### How It Works
A new backend function receives the deal details and content type, then calls the AI to generate the content:
- Social media and email blast use `google/gemini-2.5-flash` for fast text generation
- Deal poster uses `google/gemini-2.5-flash` to generate a description, which is then used to create a visual poster layout in the browser (HTML/CSS rendered to a downloadable image)

**New files:**
- `src/components/dashboard/DealMaker.tsx` -- the full Deal Maker UI
- `supabase/functions/generate-deal-content/index.ts` -- backend function for AI content generation

**Files changed:**
- `src/components/dashboard/DashboardSidebar.tsx` -- add "Deals" tab with Megaphone icon
- `src/pages/GearAdmin.tsx` -- render DealMaker component for the deals tab

---

## Summary

| Change | Files | Type |
|--------|-------|------|
| Add Client dialog | `ClientList.tsx` | Modified |
| Deadline alerts + Quick Links | `DashboardOverview.tsx` | Modified |
| Quick Links in Email sidebar | `EmailComposer.tsx` | Modified |
| Deal Maker UI | `DealMaker.tsx` | New |
| Deal content AI | `generate-deal-content/index.ts` | New |
| Sidebar + routing | `DashboardSidebar.tsx`, `GearAdmin.tsx` | Modified |

No new API keys needed -- uses the existing AI gateway for content generation. No database changes required.


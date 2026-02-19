

# Agent HQ Dashboard Improvements

## What's Being Improved

Based on the current state of your dashboard, here are practical upgrades that will make your day-to-day workflow faster and more professional.

---

### 1. Dashboard Overview: Make It Actually Useful

Right now the overview page is mostly empty space. Improvements:

- **Revenue snapshot**: Show total quoted value (sum of all quote totals) and booked value (quotes with status "booked") as stat cards
- **Recent activity feed**: Show the last 5 actions (quote created, booking added, email sent) in a timeline format so you can see what you did recently at a glance
- **Upcoming deadlines widget**: Update to also show the new event types (deposit_due, trip_start, trip_end) with their proper colors -- currently it only recognizes the old 4 types
- **Today's events**: Highlight any events happening today in a prominent card at the top

### 2. Quote Builder: Streamline the Flow

- **Per-person pricing toggle**: Add a "price per person" checkbox that automatically divides the total by number of travellers and shows both on the preview (clients always ask "how much per person?")
- **Duplicate quote button**: On client files, add a "Duplicate" action so you can quickly create a variation of an existing quote for the same client (e.g. different room type or dates) without re-entering everything
- **Status badges with color**: Color-code quote statuses -- draft (gray), sent (blue), booked (green) -- so you can quickly scan which quotes need attention

### 3. Calendar: Better Visibility

- **List view toggle**: Add a simple list/agenda view alongside the grid calendar showing all events for the current month in a sortable table (client name, event type, date, booking number). Easier to scan than tiny calendar chips
- **Overdue highlighting**: Events that are past-due and not marked complete should show in red/warning style so you never miss a final payment deadline
- **Click-to-complete**: Allow clicking directly on a calendar chip to toggle complete status without opening the edit dialog

### 4. Client Files: Add a Dedicated Tab

- **New sidebar tab "Clients"**: Instead of burying client files inside the Quote Builder, give them their own section with a searchable list of all clients
- Each client card shows: name, email, number of quotes, booking status, last activity date
- Click into a client to see all their quotes and bookings in one place

### 5. Email Composer: Connect to Quotes

- **Auto-fill from quote**: Add a "Send Quote" button directly on the quote preview (Step 4) that opens the email composer pre-filled with the client's email, the quote link, and the appropriate template
- **Quote link insertion**: When composing an email, show a dropdown of existing quotes to insert the share link

---

## Technical Details

### Files to modify:

**`src/components/dashboard/DashboardOverview.tsx`**
- Add revenue stats (query `client_quotes` for `SUM(total_price)` grouped by status)
- Fix `eventColors` to include `deposit_due`, `trip_start`, `trip_end`
- Add "Today's Events" card querying bookings where `event_date = today`
- Add recent activity feed combining latest entries from `client_quotes`, `bookings`, and `email_log` sorted by `created_at`

**`src/components/dashboard/DashboardSidebar.tsx`**
- Add "Clients" tab with `Users` icon between Quote Builder and Calendar

**`src/components/dashboard/ClientList.tsx`** (new file)
- Dedicated client management view
- Query unique clients from `client_quotes` with aggregated stats
- Search/filter by name
- Click-through to see all quotes and bookings for that client

**`src/components/dashboard/QuoteBuilder.tsx`**
- Add "Duplicate" button next to "Book" in client file accordion
- Add per-person pricing toggle in Step 3 (Pricing)
- Color-code status badges (draft=gray, sent=blue, booked=green)
- Add "Send Quote" button on Step 4 preview that navigates to emails tab with pre-filled data

**`src/components/dashboard/BookingCalendar.tsx`**
- Add list/agenda view toggle (grid vs list)
- Add overdue styling for past incomplete events
- Add click-to-complete on calendar chips

**`src/pages/GearAdmin.tsx`**
- Add `ClientList` to the tab rendering
- Wire up "Clients" tab

### No database changes needed
All data is already stored -- these are purely UI/UX improvements using existing tables.


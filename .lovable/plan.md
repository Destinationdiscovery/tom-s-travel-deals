

# Travel Agent Dashboard -- The Ultimate Tool

## Overview

Transform the current admin dashboard into a full-featured travel agent command center with four new modules: Quote Builder, Booking Calendar, Client Email System, and a unified Dashboard Hub. The existing Gear Image admin stays as-is.

## New Modules

### 1. Dashboard Hub (replaces current GearAdmin as the landing view)
- Sidebar navigation with sections: Dashboard, Quote Builder, Calendar, Emails, Gear Images
- At-a-glance widgets: upcoming payments, recent quotes, bookings this month
- Quick-action buttons for common tasks

### 2. Quote Builder
- **Step 1 -- Select Resort**: Search for a destination using the existing AI review engine, or pick from cached reviews. The review summary auto-populates the quote.
- **Step 2 -- Vacation Details Form**: Flight info (airline, flight numbers, departure/arrival times, airports), hotel room type, dates, number of travellers, inclusions, special notes.
- **Step 3 -- Pricing**: Line items (flights, hotel, transfers, insurance, extras) with per-person and total pricing.
- **Step 4 -- Preview and Send**: Professional quote card with resort review highlights, trip details, and pricing. No affiliate links. Options to:
  - Download as PDF (browser print-to-PDF)
  - Copy a shareable web link (public quote page at `/quote/:id`)
  - Open in Outlook to email directly

### 3. Booking Calendar
- Monthly calendar view showing all bookings
- Event types with color coding: Booking dates, Final payment due, Departure, Return
- Click to add/edit events
- Upcoming deadlines panel on the side
- Data stored in a new `bookings` database table

### 4. Client Email System
- Pre-built email templates: Quote, Follow-up, Pre-departure, After-trip feedback
- Compose view that pre-fills template with client/booking data
- "Open in Outlook" button generates a `mailto:` link with subject, body pre-filled (works with your Outlook travel email)
- Link to booking portal for quick access
- Email log to track what was sent to whom

## Database Changes

Three new tables (all with RLS restricted to admin only):

**`client_quotes`** -- stores quote details
- id, created_at, client_name, client_email, resort_name, resort_review_slug, destination, check_in, check_out, num_travellers, flight_details (jsonb), line_items (jsonb), total_price, currency, notes, status (draft/sent/accepted/expired), share_token

**`bookings`** -- calendar events
- id, created_at, client_name, client_email, quote_id (FK to client_quotes), event_type (booking/final_payment/departure/return), event_date, title, notes, is_completed

**`email_log`** -- tracks sent communications
- id, created_at, client_name, client_email, email_type (quote/followup/pre_departure/after_trip), subject, booking_id (FK), quote_id (FK)

## New Pages and Routes

| Route | Page | Description |
|-------|------|-------------|
| `/gear-admin` | Dashboard Hub | Tabbed layout with all modules |
| `/quote/:token` | Public Quote View | Shareable client-facing quote (no auth required) |

## Email Approach -- Outlook Integration

Since you want to use your Outlook travel email:
- All email actions generate `mailto:` links pre-filled with subject, body (HTML-formatted), and recipient
- Clicking "Send via Outlook" opens your default email client with everything ready
- A text field in settings lets you store your booking portal URL for quick access
- The email log tracks that you initiated the email (date, recipient, type)

## Technical Details

### File Structure
- `src/pages/GearAdmin.tsx` -- Refactored into a tabbed dashboard with sidebar
- `src/components/dashboard/DashboardOverview.tsx` -- At-a-glance widgets
- `src/components/dashboard/QuoteBuilder.tsx` -- Multi-step quote form
- `src/components/dashboard/QuotePreview.tsx` -- Professional quote card for PDF/sharing
- `src/components/dashboard/BookingCalendar.tsx` -- Monthly calendar with events
- `src/components/dashboard/EmailComposer.tsx` -- Template-based email composer
- `src/components/dashboard/EmailTemplates.ts` -- Pre-built email template strings
- `src/pages/PublicQuote.tsx` -- Public shareable quote view (no auth)
- New route `/quote/:token` added to App.tsx

### Calendar Implementation
- Built with a custom month-grid component using `date-fns`
- No external calendar library needed -- keeps it lightweight
- Events rendered as colored dots/pills on each day

### Quote PDF
- Uses browser `window.print()` with a print-optimized CSS layout
- Clean, professional output with resort image, review highlights, flight details, and pricing table

### Public Quote Page
- Accessed via `/quote/:shareToken`
- RLS policy allows public SELECT when matching the share_token
- Professional client-facing view with your branding, no admin controls


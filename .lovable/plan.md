

# Booking Report: AI-Generated Markdown Approach

## The Problem

The current `BookingReport.tsx` is ~2,000 lines of rigid card/table components that try to shoehorn extracted data into predefined layouts. When data is missing or structured differently, it looks broken. The quote builder solved this exact problem by letting AI generate free-form markdown.

## The Solution

Mirror the quote builder pattern exactly:

1. **New edge function `generate-booking-report`** — Takes the booking data from `booking_details` (rooms, passengers, itinerary, flights, pricing, payment history, extras) plus any newly uploaded document images, and produces a rich markdown report. The AI decides how to format it — prose summaries, markdown tables for itineraries, passenger lists, payment schedules, etc.

2. **New column `report_markdown`** on `booking_details` — Stores the generated markdown, just like `quote_markdown` on `client_quotes`.

3. **New column `total_value`** on `booking_details` — Clean numeric field for revenue tracking (extracted from pricing by AI).

4. **Redesigned `BookingReport.tsx`** — Dramatically simplified:
   - Hero header with trip name, destination, dates, status
   - Full-width `ReactMarkdown` render of `report_markdown` (same prose styling as QuotePreview)
   - "Generate Report" / "Re-generate" button that calls the edge function
   - Inline markdown editor toggle (edit the markdown directly, save back)
   - Document upload/gallery section (existing functionality preserved)
   - AI chat kept for adding new documents and triggering re-generation
   - Delete booking button preserved

5. **Revenue fix in `DashboardOverview.tsx`** — Query `booking_details.total_value` and combine with `client_quotes` revenue.

## Edge Function Design (`generate-booking-report`)

Input: `{ bookingData, files[] }` — the full booking_details record plus any new document images (base64).

The AI prompt instructs it to produce a comprehensive, beautifully formatted markdown report covering:
- Trip overview (destination, dates, supplier, ship if cruise)
- Flights (formatted as a clean table or visual layout)
- Rooms/Cabins with passenger assignments
- Cruise itinerary (if applicable) as a table
- Pricing breakdown
- Payment history/timeline
- Extras and special requests
- Any other details found in documents

Also returns `{ markdown, metadata: { total_value } }` so we can populate the revenue field.

## Key Differences from Current System

| Current | New |
|---------|-----|
| 2000-line rigid component tree | ~400-line page: header + markdown + docs |
| Card grid that breaks with missing data | AI adapts format to available data |
| Flights/passengers hidden in sub-components | Everything in one flowing document |
| Can't easily edit displayed info | Toggle to edit markdown directly |
| No revenue tracking | `total_value` column + dashboard integration |

## Files

| File | Action |
|------|--------|
| DB migration | Add `report_markdown text`, `total_value numeric DEFAULT 0` to `booking_details` |
| `supabase/functions/generate-booking-report/index.ts` | New edge function |
| `supabase/config.toml` | Add function config |
| `src/pages/BookingReport.tsx` | Rewrite — markdown-first layout |
| `src/components/dashboard/DashboardOverview.tsx` | Add booking revenue query |
| `src/components/dashboard/BookingManager.tsx` | Show total_value per client |

## Implementation Order

1. DB migration (add columns)
2. Edge function
3. BookingReport rewrite
4. Revenue fix
5. BookingManager updates




# Route Updates to Full Report After Chat Updates

## Problem
When you upload new documents via the chat bar on the Client File page, the AI extracts the data and saves it correctly to `booking_details`, but you stay on the Client File page which only shows a condensed summary card with extras as small badge "bubbles." The full report at `/booking/:bookingNumber` has the rich, magazine-style layout -- but you never get taken there after an update.

## Solution
After a successful `add_to_booking` update from the chat bar on the Client File page, automatically navigate to the full Trip Report page (`/booking/:bookingNumber`) so you immediately see all the extracted information in the beautiful full-page layout.

## What Changes

### `src/pages/ClientFile.tsx`
In the `handleChatSend` function, after a successful `add_to_booking` action:
- After uploading files and upserting booking details, navigate to `/booking/{bookingNumber}` instead of just refreshing the Client File page
- The toast will confirm the update, then the full report opens with all the newly merged data displayed in the rich layout

For `create_booking` action:
- Same behavior -- after creating the new booking and saving details, navigate to the new booking's full report page

### No other file changes needed
The BookingReport page already fetches fresh data on mount, so navigating there will display the latest merged information automatically.

## Technical Details

The change is small -- in the `handleChatSend` function:
- After `add_to_booking`: replace `await fetchAll()` with `navigate(\`/booking/\${encodeURIComponent(d.booking_number)}\`)`
- After `create_booking`: replace `await fetchAll()` with `navigate(\`/booking/\${encodeURIComponent(d.booking_number)}\`)`

This mirrors the same pattern as the "Full Report" button already on each booking card, just automated after a successful AI update.


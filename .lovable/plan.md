

# Fix Room Booking Numbers Display and Chat Room Updates

## Problem 1: Booking Numbers Not Showing on Room Cards

The existing rooms in the database were created before the `booking_number` and `cruise_line_booking_number` fields were added to the room structure. The auto-migration only runs for legacy data with no rooms array, so existing rooms remain without these fields.

## Problem 2: Chat Creates New Booking Instead of Updating Room

When you upload a document via the chat and say "add this to Room 3", two things go wrong:

- The AI receives `existing_bookings: []` (an empty array), so it has no context about the current booking and treats the document's unique booking number as a brand-new booking
- The chat handler has no room-aware logic -- it merges data at the booking level, not into a specific room

## Changes

### File: `src/pages/BookingReport.tsx`

**1. Pass existing bookings context to the chat AI call (line 787)**

Send the current booking number and all room booking numbers as `existing_bookings` so the AI knows this trip already exists. This prevents it from calling `create_booking`.

```typescript
existing_bookings: [
  { bookingNumber: bookingNumber, clientName: clientName, title: resortName },
  ...rooms.map(r => ({
    bookingNumber: r.booking_number,
    clientName: clientName,
    title: `${resortName} - ${r.label}`
  })).filter(r => r.bookingNumber)
]
```

**2. Add room-aware handling in the chat response (lines 792-803)**

When the AI returns `add_to_booking` with data, check if the user's message references a specific room (e.g., "room 3"). If so, merge the extracted passengers, cabin info, pricing, and booking numbers into that room's entry in the `rooms` array, rather than the top-level booking.

Logic:
- Parse the chat message for a room number reference (e.g., "room 3", "Room 3")
- If a room number is found and that room exists, update that room's fields (passengers, cabin details, pricing, booking_number, cruise_line_booking_number)
- Also merge any top-level data (flight details, extras) into the booking as before

**3. Also pass existing bookings to the Add Room AI call (line 647)**

Same fix for the "Add Room" dialog -- pass existing bookings so the AI uses `add_to_booking` or at minimum returns extracted data without conflicting.

### File: `supabase/functions/booking-assistant/index.ts`

**4. Update the system prompt to be smarter about room context**

Add instructions telling the AI that when the user says "add this to Room X" for an existing booking, it should always use `add_to_booking` with the existing booking number (the trip-level one), not treat the document's booking number as a new booking. The room-level booking numbers are metadata to store, not trip identifiers.

Add to the system prompt:
```
ROOM UPDATES FOR EXISTING BOOKINGS:
When the user explicitly says to add data to a specific room (e.g., "add this to Room 3") 
for an existing booking, ALWAYS use add_to_booking with the EXISTING booking number from 
the context, not the booking number found in the uploaded document. The document's booking 
number is a room-level reference to be stored as metadata, not a trip identifier.
Include the extracted booking_number and cruise_line_booking_number in the response so the 
frontend can store them on the specific room.
```

## Summary of Behavior After Fix

1. When you upload a document via chat and say "add this to Room 3", the AI will use `add_to_booking` with the existing trip booking number
2. The frontend will detect the "Room 3" reference and merge passengers, cabin info, pricing, and booking numbers into Room 3
3. Each room card will display its specific booking numbers (Encore and cruise line) as badges




# Fix Multi-Cabin: Return All Tool Calls and Merge Arrays Properly

## The Problem

Two bugs are preventing multi-cabin support from working:

1. **Edge function drops extra cabins**: When the AI sees documents for 3 different booking numbers, it may return 3 separate `create_booking` tool calls in one response. But the edge function only returns the first one (`tool_calls[0]`), so cabins 2 and 3 are silently lost.

2. **Rescan overwrites instead of creating**: The rescan and chat handlers only process a single action response. Even when the AI correctly identifies a new booking number, the client code has no loop to handle multiple actions. And the upsert logic blindly overwrites `passengers`, `itinerary`, and `payment_history` arrays instead of merging them (only `extras` has merge logic).

## What Changes

### 1. Edge Function -- Return ALL tool calls

Instead of returning only `tool_calls[0]`, return the full array of tool calls so the client can process each cabin independently.

**Response shape changes from:**
```
{ action: "create_booking", data: {...}, message: "..." }
```

**To:**
```
{ 
  actions: [
    { action: "create_booking", data: {...} },
    { action: "create_booking", data: {...} },
    { action: "add_to_booking", data: {...} }
  ],
  message: "..."
}
```

The old single-action format (`action` + `data`) is kept as a fallback for backward compatibility.

### 2. ClientFile -- Process multiple actions

Both the rescan handler and the chat handler are updated to loop through the `actions` array, creating or updating each booking independently. Each `create_booking` action creates its own `booking_details` record and calendar entries. Each `add_to_booking` merges into the matching record.

### 3. Upsert Logic -- Merge arrays, don't overwrite

The `upsertBookingDetails` function gets smart merge logic for `passengers`, `itinerary`, and `payment_history` -- matching the existing pattern used for `extras`:

- **Passengers**: Merge by name (don't duplicate if a passenger with the same name already exists, but update their details)
- **Itinerary**: Merge by date+port (avoid duplicate port entries)
- **Payment History**: Merge by date+amount (avoid duplicate payment records)

### 4. BookingReport -- Same upsert fix

The BookingReport page has its own rescan logic that also needs the same array-merge fix.

## Technical Details

### Files Modified

- `supabase/functions/booking-assistant/index.ts` -- return all tool calls in an `actions` array
- `src/pages/ClientFile.tsx` -- loop through `actions`, smart array merging in upsert
- `src/pages/BookingReport.tsx` -- same smart array merging in its upsert logic

### No database changes needed

The schema already supports this. The fix is purely in the data flow logic.

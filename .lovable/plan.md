
# Add Flight Button for Manual Flight Entry

## Problem

The AI extraction only captures the outbound flight when uploading two separate one-way flight documents. There's no manual way to add or edit individual flight legs, so the return flight never gets populated.

## Solution

Add an "Add Flight" button next to the Flight Itinerary card (or shown when no flights exist) that opens a dialog for manually entering outbound and/or return flight details. This mirrors the existing "Add Room" pattern.

## Changes

### File: `src/pages/BookingReport.tsx`

**1. Add state for the Add Flight dialog**

New state variables alongside the existing Add Room state:
- `addFlightOpen` (boolean)
- `addFlightForm` (object with outbound/return leg fields)

**2. Create an Edit Flight Dialog component**

A dialog with two sections (Outbound and Return), each containing fields for:
- Airline
- Flight Number
- Departure Airport
- Departure Time
- Arrival Airport
- Arrival Time

Pre-populated with existing flight data if available, so users can also edit/add the missing return leg.

**3. Save handler**

On save, merge the form data into `bookingDetails.flight_details` and update the database:
```typescript
const handleSaveFlight = async () => {
  const flightDetails = {
    outbound: hasValues(outboundForm) ? outboundForm : existingOutbound,
    return: hasValues(returnForm) ? returnForm : existingReturn,
  };
  await supabase.from("booking_details").update({ flight_details: flightDetails }).eq("booking_number", bookingNumber);
  // refresh data
};
```

**4. UI placement**

- Always show the Flight Itinerary card (not conditionally on `hasFlightDetails`)
- Inside the card header, add an edit/add button
- If no flights exist, show the "Add Flight" button as a dashed outline button (same style as "Add Room")
- If flights exist, show a small pencil/edit icon in the card header to open the same dialog

This ensures:
- Users can manually add either or both flight legs
- Users can edit existing flight data
- The return flight can be added independently of the outbound
- No dependency on the AI correctly merging two one-way flights

## Technical Details

### New State (near line 384)
```typescript
const [addFlightOpen, setAddFlightOpen] = useState(false);
```

### Flight Dialog (after the Add Room Dialog, near line 1591)
A `Dialog` with form fields for outbound and return legs, pre-filled from existing `bookingDetails?.flight_details`.

### Flight Card Update (lines 1109-1122)
Replace the conditional rendering to always show the card, with an add/edit button in the header:
```typescript
<Card className="overflow-hidden">
  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
    <h3 className="text-sm font-semibold flex items-center gap-2">
      <Plane className="h-4 w-4 text-primary" /> Flight Itinerary
    </h3>
    <Button variant="ghost" size="sm" onClick={() => setAddFlightOpen(true)}>
      {hasFlightDetails ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
      {hasFlightDetails ? "Edit" : "Add Flight"}
    </Button>
  </div>
  <CardContent className="p-5 space-y-4">
    {hasFlightDetails ? (
      <>
        <FlightLeg label="Outbound" leg={bookingDetails.flight_details.outbound} />
        <FlightLeg label="Return" leg={bookingDetails.flight_details.return} />
      </>
    ) : (
      <p className="text-sm text-muted-foreground text-center py-4">No flights added yet.</p>
    )}
  </CardContent>
</Card>
```

### Save Logic
Updates the `flight_details` JSONB column on `booking_details`, preserving any existing leg data while allowing individual legs to be added or edited.

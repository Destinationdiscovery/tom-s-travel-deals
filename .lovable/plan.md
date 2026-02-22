

# Add Edit & Delete Capabilities to Booking Admin

## Overview

Two main areas of work:

1. **Inline editing** for all read-only fields in the Trip Report (BookingReport.tsx) -- client name, email, destination, supplier, resort name, agency, agent, rate code, room type, ship name, duration, booking status, cabin details, extras, and event dates/notes.

2. **Delete attachments** from the Documents & Photos section in both BookingReport and ClientFile.

---

## 1. Editable Trip Overview Fields (BookingReport.tsx)

Currently the "Trip Overview" card and "Quick Facts" sidebar display data as read-only `DetailRow` components. The plan is to add an "Edit Trip Details" button that opens a dialog with all top-level booking fields pre-populated, letting you change any value and save.

### What changes

- Add a new `EditBookingDialog` component inside BookingReport.tsx
- It will contain form fields for: client name, client email, supplier, resort name, destination, room type, ship name, cabin category, cabin number, deck, bed configuration, rate code, agency, booking agent, booking status, duration (nights), balance due, balance due date
- An "Edit" (pencil) button will be added to the Trip Overview card header
- On save, it updates the `booking_details` row and also updates corresponding `bookings` rows (client_name, client_email, supplier) so everything stays in sync
- After save, `fetchAll()` is called to refresh the page

### Events Timeline -- editable dates and notes

- Each event in the timeline will get a small pencil icon
- Clicking it opens a mini dialog to edit the event date and notes
- Saves directly to the `bookings` table

### Extras -- edit and delete

- Each extras badge gets a small X to delete it
- An "+ Add Extra" button is added to add new label/value pairs

---

## 2. Delete Attachments (BookingReport.tsx + ClientFile.tsx)

### BookingReport.tsx -- Documents & Photos card

- Add a delete (trash) button next to each document and photo
- Clicking triggers a confirmation dialog
- On confirm, deletes the file from the `booking-documents` storage bucket using `supabase.storage.from("booking-documents").remove([path])`
- Refreshes the documents list

### ClientFile.tsx -- Document gallery

- Same pattern: add a delete button on each file/image tile
- Confirmation dialog before deletion
- Removes from storage and refreshes

---

## Technical Details

### New state variables in BookingReport.tsx
- `editDetailsOpen` (boolean) -- controls the edit dialog
- `editDetailsForm` (object) -- holds all editable fields
- `editEventTarget` (object | null) -- event being edited
- `deletingDocName` (string | null) -- document pending deletion confirmation

### EditBookingDialog fields
```text
client_name, client_email, supplier, resort_name, destination,
room_type, ship_name, cabin_category, cabin_number, deck,
bed_configuration, rate_code, agency, booking_agent,
booking_status, duration_nights, balance_due, balance_due_date
```

### Save logic for trip details
```typescript
// Update booking_details
await supabase.from("booking_details").update(editDetailsForm).eq("booking_number", bookingNumber);

// Sync client_name/email/supplier to bookings table
await supabase.from("bookings").update({
  client_name: editDetailsForm.client_name,
  client_email: editDetailsForm.client_email,
  supplier: editDetailsForm.supplier,
}).eq("booking_number", bookingNumber);
```

### Delete document logic
```typescript
const deleteDocument = async (fileName: string) => {
  const clientSlug = slugify(clientName);
  await supabase.storage.from("booking-documents").remove([`${clientSlug}/${fileName}`]);
  setDocuments(prev => prev.filter(d => d.name !== fileName));
  toast({ title: "Document deleted" });
};
```

### Files modified
- **src/pages/BookingReport.tsx** -- Add EditBookingDialog, edit event dialog, delete document buttons, extras management
- **src/pages/ClientFile.tsx** -- Add delete document buttons with confirmation

### No database migrations needed
All editable fields already exist in the `booking_details` and `bookings` tables. Storage deletion uses existing bucket policies (admin-only).




# Add Edit and Delete Passenger Functions

## What Changes

### 1. Delete Passenger

Add a trash icon button to each passenger card. Clicking it shows a confirmation dialog. On confirm, the passenger is removed from the `passengers` JSONB array in the database and the UI updates immediately.

### 2. Edit Passenger

Add a pencil/edit icon button to each passenger card. Clicking it opens a dialog pre-filled with the passenger's current details (name, DOB, citizenship, passport number, passport expiry, traveller type, gender). The agent can update any field and save, which updates the specific passenger entry in the JSONB array.

### How It Works

Both operations work directly on the `passengers` JSONB array stored in `booking_details`:

- **Delete**: Filter out the passenger by index, then update the database
- **Edit**: Replace the passenger object at that index with updated values, then update the database

No database migration needed -- this is purely UI + existing column updates.

## Technical Details

### Files Modified

- `src/pages/BookingReport.tsx`
  - Convert `PassengerCard` from a simple display component to one that accepts `onEdit` and `onDelete` callback props
  - Add edit (Pencil) and delete (Trash2) icon buttons to the passenger card header
  - Add an `EditPassengerDialog` component with form fields for: name, DOB, citizenship, passport number, passport expiry, traveller type, gender
  - Add a delete confirmation using the existing `AlertDialog` component
  - Add handler functions `handleDeletePassenger(index)` and `handleEditPassenger(index, updatedData)` that:
    1. Update the `passengers` array in local state
    2. Persist the change to the `booking_details` table via Supabase update
    3. Show a toast confirmation

### UI Layout

Each passenger card gets two small icon buttons in the top-right corner:

```text
+-----------------------------------------------+
|  [Avatar] Passenger Name        [Edit] [Delete]|
|           Adult (Male)                         |
|  DOB: Jan 1, 1990                              |
|  Passport: ****1234                            |
+-----------------------------------------------+
```

The edit dialog contains a simple form with labeled inputs for each passenger field, plus Save and Cancel buttons.


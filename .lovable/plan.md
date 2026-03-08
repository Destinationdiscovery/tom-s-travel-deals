

# Plan: Client Dropdown, Auto-Save, Delete Quotes & Delete Clients

## Changes

### 1. Client Name Dropdown with Autocomplete (AI Generate mode)

Replace the plain text `Input` for "Client Name" in the AI generate section (lines ~739-746) with a **combobox-style dropdown** that:
- Shows existing clients from `uniqueClients` as selectable options
- Allows typing a new name (free-text)
- When an existing client is selected, auto-fills email and ties the quote to that client folder (case-insensitive name match)
- Uses a simple popover + filtered list pattern (no new dependencies needed)

### 2. Auto-Save on Preview (Remove Manual Save)

- When the quote reaches step 4 (preview), **automatically save** it to the database immediately
- Remove the "Save" button from `QuotePreview.tsx` action bar
- Keep the auto-save on edit (existing 30s debounce) for when users go back and modify fields
- After AI generates a quote and jumps to preview, it auto-inserts/updates in `client_quotes` and sets `editingId`
- Show a brief "Saved" confirmation toast on auto-save

### 3. Delete Quote

- Add a **delete button** (trash icon) next to each quote in the "Recent Clients" accordion (lines ~679-696)
- Add a delete button next to each quote in the `ClientList.tsx` expanded view (lines ~206-224)
- Add a confirmation dialog before deletion
- Calls `supabase.from("client_quotes").delete().eq("id", quoteId)`
- Refreshes the quote list after deletion

### 4. Delete Client

- Add a **"Delete Client"** button in the `ClientList.tsx` expanded client section
- Confirmation dialog: "This will delete all quotes and bookings for [Name]. Are you sure?"
- Deletes all `client_quotes` where `client_name` matches (case-insensitive)
- Deletes all `bookings` where `client_name` matches (case-insensitive)
- Refreshes the client list

## Files Changed

| File | Change |
|------|--------|
| `src/components/dashboard/QuoteBuilder.tsx` | Client name combobox dropdown in AI mode; auto-save on step 4 entry; delete quote button in Recent Clients accordion |
| `src/components/dashboard/QuotePreview.tsx` | Remove Save button (auto-saved); keep other actions |
| `src/components/dashboard/ClientList.tsx` | Add delete quote button per quote row; add delete client button per client |


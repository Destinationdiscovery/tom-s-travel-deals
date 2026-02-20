

# AI-Powered Booking Assistant with Chat Interface

## What You Get

The Bookings tab gets a ChatGPT-style input bar at the bottom. You attach booking confirmations (screenshots, PDFs, photos) and type natural language instructions like:

- "Create a new booking under Leo Guddemmi and add all details from these files"
- "Add these files to the Laracy booking"
- "Create a booking for Sarah Chen from these confirmations"

The AI reads the documents, extracts all booking details (client, booking number, supplier, resort, dates), creates the booking record, generates all calendar events, and stores the uploaded files in a folder organized by client name.

## How It Works

1. You type a message and/or attach files in the chat-style input bar
2. Files are uploaded to cloud storage under a client folder (e.g., `leo-guddemmi/filename.pdf`)
3. The AI processes attached images/PDFs, extracts booking data, and determines the intent (new booking vs. add to existing)
4. For new bookings: creates the booking record and all calendar events automatically
5. For existing bookings: links the files and updates details if needed
6. A response message confirms what was created, with a summary card

## Technical Details

### 1. Storage Bucket (database migration)

Create a `booking-documents` storage bucket to hold uploaded files, with an RLS policy allowing admin access.

### 2. New Edge Function: `booking-assistant`

**File: `supabase/functions/booking-assistant/index.ts`**

- Accepts: base64-encoded file(s), file names, user message, list of existing bookings and clients
- Uses Lovable AI (google/gemini-2.5-flash) with tool calling to extract structured data from document images
- Tools defined for: `create_booking` (returns client name, email, booking number, supplier, resort, dates) and `add_to_booking` (returns booking number and file references)
- Handles 429/402 rate limit errors gracefully
- Returns structured action result (what was extracted, what to create)

Config: add `[functions.booking-assistant]` with `verify_jwt = false` to `supabase/config.toml`

### 3. Updated BookingManager Component

**File: `src/components/dashboard/BookingManager.tsx`**

Replace the "Add Booking" button with a sticky chat-style input bar at the bottom of the page:

- A text input with placeholder "Ask anything" (matching the reference screenshot style)
- An attachment button (paperclip icon) on the left that opens a file picker (accepts images and PDFs)
- Attached files shown as removable chips/thumbnails above the input
- A send button on the right
- Processing state shows a loading indicator with status text
- After AI processes: auto-creates the booking via the existing `handleSave` logic and shows a toast confirmation
- The manual "Add Booking" button remains available as a fallback in the header

The existing bookings table/list stays exactly as-is above the input bar.

### 4. File Upload Flow

When files are attached and the message is sent:
1. Upload each file to the `booking-documents` bucket under `{client-name-slug}/{filename}`
2. Convert images to base64 for the AI to read
3. Send to the `booking-assistant` edge function along with the text message, existing clients list, and existing bookings list
4. AI returns extracted data
5. Frontend creates booking entries in the `bookings` table (same logic as current form save)
6. Toast confirms success with summary of what was created

### No New Database Tables

Files go to cloud storage. Bookings use the existing `bookings` table. No schema changes needed beyond the storage bucket.


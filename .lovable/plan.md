

# Quote Builder Enhancement Plan

## Overview

12 improvements split across client-facing quote quality and agent workflow efficiency.

---

## Client-Facing Quote Improvements

### 1. Night Count Display
Auto-calculate nights from check-in/check-out dates and show "X nights" in both QuotePreview and PublicQuote alongside the date fields.

### 2. Room Type on Public Quote
The public quote (`/quote/:token`) currently omits room type. Add it to the details grid, reading from a new `room_type` column.

### 3. Inclusions on Public Quote
The public quote omits inclusions. Add inclusion badges, reading from a new `inclusions` column (text array).

### 4. Attachments on Public Quote
Show attached documents as downloadable links on the public quote using signed URLs.

### 5. Agent Contact Info
Add a footer section to both QuotePreview and PublicQuote with agent branding: name, phone, and email. Hardcoded for now (single-agent system).

### 6. Expiry Date
Add a "Valid Until" field (defaulting to 14 days from creation) shown on both preview and public quote. New `valid_until` column in `client_quotes`.

### 7. Resort Hero Image (from review data)
If `reviewData` contains a photo URL, display it as a hero banner at the top of the quote.

---

## Agent Ease-of-Use Improvements

### 8. Auto-Save Drafts
Debounced auto-save (every 30 seconds) when a quote has been saved at least once (has an `editingId`). Shows a subtle "Auto-saved" indicator.

### 9. Quick Status Update from Client List
Add a status dropdown directly on each quote row in the ClientList expanded view so agents can change status (draft/sent/accepted/booked/expired) without opening the full builder.

### 10. Per-Person Pricing Inline (Step 3)
Show per-person breakdown below the total in the Pricing step when travellers > 1.

### 11. Reorder Line Items (Drag handles)
Add up/down arrow buttons on each line item to reorder them in the pricing step.

### 12. Quote Templates
"Save as Template" button on pricing step and a "Load Template" dropdown. Templates stored in a new `quote_templates` table.

---

## Technical Details

### Database Changes

**Migration 1 -- Add columns to `client_quotes`:**
```sql
ALTER TABLE client_quotes ADD COLUMN IF NOT EXISTS room_type text;
ALTER TABLE client_quotes ADD COLUMN IF NOT EXISTS inclusions text[] DEFAULT '{}';
ALTER TABLE client_quotes ADD COLUMN IF NOT EXISTS valid_until date;
```

**Migration 2 -- Create `quote_templates` table:**
```sql
CREATE TABLE quote_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  line_items jsonb DEFAULT '[]',
  inclusions text[] DEFAULT '{}',
  currency text DEFAULT 'CAD',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage templates" ON quote_templates FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

### File Changes

**`src/components/dashboard/QuoteBuilder.tsx`:**
- Save `room_type`, `inclusions`, and `valid_until` in the payload
- Load them back on `loadQuote`
- Add per-person price display in Step 3
- Add up/down reorder buttons on line items
- Add auto-save with `useEffect` + `setTimeout` debounce (30s)
- Add "Save as Template" / "Load Template" controls in Step 3

**`src/components/dashboard/QuotePreview.tsx`:**
- Calculate and display night count between check-in/check-out
- Show "Valid until" date
- Add agent contact footer (hardcoded: name, phone, email)

**`src/components/dashboard/QuoteReviewSection.tsx`:**
- No changes needed

**`src/pages/PublicQuote.tsx`:**
- Add room type to details grid
- Add inclusions badges section
- Add attachments with signed URL downloads
- Add night count
- Add "Valid until" date
- Add agent contact footer

**`src/components/dashboard/ClientList.tsx`:**
- Add inline status dropdown on each quote row using `Select` component
- On change, update `client_quotes` status directly and refresh local state

**`src/integrations/supabase/types.ts`:**
- Auto-updated after migration (not manually edited)

### Helper: Night Count
```typescript
const getNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return null;
  const diff = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
  return diff > 0 ? diff : null;
};
```

### Auto-Save Logic
```typescript
useEffect(() => {
  if (!editingId) return;
  const timer = setTimeout(() => {
    handleSave();
  }, 30000);
  return () => clearTimeout(timer);
}, [quote, editingId]);
```

### Agent Contact (Hardcoded)
```typescript
const AGENT_INFO = {
  name: "Tom Laracy",
  phone: "",
  email: "tlaracy@travelonly.com",
  agency: "TravelOnly"
};
```


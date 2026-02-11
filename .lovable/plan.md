

# Product Image Library -- Two Upload Methods

## Summary
Build a product image library with **two ways to add images**: uploading in chat (I store them for you) and a dedicated admin page in the app for bulk management. Images are stored in a storage bucket and mapped to product keywords in a database lookup table.

## Upload Method 1: Chat Uploads
- You upload a product photo in chat and tell me the keyword (e.g., "packing cubes")
- I upload it to the `gear-images` storage bucket
- I insert a row in `gear_product_images` mapping the keyword to the public URL
- Instant confirmation

## Upload Method 2: Admin Page (`/gear-admin`)
- A dedicated page in the app where you can:
  - View all stored product images in a grid with their keywords
  - Upload new images via file picker + keyword input field
  - Delete existing entries (removes from both bucket and table)
  - Search/filter stored images
- Requires login to access

## How Images Get Used
1. User searches for a packing list on `/gear`
2. Perplexity returns product names (no imageUrl -- we stop asking for them)
3. Edge function queries `gear_product_images` table
4. For each product, checks if any stored keyword appears in the product name (case-insensitive)
5. Match found = real image attached; no match = placeholder shown

## Technical Details

### Database Migration

```sql
-- Lookup table
CREATE TABLE public.gear_product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_keyword text NOT NULL UNIQUE,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gear_product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gear images"
  ON public.gear_product_images FOR SELECT USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('gear-images', 'gear-images', true);

CREATE POLICY "Public read gear images"
  ON storage.objects FOR SELECT USING (bucket_id = 'gear-images');

CREATE POLICY "Auth users upload gear images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gear-images' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users delete gear images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gear-images' AND auth.role() = 'authenticated');
```

### Edge Function: `supabase/functions/travel-gear-intel/index.ts`

- Remove all `imageUrl` instructions from Perplexity prompts and system message
- After parsing Perplexity response, fetch all rows from `gear_product_images` (single SELECT)
- For each item, case-insensitive check if any `product_keyword` appears in the item name
- Attach matching `image_url` or leave as `null`

### New Page: `src/pages/GearAdmin.tsx`

- Grid display of all stored product images with keywords
- Upload form: file picker + keyword text input
- Uploads to `gear-images` bucket, inserts mapping into `gear_product_images`
- Delete button per entry
- Search/filter bar
- Protected behind authentication

### Route: `src/App.tsx`

- Add `/gear-admin` route pointing to `GearAdmin`

### Frontend Fallback: `src/pages/Gear.tsx`

- When `imageUrl` is missing or fails to load, show a styled placeholder image

### Cache Cleanup

- Clear `gear_intel_cache` table so new searches use the lookup table

## File Changes

| File | Action |
|------|--------|
| Database migration | Create `gear_product_images` table, `gear-images` bucket + policies |
| `supabase/functions/travel-gear-intel/index.ts` | Remove imageUrl from prompts, add keyword lookup |
| `src/pages/GearAdmin.tsx` | New admin upload/management page |
| `src/App.tsx` | Add `/gear-admin` route |
| `src/pages/Gear.tsx` | Add placeholder fallback |
| `gear_intel_cache` table | Clear stale data |

## First Test
After implementing, I'll store the Gonex packing cubes image you uploaded and map it to "packing cubes" so you can verify it appears in search results.


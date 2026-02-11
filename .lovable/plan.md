

# Add Carry-On Luggage Image to Product Library

## What
Store the uploaded Away carry-on suitcase photo in the `gear-images` storage bucket and map it to the keyword **"carry on"** in the `gear_product_images` table.

## Steps

1. **Copy the uploaded image** from `user-uploads://Screenshot_from_2026-02-10_22-14-08.png` to `src/assets/gear-carry-on.png`
2. **Upload to storage bucket** -- use the Supabase storage API to upload the image to the `gear-images` bucket
3. **Insert database row** -- add a record to `gear_product_images` with `product_keyword = "carry on"` and the public URL from the bucket

This follows the "Chat Upload" workflow from the plan. Once stored, any gear search result containing "carry on" in the product name will automatically show this image.


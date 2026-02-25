

# Fix: Gear Card Images Zoomed In

The gear card images appear overly zoomed/cropped because the image containers use fixed heights (`h-40`) or aspect ratios that don't match the source images well, combined with `object-cover` which crops to fill. The fix is to use `object-contain` or adjust the aspect ratio to show more of the image.

## Files to Change

### 1. `src/components/dashboard/GearImageManager.tsx`
- Change the image tag from `h-40 object-cover` to `aspect-[16/10] object-contain bg-muted` so the full image is visible within the card without aggressive cropping.

### 2. `src/components/GearPreviewSection.tsx`
- The cards already use `aspect-[16/10] overflow-hidden` with `object-cover`. Change to `object-contain bg-muted` so images fit without cropping.

### 3. `src/pages/Gear.tsx`
- Same fix for the gear cards on the /gear page if they also use `object-cover`.

## Approach
Replace `object-cover` with `object-contain` on all gear card images. Add a `bg-muted` background so any letterboxing blends with the card. This ensures the full product image is visible rather than being cropped/zoomed.


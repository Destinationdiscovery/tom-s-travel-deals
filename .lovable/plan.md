

# Increase Source Link Font Size

## What's Changing

The "Sources" section at the bottom of requirements, advisories, and news results will have larger, more readable text. Currently the source label and links use `text-xs` (12px) -- they'll be bumped up to `text-sm` (14px) so they're easier to spot and click.

## Technical Details

### File: `src/pages/TravelIntel.tsx`

Update the `Citations` component (around lines 63-75):
- Change the "Sources" label from `text-xs` to `text-sm`
- Change each source link from `text-xs` to `text-sm`
- Increase the external link icon from `h-3 w-3` to `h-3.5 w-3.5` to match


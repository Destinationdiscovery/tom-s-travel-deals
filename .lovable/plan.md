
# Style Inline Blog Images to Match Existing Articles

## Problem
When you upload images in the blog post creator, they appear in the article but are unstyled — no rounded corners, no full-width sizing, no consistent look with the hardcoded Compass articles.

## Fix

**File:** `src/pages/CompassArticle.tsx`

Update the image rendering in `renderContentBlock` (the `case "image"` block) to add proper styling classes to the `<img>` tag:

- `w-full` — makes the image span the full article width
- `rounded-xl` — adds rounded corners matching the site's design language
- `object-cover` — ensures consistent aspect ratio without distortion

**Before:**
```html
<img src={block.value} alt={...} loading="lazy" />
```

**After:**
```html
<img src={block.value} alt={...} loading="lazy" className="w-full rounded-xl object-cover" />
```

This is a one-line CSS class addition. All uploaded blog images will immediately look consistent with the rest of the site.

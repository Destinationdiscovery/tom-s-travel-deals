
# Add Links to Travel Requirements Results

## What's Changing

When the AI returns travel requirement items that mention forms, websites, or official portals (like the D'Viajeros form for Cuba), they'll now include clickable links so you can go directly to those resources instead of having to search for them yourself.

## How It Works

Two changes are needed:

### 1. Update the AI prompt to include URLs
The prompt sent to the AI will be updated to instruct it to include relevant URLs inline with each requirement item. For example, instead of just saying "Completed D'Viajeros mandatory travel form," it would say "Completed D'Viajeros mandatory travel form (https://dviajeros.mitrans.gob.cu)."

### 2. Make URLs clickable in the frontend
The bullet-point list items in the requirements results currently render as plain text. They'll be updated to automatically detect any URLs in the text and turn them into clickable links that open in a new tab -- styled in your site's primary color with an external-link icon.

---

## Technical Details

### Edge function change (`supabase/functions/travel-intel/index.ts`)
- Update the `requirements` prompt to instruct the AI: *"When mentioning any official forms, portals, or websites, include the full URL in parentheses after the mention."*

### Frontend change (`src/pages/TravelIntel.tsx`)
- Create a small `LinkifiedText` helper component that uses a regex to find URLs in text strings and wraps them in `<a>` tags with `target="_blank"` and appropriate styling.
- Update the `Section` component's `<li>` rendering to use `LinkifiedText` instead of plain text.

### Cache clearing
- Existing cached results won't have links, so stale cache entries for previously searched destinations will need to be cleared so the new prompt generates fresh results with URLs included.



# Plan: Add Travel Tips and Optional "Things to Do" to Quotes

## Changes

### 1. Update `generate-quote` Edge Function Prompt

Modify the AI prompt in `supabase/functions/generate-quote/index.ts` to **always include a "Travel Tips" section** in the generated markdown (5 practical insider tips for the property/destination). Also instruct the AI to include a "Things to Do Nearby" section by default, which can be removed later if not wanted.

Add a new parameter `includeThingsToDo` to the request body. When `false`, the prompt will explicitly say "Do NOT include a Things to Do section."

### 2. Add "Include Things to Do" Toggle in QuoteBuilder

In `src/components/dashboard/QuoteBuilder.tsx`, add a checkbox/switch below the "Extra Context" textarea in the AI generate section:

- **"Include Things to Do Nearby"** - checked by default
- Pass the value as `includeThingsToDo` to the `generate-quote` edge function call
- Travel Tips will always be included (no toggle needed)

### 3. Edge Function Prompt Updates

In the Gemini prompt (lines ~146-157 of `generate-quote/index.ts`):

**Always include:**
- "A 'Travel Tips' section with 5 numbered practical insider tips for the property/destination (booking tips, local tips, what to pack, etc.)"

**Conditionally include:**
- When `includeThingsToDo` is true (default): "A 'Things to Do Nearby' section with 3-5 top-rated activities, attractions, or experiences near the property"
- When false: "Do NOT include a Things to Do or activities section"

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-quote/index.ts` | Accept `includeThingsToDo` param; update prompt to always add Travel Tips and conditionally add Things to Do |
| `src/components/dashboard/QuoteBuilder.tsx` | Add "Include Things to Do" checkbox in AI generate mode; pass to edge function |


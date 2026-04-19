
# Plan: Content Studio Persona Toggle, Chart Extraction, and AI Edit Mode

## 1. Persona system (Default / Professional / Casual)

Add a dropdown in the AI Article Assistant card (above "Generate from Topic" / "Format Existing Text" toggle):

- **Default (Tom)** — current voice ("Toronto-based travel consultant", conversational, first-person experience).
- **Professional** — neutral expert/journalist voice. No "Toronto-based agent" framing, no first-person anecdotes. Authoritative, third-person where natural.
- **Casual** — friendly travel-friend voice. Light, fun, second-person ("you'll love…"), still no em-dashes.

Pass selected persona to both `generate-blog-post` and `format-blog-post` edge functions. Each function builds the system prompt from a persona map. The "Toronto-based agent" line only appears for `default`.

Persona is also passed to the new AI Edit endpoint so edits stay in the chosen voice. Persona is remembered per-session in component state (default = Default).

## 2. Mix up the writing in Default persona

Even in Default mode, instruct the AI to **vary the self-reference** instead of always opening with "As a Toronto-based agent". Add to the system prompt a rotation list of openers:
- "After years of helping Canadian travellers…"
- "From what I've seen working with clients…"
- "Travelling out of Toronto, I've learned…"
- "In my experience planning trips like this…"
- Or no self-reference at all, just lead with the insight.

Rule: never use the exact phrase "as a Toronto-based agent" more than once per article, and never as the opening line.

## 3. Chart / graph upload handling

Problem: when chart/graph images are uploaded, layout breaks. Fix: stop trying to embed them as images. Instead, in the **Format Existing Text** flow, add a new uploader: **"Charts & data (extract numbers only)"** — separate from the Images uploader.

Flow:
1. User uploads chart images into the new "Charts" slot.
2. Frontend sends those images to `format-blog-post` as base64 data URLs in a new `chartImages` array.
3. The edge function uses Gemini's vision to **read the data from each chart** (axes, values, trends, time periods, source if visible).
4. AI weaves the extracted numbers and trends directly into article sentences (e.g. "Flight prices to Cancun rose 18% between January and March 2026, peaking at $612 round-trip…").
5. Chart images are **never** rendered as image blocks. Only the extracted facts appear as text.

Tooltip under the new uploader: "Upload bar charts, graphs, or stat images. The AI will read the numbers and weave them into sentences instead of embedding the image."

## 4. AI Edit mode for existing posts

Currently clicking Edit on a post only opens the manual block editor. Add an AI edit panel at the top of the edit form (only shown when `editingId` is set):

**"Tell the AI what to change"** — textarea + Apply button.

Examples shown as placeholder: *"Make the intro shorter", "Add a section on shoulder season pricing", "Rewrite in a more casual tone", "Update the FAQ with current 2026 visa rules", "Replace all mentions of Cancun with Playa del Carmen".*

Flow:
1. User types instruction (e.g. "Add a paragraph about travel insurance after the safety section").
2. Frontend calls a **new edge function `edit-blog-post`** with: full current `blocks`, `title`, `excerpt`, `faq_items`, the user instruction, and the selected persona.
3. Function uses Gemini with tool calling to return the **full updated article structure** (same schema as generate). It can edit, add, remove, or reorder blocks; update FAQ; update excerpt.
4. Frontend replaces the form state with the AI's response. User reviews in the manual editor and clicks "Update Post" to save.

Optional: a "Preview before applying" diff is out of scope for v1. User can Cancel Edit to discard.

## Files Touched

| File | Change |
|---|---|
| `src/components/dashboard/BlogPostCreator.tsx` | Add persona dropdown, chart uploader (format mode), AI Edit panel (when editing). Pass persona + chartImages to edge functions. |
| `supabase/functions/generate-blog-post/index.ts` | Accept `persona`, build system prompt from persona map, add opener-variation rule for Default. |
| `supabase/functions/format-blog-post/index.ts` | Accept `persona` + `chartImages`. Pass chart images to Gemini vision, instruct it to extract numbers and weave into prose, never emit them as image blocks. |
| `supabase/functions/edit-blog-post/index.ts` (new) | New function. Takes current article + instruction + persona, returns full updated article via tool call. Returns same shape as generate-blog-post so frontend can reuse population logic. |
| `supabase/config.toml` | Register `edit-blog-post` with `verify_jwt = false` (consistent with other AI tool functions). |

## Technical Notes

- Persona map lives inside each edge function (single source of truth, no duplication on client).
- `chartImages` sent as data URLs (small) to avoid an upload roundtrip — they're never persisted, only read.
- `edit-blog-post` returns the same JSON schema as `generate-blog-post` (title, slug, blocks, faq_items, internal_links, excerpt, etc.) so the frontend reuses the existing "auto-fill all fields" code path.
- Em-dash / en-dash sanitization stays in all three functions.
- Gemini 2.5 Flash supports vision and tool calling in one call, so chart extraction + structured output works in a single request.

## Out of Scope

- Custom user-defined personas beyond the three.
- Persisting the chosen persona per blog post.
- Diff view before applying AI edits.



# Plan: Blog-Style Free-Form Quote Output

## What You Want
Instead of the current rigid card-based quote (structured fields, tables, line items), you want the AI to write a **flowing, blog-style prose document** — like the Grok Iceland example in your screenshots. The quote reads like an article: narrative paragraphs with headings, bullet lists, bold highlights, and a warm professional tone. The AI has creative freedom over layout as long as all the details are included.

## Approach

### 1. Change the AI output from structured tool-call to free-form markdown

**File: `supabase/functions/generate-quote/index.ts`**

- Remove the `tools` / `tool_choice` structured extraction approach entirely
- Instead, ask the AI to return a **JSON object with two fields**:
  - `markdown`: The full quote as rich markdown (headings, bold, bullets, etc.) — the AI writes it however it wants, blog-style
  - `metadata`: A small object with just `client_name`, `resort_name`, `destination`, `total_price`, `currency`, `valid_until` (for saving/filtering in the DB)
- The prompt instructs the AI to write a professional travel quote document that includes a branded header block, personal greeting, trip summary, accommodation details, cost breakdown, notes, next steps, and agent sign-off — but in whatever narrative format it chooses
- Agent branding (Tom Laracy, TravelOnly, tlaracy@travelonly.com) is baked into the prompt so it appears in the output

### 2. Add `quote_markdown` column to `client_quotes`

**Migration SQL:**
```sql
ALTER TABLE public.client_quotes ADD COLUMN quote_markdown text;
```

### 3. Update `QuotePreview.tsx` — render markdown instead of structured cards

- Replace the entire structured layout (TripDetailsCard, QuoteReviewSection, line items) with a **markdown renderer**
- Use a simple markdown-to-JSX approach (map headings, bold, bullets, etc. to styled HTML) or install `react-markdown`
- Keep the action buttons (Save, Print/PDF, Email, Copy Link) unchanged
- The resort review section can still be appended below the markdown if `includeReview` is checked

### 4. Update `PublicQuote.tsx` — same markdown rendering

- Render `quote.quote_markdown` as the main body instead of the structured card layout
- Keep the branded header and agent footer

### 5. Update `QuoteBuilder.tsx` — simplify the AI generate flow

- After AI returns, store the markdown string and metadata
- The "preview" step shows the rendered markdown immediately
- Keep the manual builder as a fallback for agents who want structured editing

### 6. Update `QuoteData` interface

- Add `quoteMarkdown?: string` field
- The save function stores it in the new `quote_markdown` column

## Files Changed

| File | Change |
|------|--------|
| Migration SQL | Add `quote_markdown text` column |
| `supabase/functions/generate-quote/index.ts` | Replace tool-call with free-form markdown + metadata JSON output |
| `src/components/dashboard/QuoteBuilder.tsx` | Store markdown from AI response, pass to preview |
| `src/components/dashboard/QuotePreview.tsx` | Render markdown body instead of structured cards |
| `src/pages/PublicQuote.tsx` | Render `quote_markdown` as main content |
| `package.json` | Add `react-markdown` + `remark-gfm` for rendering |


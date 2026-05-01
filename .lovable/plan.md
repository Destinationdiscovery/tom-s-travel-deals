## Goals

1. Remove the misleading "Quote valid until [date]" line from every place it shows to clients, while keeping the existing "prices subject to change" language intact.
2. Add an Edit button on the preview screen so the agent can revise the AI-generated quote content before sending or printing.

## Changes

### 1. Strip "valid until" from the AI-generated quote

`supabase/functions/generate-quote/index.ts`
- Remove the `quote valid until ${validUntilDate}` instruction from the system prompt (line 167) so the AI never writes a "valid until" line into the markdown.
- Add a new explicit rule: "Do NOT include any 'quote valid until' or expiry date language. You may still mention that prices are subject to change and availability."
- Keep `validUntilDate` in the metadata block for now (used internally for sorting / DB), but it will no longer be rendered to the client.

### 2. Strip "valid until" from the structured (legacy) preview and public quote

`src/components/dashboard/QuotePreview.tsx`
- Remove the `{quote.validUntil && ...Quote valid until...}` block (lines 198-202).
- Leave the agent sign-off block intact.

`src/pages/PublicQuote.tsx`
- Remove the equivalent `{quote.valid_until && ...}` block in the legacy structured layout (around lines 142-146).

### 3. Add Edit functionality to the preview

`src/components/dashboard/QuotePreview.tsx`
- Add local state: `isEditing`, `draftMarkdown` (initialised from `quote.quoteMarkdown`), and `draftSummary` / `draftNotes` for the legacy structured fallback.
- Add an "Edit" button to the actions row (next to Back / Print / Copy Link). Clicking it toggles edit mode.
- In edit mode for AI quotes (`hasMarkdown` true): render a full-width `<Textarea>` (min-height ~600px, monospace font) bound to `draftMarkdown` so the agent can freely edit the markdown. Show a live "Preview" toggle or render the markdown below the textarea so they can see formatting as they go.
- In edit mode for legacy structured quotes: allow editing the `summary` and `notes` text fields inline (the rest is structured form data already editable in earlier steps).
- Add "Save Changes" and "Cancel" buttons in edit mode.
  - Save: call a new `onUpdate(updates: Partial<QuoteData>)` callback passed in from `QuoteBuilder`, which updates the `quote` state and persists via the existing `handleSave()` flow (so the change is written to `client_quotes` and reflected in the public share link).
  - Cancel: discard `draftMarkdown` and exit edit mode.
- After Save, re-render the preview with the updated content. Show a toast "Quote updated".

`src/components/dashboard/QuoteBuilder.tsx`
- Add an `onUpdate` prop wiring: `(updates) => { setQuote(prev => ({ ...prev, ...updates })); setTimeout(handleSave, 0); }`.
- Pass it into `<QuotePreview>`.

## Out of scope

- No DB schema changes (the `valid_until` column stays, just hidden from output).
- No edit support for the public client view (`PublicQuote.tsx`); editing is agent-only inside the dashboard preview.

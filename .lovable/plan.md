

# Plan: AI-Powered Quote Builder

## Overview
Add a "Generate from Prompt" mode to the Quote Builder, mirroring the Blog Creator's AI Article Assistant pattern. You type a natural language prompt like "Create a quote for Pat and Holly, 1 week Barcelo Maya Riviera adults only, $1295 per person" and optionally attach documents (invoices, confirmations). AI researches the resort via Perplexity, extracts details from attachments, and auto-fills every field. You review and save.

## File Changes

### 1. New Edge Function: `supabase/functions/generate-quote/index.ts`
- Accepts `{ prompt: string, attachmentContents?: string[] }`
- Calls Perplexity `sonar` to research the resort (amenities, location, room types, highlights)
- Passes research + prompt + any attachment text to Gemini via tool calling
- Returns structured output: `client_name`, `client_email`, `resort_name`, `destination`, `check_in`, `check_out`, `num_travellers`, `room_type`, `inclusions[]`, `line_items[]`, `flights[]`, `notes`, `currency`, `valid_until`
- Extracts pricing, dates, flight info, and passenger names from attachments when provided

### 2. Update: `src/components/dashboard/QuoteBuilder.tsx`
- Add an AI Quote Assistant card at the top (before the step indicators), styled identically to the Blog Creator's AI card
- Two-mode toggle: **"Generate from Prompt"** | **"Manual Builder"** (current flow)
- "Generate from Prompt" mode shows:
  - A prompt textarea (same styling as Blog Creator)
  - An attachment upload area (accepts PDF, JPG, PNG, WEBP) that uploads to `booking-documents` bucket and extracts text via AI
  - A "Generate Quote" button
- On success, auto-fills the entire `quote` state and jumps to step 2 (or step 4 preview)
- The existing manual 4-step flow remains fully intact as the "Manual Builder" mode
- Also auto-triggers the resort review lookup so the review data is populated

### 3. Attachment Processing
- When attachments are uploaded in the AI prompt mode, the edge function receives their storage paths
- The function downloads each file, and for PDFs/images uses Gemini's vision capability to extract text content
- Extracted content is included in the prompt to Gemini so it can pull dates, pricing, flight details, passenger names, etc.

## Technical Details

| Aspect | Detail |
|--------|--------|
| Research model | Perplexity `sonar` for resort info |
| Writing model | `google/gemini-2.5-flash` with tool calling for structured output |
| Attachment parsing | Gemini vision (multimodal) for PDFs/images sent as base64 |
| Review integration | After AI fills the resort name, triggers `generateReview()` to attach review data |
| Persona | Professional travel agent tone, CAD default, Canadian perspective |
| Error handling | 429/402 rate limit handling, attachment parse failures graceful |

## UI Flow

```text
┌─────────────────────────────────────────────┐
│ ✨ AI Quote Assistant                       │
│ ┌─────────────────┬───────────────────────┐ │
│ │ Generate from   │ Manual Builder        │ │
│ │ Prompt (active) │                       │ │
│ └─────────────────┴───────────────────────┘ │
│                                             │
│ Describe the trip and AI will research the  │
│ resort, build pricing, and fill everything. │
│                                             │
│ Prompt:                                     │
│ ┌─────────────────────────────────────────┐ │
│ │ Create a quote for Pat and Holly, 1     │ │
│ │ week Barcelo Maya Riviera adults only...│ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 📎 Attachments: [invoice.pdf] [+ Add]       │
│                                             │
│ [🔍 Generate Quote]                         │
└─────────────────────────────────────────────┘
```

After generation, all fields auto-populate and you land on the preview step to review, adjust, and save.


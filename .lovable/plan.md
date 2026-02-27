

# Plan: AI-Powered Full Article Generation

## Overview
Add a "Generate from Prompt" mode to the AI Auto-Format section. You type a topic/prompt, AI researches it via Perplexity (for real-time web data), then writes the full article in your persona and auto-fills every field — title, slug, category, excerpt, read time, tags, and content blocks. You just review and publish.

## How It Works

1. New text input/toggle in the Auto-Format card: "Generate from topic" vs "Format existing text"
2. When generating from a topic prompt:
   - **Step 1**: Perplexity `sonar` researches the topic with real-time web search
   - **Step 2**: Lovable AI (Gemini) takes the research + your persona rules and writes a full blog post with no em-dashes, in your voice
   - **Step 3**: AI returns all metadata (title, category, slug, excerpt, read time, tags) plus structured content blocks
   - **Step 4**: Everything auto-fills into the form — you review, optionally upload images, then publish

## File Changes

### 1. New Edge Function: `supabase/functions/generate-blog-post/index.ts`
- Accepts `{ prompt: string }`
- Calls Perplexity `sonar` to research the topic and get current facts/citations
- Passes research to Lovable AI (Gemini) with persona instructions:
  - Write as "Tom", a Toronto-based travel consultant
  - No em-dashes (—), use commas or periods instead
  - Conversational, practical tone
  - Return structured tool call with: `title`, `slug`, `category`, `excerpt`, `read_time`, `tags[]`, and `blocks[]`
- Returns all fields ready to populate the form

### 2. Update: `src/components/dashboard/BlogPostCreator.tsx`
- Add a toggle/tab at top of Auto-Format card: **"Generate from Topic"** | **"Format Existing Text"**
- "Generate from Topic" mode shows a single prompt input + "Generate Article" button
- On submit, calls the new edge function
- On success, auto-fills: `title`, `slug`, `category`, `excerpt`, `readTime`, `tags`, and `blocks`
- User can still upload/add images manually before publishing

### 3. Update: `supabase/config.toml`
- Add `generate-blog-post` function entry with `verify_jwt = false`

## Technical Details

- Perplexity provides grounded, cited research so articles are factually current
- Gemini structures the output via tool calling for reliable JSON extraction
- The persona prompt enforces no em-dashes, Canadian-friendly but inclusive tone
- Categories are auto-suggested from the existing CATEGORIES list
- Slug is auto-generated from the title
- Images are NOT auto-generated — user uploads them after reviewing the text (keeps quality control)




# Plan: AI Auto-Format for Blog Post Creator

## Problem
Right now the blog creator requires you to manually add each text block, heading block, and image block one by one. When I built the travel trends article, I structured it by hand -- splitting paragraphs, inserting headings, and placing images between sections. You want that same logic automated so you can just paste all your text + upload images and get a professional article.

## How It Will Work

**New workflow in the Blog Post Creator:**

1. You paste all your article text into a single large textarea
2. You upload your images (multiple at once) into an image pool
3. You click **"Auto-Format Article"**
4. AI analyzes the text, splits it into paragraphs, detects/creates section headings, and distributes your uploaded images logically between sections
5. The result populates the block editor so you can review, tweak, and publish

```text
┌─────────────────────────────────────────────┐
│  Paste Your Article Text                     │
│  ┌─────────────────────────────────────────┐ │
│  │ [Large textarea for raw article text]   │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  Upload Images                               │
│  [Choose Files] image1.jpg image2.jpg ...    │
│  ┌────┐ ┌────┐ ┌────┐                       │
│  │ img│ │ img│ │ img│  (thumbnail previews)  │
│  └────┘ └────┘ └────┘                       │
│                                              │
│  [✨ Auto-Format Article]                    │
│                                              │
│  ── OR manually add blocks below ──          │
└─────────────────────────────────────────────┘
```

## Technical Changes

### 1. New Edge Function: `supabase/functions/format-blog-post/index.ts`

- Receives: raw text + number of images available
- Uses Lovable AI (Gemini Flash) with tool calling to return structured output
- AI splits text into paragraphs, identifies natural section breaks for headings, and returns placement indexes for where images should go
- Returns a JSON array of `ContentBlock[]` with types: `text`, `heading`, `image` (image blocks get placeholder indexes like `IMAGE_0`, `IMAGE_1` that the frontend maps to actual uploaded URLs)

**Prompt logic:**
- Split text into readable paragraphs (not too long, not too short)
- Detect topic changes and insert heading blocks
- Distribute N images evenly across the article at logical breakpoints (after introductory paragraphs, between major sections)
- Generate captions for each image based on surrounding text context
- Also generate an excerpt and suggested read time

### 2. Updated: `src/components/dashboard/BlogPostCreator.tsx`

**New UI elements:**
- A "Raw Content" textarea above the block editor for pasting all text at once
- A multi-file image uploader for batch-uploading article images
- An "Auto-Format Article" button that:
  1. Uploads all images to the `blog-images` storage bucket
  2. Sends the raw text + image count to the edge function
  3. Receives structured blocks back
  4. Maps `IMAGE_0`, `IMAGE_1`, etc. to actual uploaded URLs
  5. Populates the block editor with the result
- The existing manual block editor stays below as a fallback / for fine-tuning after auto-format

**State additions:**
- `rawText: string` -- the pasted article text
- `imagePool: File[]` -- batch uploaded images
- `imagePoolPreviews: string[]` -- preview URLs
- `formatting: boolean` -- loading state during AI processing

### 3. No changes to `CompassArticle.tsx`
The rendering already handles richContent blocks with text, heading, and image types correctly.

## File Summary

| File | Action |
|------|--------|
| `supabase/functions/format-blog-post/index.ts` | **Create** -- AI formatting edge function |
| `src/components/dashboard/BlogPostCreator.tsx` | **Edit** -- Add raw text input, image pool uploader, and auto-format button |


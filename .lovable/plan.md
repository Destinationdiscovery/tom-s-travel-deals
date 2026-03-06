

# Plan: Use Pexels/Pixabay Stock Photos in Blog Generator

## Feasibility

Yes, both Pexels and Pixabay offer free APIs that return high-quality, royalty-free photos perfect for travel blog posts. Pexels is the better choice here: simpler API, higher quality results, and their free tier allows 200 requests/hour which is more than enough.

## Approach

### 1. Add Pexels API Key as a secret
- Get a free API key from [pexels.com/api](https://www.pexels.com/api/) (instant, no payment required)
- Store it as `PEXELS_API_KEY` secret

### 2. Update `generate-blog-post/index.ts`
Replace the `generateImage()` function with a `searchStockPhoto()` function that:
- Calls `https://api.pexels.com/v1/search?query=...&per_page=1&orientation=landscape`
- Extracts the photo URL directly (no base64 conversion or upload needed — Pexels URLs are permanent and hotlink-friendly per their terms)
- Falls back to AI-generated images if no Pexels results found

### 3. Changes to image flow
**Current flow:** AI generates base64 image → upload to storage → use public URL
**New flow:** Search Pexels with keyword → use Pexels URL directly (with photographer attribution)

The article's tool call schema already has image blocks. We'll use Pexels `src.large2x` (1280px wide) for hero and `src.large` for inline images.

### 4. Attribution
Pexels requires attribution. We'll store photographer name + Pexels URL alongside the image URL and render a small credit line under each image.

### Changes Summary

| File | Change |
|------|--------|
| Secret | Add `PEXELS_API_KEY` |
| `supabase/functions/generate-blog-post/index.ts` | Replace `generateImage()` + `uploadBase64Image()` with `searchStockPhoto()` using Pexels API. Remove base64/upload logic. Add photographer attribution to image blocks. |

### Image block format change
```typescript
// Before
{ type: "image", value: "https://storage.../uploaded.jpg", caption: "" }

// After  
{ type: "image", value: "https://images.pexels.com/...", caption: "", photographer: "John Doe", photographerUrl: "https://pexels.com/@john" }
```

The rendering component (`BlogPreviewSection` or wherever blog blocks render) would show a small "Photo by X on Pexels" credit — this is lightweight and keeps you compliant with Pexels terms.


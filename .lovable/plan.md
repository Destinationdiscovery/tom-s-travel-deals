

## Fix Missing Product Images on Gear Results and Reviews

The root problem: Perplexity's `sonar` model cannot reliably return working image URLs. The `imageUrl` values it generates are often hallucinated or broken, which is why every card shows the placeholder Package icon.

### Solution: Google Custom Search Image API

You already have a `GOOGLE_PLACES_API_KEY` configured. Google's Custom Search JSON API can search for product images using the same API key (with a Programmable Search Engine ID). This gives us real, working product image URLs.

However, the simpler and more reliable approach that works immediately without extra setup:

### Revised Solution: Use Google Image Search via SerpAPI-style or use Perplexity more effectively

Actually, the most reliable zero-config approach:

**Use Perplexity `sonar-pro` with explicit image search instructions, AND add a fallback image proxy step using Google Custom Search.**

But to keep it simple and working NOW, here is the plan:

---

### Approach: Dedicated Image Fetching via Google Custom Search

**1. Create a new edge function: `gear-product-image/index.ts`**

This function takes a product name and returns an image URL using Google Custom Search JSON API:
- Endpoint: `https://www.googleapis.com/customsearch/v1`
- Params: `q={product name}`, `searchType=image`, `num=1`, `key={GOOGLE_API_KEY}`, `cx={search engine ID}`
- Returns the first image result URL
- Caches image URLs in a simple table or in-memory

**Problem**: This requires a Google Programmable Search Engine ID (cx parameter) in addition to the API key. This is a free but separate setup step.

---

### Simpler Approach (Recommended): Construct Amazon Image Search URLs

Since every product links to Amazon anyway, we can use Amazon's product search page thumbnails. But these aren't directly embeddable.

---

### Simplest Reliable Approach: Improve Perplexity Prompt + Use `sonar-pro`

The most practical fix with zero extra infrastructure:

**1. Update the edge function (`travel-gear-intel/index.ts`)**

- Switch from `sonar` to `sonar-pro` for the `must-haves` type (better at finding real URLs, 2x more citations)
- Update the prompt to explicitly ask for Amazon product image URLs (these are the most reliable since Perplexity has web access)
- Add the instruction: "For imageUrl, find the actual Amazon product listing image URL or a product image from the manufacturer's website. The URL MUST be a real, working direct link to a .jpg or .png image."
- Add a post-processing step that validates image URLs (check they look like real URLs, not hallucinated ones)

**2. Add image URL validation in the edge function**

After parsing the Perplexity response, validate each `imageUrl`:
- Must start with `https://`
- Must contain a recognizable image host (amazon, manufacturer sites)
- If invalid, set to `null` so the frontend shows the category placeholder gracefully

**3. Update the review prompt too**

The review type prompt currently doesn't request any image. Add an `imageUrl` field to the review JSON schema so the product review panel can also show a product image.

**4. Frontend: Already handles fallback**

The `PackingResultCard` component already has an `onError` fallback to the Package icon, so no frontend changes needed for the cards. For the review panel, add a product image display at the top.

---

### Files Changed

| Action | File |
|--------|------|
| Modify | `supabase/functions/travel-gear-intel/index.ts` -- switch to `sonar-pro`, improve image prompts, add URL validation |
| Modify | `src/pages/Gear.tsx` -- add product image to the review panel header |

### Note

If `sonar-pro` still doesn't return reliable image URLs (which is possible since LLMs are generally unreliable at this), the next step would be to add a Google Custom Search integration for images. That would require setting up a free Google Programmable Search Engine and storing its ID as a secret. We can cross that bridge if needed.


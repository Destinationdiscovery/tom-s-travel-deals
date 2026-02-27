

# Plan: Rename to "Blog Creator" + Add AI Image Generation

## Changes

### 1. Rename heading
In `src/components/dashboard/BlogPostCreator.tsx`, change line 324 from "Blog Post Creator" to "Blog Creator".

### 2. Auto-generate images when generating from topic
Update the `generate-blog-post` edge function to also generate images using the Lovable AI image model (`google/gemini-2.5-flash-image`):

- After the article text is generated, make 1 call for a hero image and 2 to 3 calls for inline images, using the article title/headings as prompts
- Upload each generated image (base64) to the `blog-images` storage bucket
- Return the public URLs as `hero_image_url` and image blocks within `blocks`

**Edge function changes** (`supabase/functions/generate-blog-post/index.ts`):
- After generating the article, call the image model with prompts like "Professional travel blog photo: [article title]" for the hero, and heading-based prompts for inline images
- Upload base64 results to `blog-images` bucket via Supabase client
- Include `hero_image_url` in the response and inject image blocks into the content blocks array

**Frontend changes** (`src/components/dashboard/BlogPostCreator.tsx`):
- Update `handleGenerateFromTopic` to also set `heroPreview` from `data.hero_image_url` if returned
- Change heading text to "Blog Creator"
- Update the loading message to mention image generation: "Researching, writing, and generating images..."

### Technical notes
- Uses `google/gemini-2.5-flash-image` (Nano banana) model, no extra API key needed
- Images are AI-generated illustrations, not real photos. They will be stylistic/artistic. You can always replace them with your own photos before publishing.
- Generates 3 to 4 images total (1 hero + 2 to 3 inline), adding roughly 10 to 15 seconds to generation time
- All images auto-uploaded to the existing `blog-images` public bucket




# Add "Regenerate" Button to Published Blog Posts

## What It Does
Adds a "Regenerate" button on each published post card. When clicked, it takes the post's existing title as the prompt, calls the `generate-blog-post` edge function (which now has the full SEO/FAQ/2500+ word format), and updates the post in-place with the new content while preserving the original slug and publish date.

## Changes

### `src/components/dashboard/BlogPostCreator.tsx`

1. Add a `regeneratingId` state to track which post is being regenerated
2. Add a `handleRegenerate(post)` function that:
   - Sets `regeneratingId` to the post ID
   - Calls `supabase.functions.invoke("generate-blog-post", { body: { prompt: post.title } })`
   - Updates the existing `blog_posts` row with new `rich_content`, `excerpt`, `read_time`, `tags`, `hero_image_url`, `faq_items`, `internal_links`, `primary_keyword`, and `updated_at`
   - Preserves original `slug`, `date_published`, `author`, and `id`
   - Refreshes the post list
3. Add a "Regenerate" button (with `RefreshCw` icon) next to Edit/View/Delete on each post card
4. Show a spinner on the button while regenerating

| File | Change |
|------|--------|
| `src/components/dashboard/BlogPostCreator.tsx` | Add regenerate state, handler, and button |

Single file change. No database or edge function changes needed — it reuses the existing `generate-blog-post` function.


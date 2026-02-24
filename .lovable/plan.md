

# Two Fixes: Newest Blog Posts on Homepage + Comments System

## Issue 1: Homepage Blog Cards Always Show Same 3 Articles

Currently `BlogPreviewSection` pulls `compassArticles.slice(0, 3)` from hardcoded data, ignoring any posts created through the dashboard.

**Fix:** Update `BlogPreviewSection.tsx` to:
- Fetch all published posts from the `blog_posts` database table
- Merge them with the hardcoded `compassArticles` (deduplicating by slug)
- Sort all articles by date (newest first)
- Display the top 3

This means any new blog post you create in the dashboard will immediately appear on the homepage if it's one of the 3 most recent.

## Issue 2: Comments Table Does Not Exist

The `comments` table was never created in the database, which is why "Comments couldn't be loaded right now" appears. The code references it but the table is missing.

**Fix:** Create a database migration to add the `comments` table with:
- Columns: `id`, `page_slug`, `page_type`, `user_id`, `content`, `created_at`, `is_hidden`
- RLS policies:
  - Anyone can read non-hidden comments (public read)
  - Authenticated users can insert their own comments
  - Users can update/delete their own comments
  - Admins can update any comment (for hide/unhide moderation)

---

## Technical Details

### File: `src/components/BlogPreviewSection.tsx`
- Add a `useQuery` call to fetch from `blog_posts` table
- Map DB results to the same shape as `compassArticles`
- Merge both sources, deduplicate by slug, sort by date descending, take first 3

### Database Migration (new)
```sql
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  page_type text NOT NULL CHECK (page_type IN ('destination','gear','compass')),
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Public can read visible comments
CREATE POLICY "Anyone can read visible comments"
  ON public.comments FOR SELECT
  USING (is_hidden = false);

-- Admins can read all comments (including hidden)
CREATE POLICY "Admins can read all comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can update any comment (hide/unhide)
CREATE POLICY "Admins can update any comment"
  ON public.comments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
  ON public.comments FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

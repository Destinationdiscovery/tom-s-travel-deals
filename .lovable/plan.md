

# Analytics Daily Reset, Blog SEO Keywords, Blog Visibility Check

## 1. Analytics "Today" View Problem

**Root cause**: The `review_views` table stores a single row per slug with an aggregate `view_count` and `last_viewed_at` timestamp. There are no per-event rows, so filtering by "today" only shows pages whose `last_viewed_at` falls within today — it cannot show how many views happened today specifically.

**Fix**: Create a new `page_view_events` table that logs one row per view event with a `created_at` timestamp. Update the `track-review-view` edge function to insert into this table alongside the existing aggregate update. Update the analytics dashboard to query this event table for time-filtered views.

### Database Migration
```sql
CREATE TABLE public.page_view_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_view_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read page view events"
  ON public.page_view_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_page_view_events_created ON public.page_view_events(created_at DESC);
CREATE INDEX idx_page_view_events_slug ON public.page_view_events(slug);
```

### Edge Function Update (`track-review-view`)
- After updating `review_views` aggregate, also insert into `page_view_events`: `{ slug }`
- This gives per-event granularity for time filtering

### Analytics Dashboard Update (`SiteAnalyticsDashboard.tsx`)
- For Views tab: query `page_view_events` with `created_at` filter instead of `review_views` when time range is not "all"
- For "all" time range: continue using `review_views` aggregate for efficiency
- Add daily views chart (like the existing daily clicks chart)
- Add unique pages count to summary cards

## 2. Blog Post SEO Optimization

**Current gap**: The `generate-blog-post` edge function asks for tags but doesn't explicitly instruct the AI to optimize for SEO keywords, meta descriptions, or semantic keyword density.

### Edge Function Update (`generate-blog-post`)
Add to the system prompt:
- Instruction to front-load primary keywords in the title, first paragraph, and H2 headings
- Instruction to include LSI (related) keywords naturally throughout
- Instruction to write the excerpt as a click-worthy meta description under 160 characters
- Instruction to structure headings as questions where appropriate (for featured snippets)
- Add `meta_description` field to the tool schema (separate from excerpt, optimized for search)

### Blog Post Creator Update
- Display the generated tags prominently so user can review/edit before publishing
- Auto-populate the tags field from AI generation

## 3. Blog Section on Homepage

The `BlogPreviewSection` component **is already rendered** on the homepage (line 163 of `Index.tsx`). It shows the 3 most recent articles. No change needed here.

## Files

| File | Action |
|------|--------|
| DB migration | New `page_view_events` table with RLS |
| `supabase/functions/track-review-view/index.ts` | Add insert to `page_view_events` |
| `supabase/functions/generate-blog-post/index.ts` | Add SEO instructions to AI prompt, add `meta_description` field |
| `src/components/dashboard/SiteAnalyticsDashboard.tsx` | Query `page_view_events` for time-filtered views, add daily views chart |

## Build Order
1. Create `page_view_events` table
2. Update `track-review-view` to log events
3. Update analytics dashboard to use event table
4. Enhance blog post generation SEO prompt


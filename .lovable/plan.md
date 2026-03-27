

# Enhance Blog Post Generator: Word Count, Schema, Internal Links, EEAT

## Current State
The `generate-blog-post` edge function already has SEO rules (keyword front-loading, LSI, meta descriptions, question headings). Missing: word count target, FAQPage schema generation, internal linking to cluster content, and fresh data/image signals for EEAT.

## Changes

### 1. Edge Function (`supabase/functions/generate-blog-post/index.ts`)

**System prompt additions:**
- "Target 2,500+ words minimum. Write comprehensive, in-depth content with detailed sections."
- "Include a FAQ section at the end with 3-5 questions and direct answers related to the topic"
- "Include the primary keyword in the title, the first H2 heading, and the URL slug"
- "Distribute secondary keywords naturally across H2 headings, section intros, and bullet lists"
- "Reference fresh 2026 data, statistics, and dates throughout for EEAT credibility"
- "Add internal links to related ReviewThenGo tools where relevant: /reviews (hotel reviews), /best-time (best time to visit), /itinerary (itinerary builder), /flights (flight deals), /gear (packing toolkit), /currency (currency tracker), /safety (safety scores), /travel-intel (travel advisories)"

**Tool schema additions:**
- Add `faq_items` array field: `[{ question: string, answer: string }]` — 3-5 FAQ pairs
- Add `internal_links` array field: `[{ text: string, url: string }]` — suggested internal links to embed
- Add `primary_keyword` string field — the main keyword being targeted

### 2. Article Rendering (`src/pages/CompassArticle.tsx`)

- If the blog post has `faq_items` in its data, generate FAQPage JSON-LD schema and render the FAQ as an accordion section at the bottom of the article
- Add the FAQ schema via SEOHead's `faq` prop (already supported)

### 3. Blog Post Creator (`src/components/dashboard/BlogPostCreator.tsx`)

- When AI generates an article, display the FAQ items so the admin can review/edit them before publishing
- Save `faq_items`, `internal_links`, and `primary_keyword` to the blog_posts table

### 4. Database Migration

- Add columns to `blog_posts`: `faq_items jsonb default '[]'`, `internal_links jsonb default '[]'`, `primary_keyword text`

## Files

| File | Change |
|------|--------|
| DB migration | Add faq_items, internal_links, primary_keyword to blog_posts |
| `supabase/functions/generate-blog-post/index.ts` | Expand prompt + tool schema |
| `src/pages/CompassArticle.tsx` | Render FAQ accordion + FAQPage schema |
| `src/components/dashboard/BlogPostCreator.tsx` | Display/edit FAQ items from AI |

## Build Order
1. Database migration (new columns)
2. Edge function prompt + schema expansion
3. CompassArticle FAQ rendering
4. BlogPostCreator FAQ display


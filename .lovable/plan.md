
# Dashboard Additions: Blog Post Creator & Featured Deals Manager

Two new admin dashboard modules to manage blog content and homepage featured deals directly from Agent HQ.

---

## Part A: Blog Post Creator

A new "Blog" tab in the dashboard sidebar that lets you create blog posts matching the existing Compass article format.

### How It Works:
1. Fill in a form: title, slug, category, author, excerpt, read time
2. Upload a hero image (stored in a new `blog-images` storage bucket)
3. Build the article body using a block-based editor:
   - Add **text** blocks (textarea)
   - Add **heading** blocks (input)
   - Add **image** blocks (upload image + caption)
   - Reorder or delete blocks
4. Click "Publish" to save the article to a new `blog_posts` database table
5. The Compass page and CompassArticle page will check the database first, then fall back to the hardcoded `compassArticles` array -- so old articles stay, new ones appear alongside them

### Database:
- New table: `blog_posts` with columns: `id`, `slug` (unique), `title`, `category`, `category_color`, `hero_image_url`, `excerpt`, `author`, `date_published`, `read_time`, `rich_content` (jsonb array of content blocks), `created_at`, `updated_at`
- RLS: admin can CRUD, anyone can SELECT
- New storage bucket: `blog-images` (public) for hero and inline images

### Files:
- **Create:** `src/components/dashboard/BlogPostCreator.tsx` -- the form + block editor
- **Modify:** `src/components/dashboard/DashboardSidebar.tsx` -- add "Blog" tab
- **Modify:** `src/pages/GearAdmin.tsx` -- render `BlogPostCreator` for the "blog" tab
- **Modify:** `src/pages/Compass.tsx` -- fetch from `blog_posts` table and merge with `compassArticles`
- **Modify:** `src/pages/CompassArticle.tsx` -- check `blog_posts` table first when loading by slug, fall back to static data

---

## Part B: Featured Deals Manager

A new "Featured Deals" tab that lets you manage the 6 deal cards shown on the homepage.

### How It Works:
1. See all 6 current deal slots displayed as a grid with their images, names, and prices
2. To replace a card, select which slot number (1-6) you want to replace
3. Fill in: resort name, location, affiliate URL, original price, sale price, rating, expiration date
4. Upload the resort image (stored in `blog-images` bucket, reused)
5. Click "Replace Card" and the deal is saved to a `featured_deals` database table
6. The `TravelDealsSection` component will fetch from the database first; if fewer than 6 rows exist, it fills remaining slots from the current hardcoded array

### Database:
- New table: `featured_deals` with columns: `id`, `slot_number` (integer 1-6, unique), `image_url`, `name`, `location`, `affiliate_url`, `original_price`, `sale_price`, `original_label`, `sale_label`, `rating`, `image_position`, `expires_at`, `created_at`, `updated_at`
- RLS: admin can CRUD, anyone can SELECT

### Files:
- **Create:** `src/components/dashboard/FeaturedDealsManager.tsx` -- slot-based deal editor
- **Modify:** `src/components/dashboard/DashboardSidebar.tsx` -- add "Featured Deals" tab (rename existing "Deal Maker" stays as-is)
- **Modify:** `src/pages/GearAdmin.tsx` -- render `FeaturedDealsManager` for the new tab
- **Modify:** `src/components/TravelDealsSection.tsx` -- fetch from `featured_deals` table, merge with hardcoded fallback

---

## Technical Details

### Database Migration
```text
-- New tables
blog_posts (id uuid PK, slug text UNIQUE, title text, category text, 
  category_color text, hero_image_url text, excerpt text, author text,
  date_published text, read_time text, rich_content jsonb, 
  created_at timestamptz, updated_at timestamptz)

featured_deals (id uuid PK, slot_number integer UNIQUE CHECK 1-6, 
  image_url text, name text, location text, affiliate_url text, 
  original_price numeric, sale_price numeric, original_label text, 
  sale_label text, rating numeric, image_position text, 
  expires_at timestamptz, created_at timestamptz, updated_at timestamptz)

-- Storage
blog-images bucket (public)

-- RLS on both: admin full CRUD, anon/public SELECT
```

### Sidebar Updates
The sidebar gains two new tabs:
- "Blog" (with a PenTool or BookOpen icon)
- "Featured Deals" (with a Star or Gift icon)

Total sidebar tabs after: Overview, Quote Builder, Clients, Bookings, Calendar, Emails, Deal Maker, Featured Deals, Blog, Gear Images, Revenue

### No New Dependencies
Uses existing UI components (Card, Input, Textarea, Button, Tabs), existing storage patterns from GearImageManager, and existing Supabase client.

### What This Unlocks
- Publish new blog posts from the dashboard without touching code
- Swap homepage featured deals on the fly with fresh resort images and affiliate links
- Both features use the same visual format already live on the site

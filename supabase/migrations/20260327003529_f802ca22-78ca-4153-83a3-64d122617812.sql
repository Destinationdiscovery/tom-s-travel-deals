ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS faq_items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS internal_links jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS primary_keyword text;
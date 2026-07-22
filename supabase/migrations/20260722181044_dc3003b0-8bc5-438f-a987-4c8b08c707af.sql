ALTER TABLE public.featured_packing_lists ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.featured_packing_list_items ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT false;
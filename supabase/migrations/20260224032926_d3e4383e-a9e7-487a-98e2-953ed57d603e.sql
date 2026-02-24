
ALTER TABLE public.featured_deals
  ADD COLUMN original_price_weekly numeric,
  ADD COLUMN sale_price_weekly numeric,
  ADD COLUMN original_label_weekly text,
  ADD COLUMN sale_label_weekly text;

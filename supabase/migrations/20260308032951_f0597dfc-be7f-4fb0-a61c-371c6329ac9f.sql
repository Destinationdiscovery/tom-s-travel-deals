ALTER TABLE public.booking_details ADD COLUMN IF NOT EXISTS report_markdown text;
ALTER TABLE public.booking_details ADD COLUMN IF NOT EXISTS total_value numeric DEFAULT 0;
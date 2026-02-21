ALTER TABLE public.client_quotes ADD COLUMN IF NOT EXISTS attachment_urls text[];
UPDATE public.client_quotes SET attachment_urls = ARRAY[attachment_url] WHERE attachment_url IS NOT NULL AND attachment_url != '';
ALTER TABLE public.client_quotes DROP COLUMN IF EXISTS attachment_url;
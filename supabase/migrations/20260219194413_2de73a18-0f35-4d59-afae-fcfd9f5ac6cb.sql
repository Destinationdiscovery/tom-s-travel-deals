ALTER TABLE public.client_quotes
  ADD COLUMN include_review boolean DEFAULT false,
  ADD COLUMN review_data jsonb DEFAULT null;
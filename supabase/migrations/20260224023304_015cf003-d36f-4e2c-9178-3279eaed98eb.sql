
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  page_type text NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger for page_type
CREATE OR REPLACE FUNCTION public.validate_comment_page_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.page_type NOT IN ('destination', 'gear', 'compass') THEN
    RAISE EXCEPTION 'page_type must be destination, gear, or compass';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_comment_page_type_trigger
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_comment_page_type();

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Public can read visible comments
CREATE POLICY "Anyone can read visible comments"
  ON public.comments FOR SELECT
  USING (is_hidden = false);

-- Admins can read all comments (including hidden)
CREATE POLICY "Admins can read all comments"
  ON public.comments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

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
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
  ON public.comments FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

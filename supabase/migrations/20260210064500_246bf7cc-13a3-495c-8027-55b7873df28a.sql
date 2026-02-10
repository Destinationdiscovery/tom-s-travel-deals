
-- 1. Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  newsletter_opt_in BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. User saved reviews
CREATE TABLE public.user_saved_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  property_name TEXT NOT NULL,
  location TEXT,
  overall_rating NUMERIC NOT NULL,
  ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT NOT NULL DEFAULT '',
  best_for TEXT[] NOT NULL DEFAULT '{}',
  trip_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

ALTER TABLE public.user_saved_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved reviews"
  ON public.user_saved_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved reviews"
  ON public.user_saved_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved reviews"
  ON public.user_saved_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved reviews"
  ON public.user_saved_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- 3. User review history
CREATE TABLE public.user_review_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  property_name TEXT NOT NULL,
  location TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

ALTER TABLE public.user_review_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON public.user_review_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON public.user_review_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON public.user_review_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON public.user_review_history FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

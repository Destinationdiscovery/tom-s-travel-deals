
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy on user_roles: admins can view roles
CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin write policies to gear_product_images
CREATE POLICY "Admin can insert gear images"
  ON public.gear_product_images FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update gear images"
  ON public.gear_product_images FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete gear images"
  ON public.gear_product_images FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Also fix storage policies to be admin-only
DROP POLICY IF EXISTS "Auth users upload gear images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users delete gear images" ON storage.objects;

CREATE POLICY "Admin uploads gear images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gear-images'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admin deletes gear images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gear-images'
    AND public.has_role(auth.uid(), 'admin')
  );

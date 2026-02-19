
-- Create enum for booking event types
CREATE TYPE public.booking_event_type AS ENUM ('booking', 'final_payment', 'departure', 'return');

-- Create enum for quote status
CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'expired');

-- Create enum for email types
CREATE TYPE public.email_type AS ENUM ('quote', 'followup', 'pre_departure', 'after_trip');

-- Client Quotes table
CREATE TABLE public.client_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_name TEXT NOT NULL,
  client_email TEXT,
  resort_name TEXT NOT NULL,
  resort_review_slug TEXT,
  destination TEXT,
  check_in DATE,
  check_out DATE,
  num_travellers INTEGER DEFAULT 1,
  flight_details JSONB DEFAULT '[]'::jsonb,
  line_items JSONB DEFAULT '[]'::jsonb,
  total_price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'CAD',
  notes TEXT,
  status public.quote_status DEFAULT 'draft',
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex')
);

ALTER TABLE public.client_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage quotes" ON public.client_quotes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view quotes by share_token" ON public.client_quotes
  FOR SELECT TO anon, authenticated
  USING (share_token IS NOT NULL);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_name TEXT NOT NULL,
  client_email TEXT,
  quote_id UUID REFERENCES public.client_quotes(id) ON DELETE SET NULL,
  event_type public.booking_event_type NOT NULL,
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  is_completed BOOLEAN DEFAULT false
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Email Log table
CREATE TABLE public.email_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_name TEXT NOT NULL,
  client_email TEXT,
  email_type public.email_type NOT NULL,
  subject TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.client_quotes(id) ON DELETE SET NULL
);

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage email log" ON public.email_log
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update trigger for client_quotes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_client_quotes_updated_at
  BEFORE UPDATE ON public.client_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

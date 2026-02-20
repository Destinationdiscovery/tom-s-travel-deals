
-- Create booking_details table for rich trip data
CREATE TABLE public.booking_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_number TEXT NOT NULL UNIQUE,
  client_name TEXT,
  client_email TEXT,
  supplier TEXT,
  resort_name TEXT,
  destination TEXT,
  room_type TEXT,
  flight_details JSONB DEFAULT '[]'::jsonb,
  pricing JSONB DEFAULT '{}'::jsonb,
  num_travellers INTEGER,
  extras JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_details ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admin can manage booking details"
ON public.booking_details
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_booking_details_updated_at
BEFORE UPDATE ON public.booking_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- Create booking-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-documents', 'booking-documents', false);

-- Admin can do everything with booking documents
CREATE POLICY "Admin can manage booking documents"
ON storage.objects
FOR ALL
USING (bucket_id = 'booking-documents' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'booking-documents' AND public.has_role(auth.uid(), 'admin'::public.app_role));

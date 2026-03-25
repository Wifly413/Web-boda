-- Add delete policy for wedding_photos table (was missing from initial schema)
CREATE POLICY "Public delete access for photos"
ON public.wedding_photos FOR DELETE
TO public
USING (true);

-- Add delete policy for wedding_guests table (cleanup orphaned guests if needed)
CREATE POLICY "Public delete access for guests"
ON public.wedding_guests FOR DELETE
TO public
USING (true);

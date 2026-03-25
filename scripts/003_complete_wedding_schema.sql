-- Create storage bucket for wedding photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-photos', 'wedding-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist, then recreate
DROP POLICY IF EXISTS "Public read access for wedding photos" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for wedding photos" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for wedding photos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for wedding photos" ON storage.objects;

CREATE POLICY "Public read access for wedding photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-photos');

CREATE POLICY "Public upload access for wedding photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wedding-photos');

CREATE POLICY "Public update access for wedding photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'wedding-photos');

CREATE POLICY "Public delete access for wedding photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'wedding-photos');

-- Create wedding_guests table
CREATE TABLE IF NOT EXISTS public.wedding_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.wedding_guests ENABLE ROW LEVEL SECURITY;

-- Drop and recreate guest policies
DROP POLICY IF EXISTS "Public read access for guests" ON public.wedding_guests;
DROP POLICY IF EXISTS "Public insert access for guests" ON public.wedding_guests;
DROP POLICY IF EXISTS "Public delete access for guests" ON public.wedding_guests;

CREATE POLICY "Public read access for guests"
ON public.wedding_guests FOR SELECT
TO public
USING (true);

CREATE POLICY "Public insert access for guests"
ON public.wedding_guests FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public delete access for guests"
ON public.wedding_guests FOR DELETE
TO public
USING (true);

-- Create wedding_photos table
CREATE TABLE IF NOT EXISTS public.wedding_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.wedding_guests(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.wedding_photos ENABLE ROW LEVEL SECURITY;

-- Drop and recreate photo policies (including DELETE which was missing)
DROP POLICY IF EXISTS "Public read access for photos" ON public.wedding_photos;
DROP POLICY IF EXISTS "Public insert access for photos" ON public.wedding_photos;
DROP POLICY IF EXISTS "Public delete access for photos" ON public.wedding_photos;

CREATE POLICY "Public read access for photos"
ON public.wedding_photos FOR SELECT
TO public
USING (true);

CREATE POLICY "Public insert access for photos"
ON public.wedding_photos FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public delete access for photos"
ON public.wedding_photos FOR DELETE
TO public
USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_wedding_photos_guest_id ON public.wedding_photos(guest_id);
CREATE INDEX IF NOT EXISTS idx_wedding_photos_created_at ON public.wedding_photos(created_at DESC);

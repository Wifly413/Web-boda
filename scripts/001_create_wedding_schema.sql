-- Create storage bucket for wedding photos (avatars and photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-photos', 'wedding-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for wedding-photos bucket (public access)
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

-- Create wedding_guests table to store guest info
CREATE TABLE IF NOT EXISTS public.wedding_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but allow public access
ALTER TABLE public.wedding_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for guests"
ON public.wedding_guests FOR SELECT
TO public
USING (true);

CREATE POLICY "Public insert access for guests"
ON public.wedding_guests FOR INSERT
TO public
WITH CHECK (true);

-- Create wedding_photos table to store photo records
CREATE TABLE IF NOT EXISTS public.wedding_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.wedding_guests(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but allow public access
ALTER TABLE public.wedding_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for photos"
ON public.wedding_photos FOR SELECT
TO public
USING (true);

CREATE POLICY "Public insert access for photos"
ON public.wedding_photos FOR INSERT
TO public
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_wedding_photos_guest_id ON public.wedding_photos(guest_id);
CREATE INDEX IF NOT EXISTS idx_wedding_photos_created_at ON public.wedding_photos(created_at DESC);

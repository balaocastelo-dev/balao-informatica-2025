-- Create storage bucket for banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to banner images
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Allow anyone to upload banner images
CREATE POLICY "Anyone can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners');

-- Allow anyone to update banner images
CREATE POLICY "Anyone can update banner images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banners');

-- Allow anyone to delete banner images
CREATE POLICY "Anyone can delete banner images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banners');
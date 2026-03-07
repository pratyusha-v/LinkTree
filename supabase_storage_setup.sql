-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the media bucket
CREATE POLICY "Anyone can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Anyone can update their own media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Anyone can delete their own media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');

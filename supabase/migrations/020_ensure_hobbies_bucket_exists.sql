-- Ensure hobbies storage bucket exists for hobby image uploads

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hobbies',
  'hobbies',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id)
DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy: Authenticated users can upload hobby images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload to hobbies'
  ) THEN
    CREATE POLICY "Users can upload to hobbies"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'hobbies');
  END IF;
END $$;

-- Policy: Anyone can read/download hobby images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read hobbies'
  ) THEN
    CREATE POLICY "Public read hobbies"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'hobbies');
  END IF;
END $$;

-- Policy: Authenticated users can delete hobby images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete hobbies'
  ) THEN
    CREATE POLICY "Users can delete hobbies"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'hobbies');
  END IF;
END $$;

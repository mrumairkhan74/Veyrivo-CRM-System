-- Supabase Storage Bucket for Avatars
-- Run this in Supabase Dashboard → Storage → New Bucket
-- Or run in SQL Editor after enabling storage

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies for avatars bucket
-- Users can upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Public read access for avatars
CREATE POLICY "Public read access for avatars" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'avatars');

-- Admins can manage all avatars
CREATE POLICY "Admins can manage all avatars" ON storage.objects
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
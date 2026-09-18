-- ====================================================================
-- KOTAIAH SWEETS - SUPABASE STORAGE BUCKET & PRODUCT IMAGE_URL MIGRATION
-- ====================================================================

-- 1. Ensure image_url column exists on public.products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Setup product-images Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 3. Storage Policies for product-images bucket
-- Public Read Policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Read on Product Images Bucket'
    ) THEN
        CREATE POLICY "Public Read on Product Images Bucket"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Authenticated / Admin Upload Policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload to Product Images'
    ) THEN
        CREATE POLICY "Authenticated Upload to Product Images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'product-images');
    END IF;
END $$;

-- Authenticated / Admin Update Policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Update in Product Images'
    ) THEN
        CREATE POLICY "Authenticated Update in Product Images"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Authenticated / Admin Delete Policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Delete in Product Images'
    ) THEN
        CREATE POLICY "Authenticated Delete in Product Images"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'product-images');
    END IF;
END $$;

-- 4. Sync product image_url from product_images table if present
UPDATE public.products p
SET image_url = (
    SELECT pi.image_url 
    FROM public.product_images pi 
    WHERE pi.product_id = p.id 
    ORDER BY pi.is_primary DESC, pi.display_order ASC 
    LIMIT 1
)
WHERE p.image_url IS NULL;

-- 5. Standardize slug-based image URLs
UPDATE public.products
SET image_url = COALESCE(image_url, 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=800&q=80')
WHERE image_url IS NULL;

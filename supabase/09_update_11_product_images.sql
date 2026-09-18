-- ====================================================================
-- KOTAIAH SWEETS - UPDATE 11 PRODUCT IMAGES IN SUPABASE DATABASE
-- ====================================================================
-- Updates image_url for the 11 specific products to use Supabase Storage CDN URLs
-- and their authentic provided images in product-images bucket.

-- 1. Ensure product-images storage bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880;

-- 2. Public Read Storage Policy
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

-- 3. Update the 11 Product Images in public.products (Matching by EXACT Product Name)

-- 1. Bobbatlu -> bobbatlu.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/bobbatlu.jpg',
    updated_at = now()
WHERE name = 'Bobbatlu' OR slug = 'bobbatlu';

-- 2. Sunnundalu -> sunnundalu.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/sunnundalu.jpg',
    updated_at = now()
WHERE name = 'Sunnundalu' OR slug = 'sunnundalu';

-- 3. Jangri -> jangri.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/jangri.jpg',
    updated_at = now()
WHERE name = 'Jangri' OR slug = 'jangri';

-- 4. Paneer Jalebi -> paneer-jalebi.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/paneer-jalebi.jpg',
    updated_at = now()
WHERE name = 'Paneer Jalebi' OR slug = 'paneer-jalebi';

-- 5. Kaju Barfi -> kaju-barfi.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/kaju-barfi.jpg',
    updated_at = now()
WHERE name = 'Kaju Barfi' OR slug = 'kaju-barfi';

-- 6. Madatha Kaja -> madatha-kaja.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/madatha-kaja.jpg',
    updated_at = now()
WHERE name = 'Madatha Kaja' OR slug = 'madatha-kaja';

-- 7. Gulab Jamun -> gulab-jamun.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/gulab-jamun.jpg',
    updated_at = now()
WHERE name = 'Gulab Jamun' OR slug = 'gulab-jamun';

-- 8. Bellam Gavvalu -> bellam-gavvalu.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/bellam-gavvalu.jpg',
    updated_at = now()
WHERE name = 'Bellam Gavvalu' OR slug = 'bellam-gavvalu';

-- 9. Mysore Pak -> mysore-pak.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/mysore-pak.jpg',
    updated_at = now()
WHERE name = 'Mysore Pak' OR slug = 'mysore-pak';

-- 10. Malai Puri -> malai-puri.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/malai-puri.jpg',
    updated_at = now()
WHERE name = 'Malai Puri' OR slug = 'malai-puri';

-- 11. White Rasakanda -> white-rasakanda.jpg
UPDATE public.products
SET image_url = 'https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/product-images/sweets/white-rasakanda.jpg',
    updated_at = now()
WHERE name = 'White Rasakanda' OR slug = 'white-rasakanda';

-- 4. Sync product_images table gallery entries
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary)
SELECT p.id, p.image_url, p.name, true
FROM public.products p
WHERE p.name IN (
    'Bobbatlu', 'Sunnundalu', 'Jangri', 'Paneer Jalebi', 'Kaju Barfi',
    'Madatha Kaja', 'Gulab Jamun', 'Bellam Gavvalu', 'Mysore Pak', 'Malai Puri', 'White Rasakanda'
)
ON CONFLICT DO NOTHING;

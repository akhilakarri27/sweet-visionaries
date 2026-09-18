-- ====================================================================
-- KOTAIAH SWEETS - SITE SETTINGS & HERO VIDEO STORAGE SETUP
-- ====================================================================

-- 1. Create Site Settings Table for Dynamic Configurations
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read of all site settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Site Settings' AND tablename = 'site_settings'
    ) THEN
        CREATE POLICY "Public Read Site Settings"
        ON public.site_settings FOR SELECT
        USING (true);
    END IF;
END $$;

-- Allow authenticated admins to insert/update settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admins Manage Site Settings' AND tablename = 'site_settings'
    ) THEN
        CREATE POLICY "Admins Manage Site Settings"
        ON public.site_settings FOR ALL
        USING (
            auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'shop_owner'))
        );
    END IF;
END $$;

-- 2. Ensure hero-videos Storage Bucket Exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-videos', 'hero-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure Public Read on hero-videos Bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Hero Videos'
    ) THEN
        CREATE POLICY "Public Read Hero Videos"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'hero-videos');
    END IF;
END $$;

-- 3. Seed Default Hero Video and Poster Settings
INSERT INTO public.site_settings (key, value, description)
VALUES
    ('hero_video_url', '"https://bunigrqjuvrenwgsodab.supabase.co/storage/v1/object/public/hero-videos/kotaiah-sweets-hero.mp4"'::jsonb, 'Supabase Storage Hero Video Public URL'),
    ('hero_poster_url', '"/sweets/kakinada-gottam-kaja.jpg"'::jsonb, 'Hero Poster fallback image URL')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now();

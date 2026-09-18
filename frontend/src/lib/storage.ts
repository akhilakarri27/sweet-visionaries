import { supabase } from './supabase';
import { Product } from '../types/database';

export const STORAGE_BUCKET = 'product-images';
export const HERO_STORAGE_BUCKET = 'hero-videos';
export const SWEET_VIDEOS_STORAGE_BUCKET = 'sweet-videos';
export const DEFAULT_FALLBACK_IMAGE = '/sweets/kakinada-gottam-kaja.jpg';

const SUPABASE_BASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bunigrqjuvrenwgsodab.supabase.co';

// Default Supabase Storage URL for Hero Video and Poster
export const DEFAULT_HERO_VIDEO_URL = `${SUPABASE_BASE_URL}/storage/v1/object/public/hero-videos/kotaiah-sweets-hero.mp4`;
export const DEFAULT_HERO_POSTER_URL = '/sweets/kakinada-gottam-kaja.jpg';
export const DEFAULT_HERO_HEADING = 'Fresh Sweets. Traditional Taste.';
export const DEFAULT_HERO_SUBHEADING = 'Original Kakinada Gottam Kaja & Pure Desi Cow Ghee Delicacies Since 1900';
export const DEFAULT_HERO_CTA_TEXT = 'ORDER NOW';

export interface SweetVideoSlide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  videoUrl: string;
  posterUrl: string;
  ctaText: string;
  ctaLink: string;
  priceText?: string;
}

export const DEFAULT_SWEET_VIDEO_SLIDES: SweetVideoSlide[] = [
  {
    id: 'kaja-slide',
    title: 'Kakinada Gottam Kaja',
    subtitle: 'Crisp golden crust oozing with warm cardamom sugar nectar in pure desi ghee.',
    tag: 'Signature Heritage',
    videoUrl: `${SUPABASE_BASE_URL}/storage/v1/object/public/sweet-videos/kaja-video.mp4`,
    posterUrl: '/sweets/kakinada-gottam-kaja.jpg',
    ctaText: 'ORDER NOW',
    ctaLink: '/products?category=b1000000-0000-0000-0000-000000000001',
    priceText: 'From ₹240',
  },
  {
    id: 'laddu-slide',
    title: 'Pure Ghee Motichoor Laddu',
    subtitle: 'Melt-in-mouth golden boondi pearls infused with saffron and crunchy cashew nuts.',
    tag: 'Festive Delight',
    videoUrl: `${SUPABASE_BASE_URL}/storage/v1/object/public/sweet-videos/laddu-video.mp4`,
    posterUrl: '/sweets/mothi-laddu.jpg',
    ctaText: 'ORDER NOW',
    ctaLink: '/products?category=b1000000-0000-0000-0000-000000000004',
    priceText: 'From ₹260',
  },
  {
    id: 'pootharekulu-slide',
    title: 'Atreyapuram Bellam Pootharekulu',
    subtitle: 'Wafer-thin rice paper wraps stuffed with hand-crushed dry fruits & organic jaggery.',
    tag: 'Authentic Andhra',
    videoUrl: `${SUPABASE_BASE_URL}/storage/v1/object/public/sweet-videos/pootharekulu-video.mp4`,
    posterUrl: '/sweets/bellam-pootharekulu.jpg',
    ctaText: 'ORDER NOW',
    ctaLink: '/products?category=b1000000-0000-0000-0000-000000000007',
    priceText: 'From ₹320',
  },
  {
    id: 'assorted-slide',
    title: 'Assorted Royal Sweets Box',
    subtitle: 'A grand celebration hamper curated with Mysore Pak, Kaju Barfi, and Kaja varieties.',
    tag: 'Grand Gifting',
    videoUrl: `${SUPABASE_BASE_URL}/storage/v1/object/public/sweet-videos/assorted-sweets.mp4`,
    posterUrl: '/sweets/mysore-pak.jpg',
    ctaText: 'ORDER NOW',
    ctaLink: '/products',
    priceText: 'From ₹499',
  },
  {
    id: 'packing-slide',
    title: 'Artisanal Fresh Packing',
    subtitle: 'Vacuum-sealed freshness boxes prepared every morning and shipped nationwide.',
    tag: 'Freshness Guaranteed',
    videoUrl: `${SUPABASE_BASE_URL}/storage/v1/object/public/sweet-videos/sweets-packing.mp4`,
    posterUrl: '/sweets/special-andhra-ribbon-murukku.jpg',
    ctaText: 'ORDER NOW',
    ctaLink: '/products',
    priceText: 'Express Delivery',
  },
];

export interface TemptationVideoCard {
  id: string;
  name: string;
  category: string;
  tasteNote: string;
  videoUrl: string;
  posterUrl: string;
  price: number;
  slug: string;
  productId?: string;
}

export const DEFAULT_TEMPTATION_VIDEOS: TemptationVideoCard[] = [
  {
    id: 'tempt-kaja',
    name: 'Kakinada Gottam Kaja',
    category: 'Kaja Specials',
    tasteNote: 'Crisp exterior with hot juicy syrup heart',
    videoUrl: `${SUPABASE_BASE_URL}/storage/v1/object/public/sweet-videos/kaja-video.mp4`,
    posterUrl: '/sweets/kakinada-gottam-kaja.jpg',
    price: 240,
    slug: 'kakinada-gottam-kaja',
  },
  {
    id: 'tempt-laddu',
    name: 'Special Motichoor Laddu',
    category: 'Laddu Varieties',
    tasteNote: 'Slow-cooked in pure cow ghee with saffron',
    videoUrl: `${SUPABASE_BASE_URL}/storage/v1/object/public/sweet-videos/laddu-video.mp4`,
    posterUrl: '/sweets/mothi-laddu.jpg',
    price: 260,
    slug: 'mothi-laddu',
  },
  {
    id: 'tempt-pootharekulu',
    name: 'Dry Fruit Bellam Pootharekulu',
    category: 'Pootharekulu',
    tasteNote: 'Delicate edible rice film & roasted dry fruits',
    videoUrl: `${SUPABASE_BASE_URL}/storage/v1/object/public/sweet-videos/pootharekulu-video.mp4`,
    posterUrl: '/sweets/dry-fruit-bellam-pootharekulu.jpg',
    price: 360,
    slug: 'dry-fruit-bellam-pootharekulu',
  },
  {
    id: 'tempt-assorted',
    name: 'Royal Mysore Pak & Kalakand',
    category: 'Milk & Ghee Sweets',
    tasteNote: 'Rich melt-in-mouth fudge made with pure cream',
    videoUrl: `${SUPABASE_BASE_URL}/storage/v1/object/public/sweet-videos/assorted-sweets.mp4`,
    posterUrl: '/sweets/mysore-pak.jpg',
    price: 280,
    slug: 'mysore-pak',
  },
];

let cachedSettings: Record<string, any> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

/**
 * Fetch all dynamic site configurations in a single batched Supabase query
 */
export async function getAllSiteSettings(forceRefresh = false): Promise<Record<string, any>> {
  const now = Date.now();
  if (!forceRefresh && cachedSettings && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedSettings;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error || !data) {
      return cachedSettings || {};
    }

    const settingsMap: Record<string, any> = {};
    for (const item of data) {
      let val = item.value;
      if (typeof val === 'string') {
        try {
          val = JSON.parse(val);
        } catch {
          // If not JSON, use cleaned string
          val = val.replace(/^"(.*)"$/, '$1');
        }
      }
      settingsMap[item.key] = val;
    }

    cachedSettings = settingsMap;
    lastFetchTime = now;
    return settingsMap;
  } catch (err) {
    console.warn('Could not load site settings batch, using cache or defaults:', err);
    return cachedSettings || {};
  }
}

/**
 * Fetch dynamic site configuration from Supabase site_settings table
 */
export async function getSiteSetting<T>(key: string, defaultValue: T): Promise<T> {
  // Use cached batch settings if available
  if (cachedSettings && cachedSettings[key] !== undefined) {
    return cachedSettings[key] as T;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error || !data || data.value === undefined || data.value === null) {
      return defaultValue;
    }

    let val = data.value;
    if (typeof val === 'string') {
      try {
        val = JSON.parse(val);
      } catch {
        val = val.replace(/^"(.*)"$/, '$1');
      }
    }

    return (val ?? defaultValue) as T;
  } catch (err) {
    console.warn(`Could not load site setting '${key}', using default:`, err);
    return defaultValue;
  }
}

/**
 * Update dynamic site setting in Supabase site_settings table
 */
export async function updateSiteSetting(key: string, value: any, description?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        description: description || `Configuration for ${key}`,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`Error updating site setting ${key}:`, error);
      return { success: false, error: error.message };
    }

    // Invalidate local memory cache immediately
    cachedSettings = null;
    lastFetchTime = 0;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update setting' };
  }
}

/**
 * Upload Hero Video to Supabase Storage
 */
export async function uploadHeroVideoFile(file: File): Promise<UploadImageResult> {
  try {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.endsWith('.mp4') && !file.name.endsWith('.webm')) {
      return {
        success: false,
        error: `Invalid video format (${file.type}). Please provide an MP4 or WebM video file.`,
      };
    }

    // Limit video size (100MB max)
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_VIDEO_SIZE) {
      return {
        success: false,
        error: `Video is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max size is 100MB.`,
      };
    }

    const storagePath = 'kotaiah-sweets-hero.mp4';
    const { error: uploadError } = await supabase.storage
      .from(HERO_STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'video/mp4',
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(HERO_STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // Save to site_settings
    await updateSiteSetting('hero_video_url', publicUrl, 'Public hero video URL');

    return {
      success: true,
      publicUrl,
      storagePath,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to upload hero video.' };
  }
}

/**
 * Upload Hero Poster to Supabase Storage
 */
export async function uploadHeroPosterFile(file: File): Promise<UploadImageResult> {
  try {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        success: false,
        error: `Invalid image type (${file.type}). Please upload a JPG, PNG, or WebP image.`,
      };
    }

    const storagePath = 'kotaiah-sweets-poster.jpg';
    const { error: uploadError } = await supabase.storage
      .from(HERO_STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(HERO_STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // Save to site_settings
    await updateSiteSetting('hero_poster_url', publicUrl, 'Public hero poster image URL');

    return {
      success: true,
      publicUrl,
      storagePath,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to upload hero poster.' };
  }
}

/**
 * Generate standard Supabase Storage public URL for a sweet slug
 */
export function getSupabaseStorageUrl(slug: string, ext: string = 'jpg'): string {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(`sweets/${cleanSlug}.${ext}`);
  return data.publicUrl;
}

/**
 * Get the definitive product image URL with graceful fallback
 */
export function getProductImageUrl(product?: Partial<Product> | null): string {
  if (!product) return DEFAULT_FALLBACK_IMAGE;

  // 1. If explicit image_url exists on the product record, use it
  if (product.image_url && product.image_url.trim().length > 0) {
    return product.image_url.trim();
  }

  // 2. If primary gallery image exists, use it
  const primaryGallery = product.product_images?.find((img) => img.is_primary)?.image_url;
  if (primaryGallery && primaryGallery.trim().length > 0) {
    return primaryGallery.trim();
  }

  const firstGallery = product.product_images?.[0]?.image_url;
  if (firstGallery && firstGallery.trim().length > 0) {
    return firstGallery.trim();
  }

  // 3. If product slug exists, check standard local / storage paths
  if (product.slug) {
    const cleanSlug = product.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `/sweets/${cleanSlug}.jpg`;
  }

  if (product.name) {
    const cleanSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `/sweets/${cleanSlug}.jpg`;
  }

  return DEFAULT_FALLBACK_IMAGE;
}

export interface UploadImageResult {
  success: boolean;
  publicUrl?: string;
  storagePath?: string;
  error?: string;
}

/**
 * Upload a product sweet image to Supabase Storage and optionally sync to product record
 */
export async function uploadProductSweetImage(
  file: File,
  productSlug: string,
  productId?: string
): Promise<UploadImageResult> {
  try {
    // 1. Validate File Type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        success: false,
        error: `Invalid file type: ${file.type}. Please upload a JPEG, PNG, or WebP image.`,
      };
    }

    // 2. Validate File Size (Limit: 5MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return {
        success: false,
        error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max allowed size is 5MB.`,
      };
    }

    // 3. Determine clean extension and slug
    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';
    else if (file.name.includes('.')) {
      const parts = file.name.split('.');
      ext = parts[parts.length - 1].toLowerCase();
    }

    const cleanSlug = productSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const storagePath = `sweets/${cleanSlug}.${ext}`;

    // 4. Upload file to Supabase Storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // 5. Retrieve Public URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // 6. If productId is provided, immediately update products.image_url in database
    if (productId) {
      const { error: dbError } = await supabase
        .from('products')
        .update({
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (dbError) {
        console.warn('Database image_url update warning:', dbError.message);
      }

      // Also upsert primary product_images entry for gallery support
      await supabase.from('product_images').upsert({
        product_id: productId,
        image_url: publicUrl,
        alt_text: productSlug,
        is_primary: true,
      });
    }

    return {
      success: true,
      publicUrl,
      storagePath,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during image upload.',
    };
  }
}

/**
 * Upload sweet video file to Supabase Storage (sweet-videos or hero-videos bucket)
 */
export async function uploadSweetVideoFile(
  file: File,
  filename: string,
  bucket: string = SWEET_VIDEOS_STORAGE_BUCKET
): Promise<UploadImageResult> {
  try {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.endsWith('.mp4') && !file.name.endsWith('.webm')) {
      return {
        success: false,
        error: `Invalid video format (${file.type}). Please provide an MP4 or WebM video file.`,
      };
    }

    const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_VIDEO_SIZE) {
      return {
        success: false,
        error: `Video is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max allowed size is 100MB.`,
      };
    }

    const cleanFilename = filename.toLowerCase().endsWith('.mp4') ? filename : `${filename}.mp4`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(cleanFilename, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'video/mp4',
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(cleanFilename);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
      storagePath: cleanFilename,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to upload sweet video.',
    };
  }
}


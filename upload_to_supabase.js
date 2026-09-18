const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
dotenv.config({ path: path.join(__dirname, 'frontend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Supabase URL or Key not found in .env files.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImages() {
  console.log('Connecting to Supabase at:', supabaseUrl);
  const sweetsDir = path.join(__dirname, 'frontend', 'public', 'sweets');
  if (!fs.existsSync(sweetsDir)) {
    console.error('Sweets directory not found:', sweetsDir);
    return;
  }

  // Ensure bucket exists
  const { data: buckets, error: bucketListErr } = await supabase.storage.listBuckets();
  if (bucketListErr) {
    console.warn('Could not list buckets (likely anon key):', bucketListErr.message);
  } else {
    const exists = buckets.some(b => b.name === 'product-images');
    if (!exists) {
      console.log('Creating product-images bucket...');
      await supabase.storage.createBucket('product-images', { public: true });
    }
  }

  const files = fs.readdirSync(sweetsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.webp'));
  console.log(`Found ${files.length} sweet images to upload/sync...`);

  let successCount = 0;
  for (const file of files) {
    const filePath = path.join(sweetsDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = file.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    const storagePath = `sweets/${file}`;

    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (uploadErr) {
      console.warn(`[UPLOAD SKIP/WARN] ${file}: ${uploadErr.message}`);
    } else {
      successCount++;
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(storagePath);
      console.log(`[OK] Uploaded ${file} -> ${urlData.publicUrl}`);
    }
  }

  console.log(`\nSupabase Storage Sync complete: ${successCount}/${files.length} images uploaded.`);
}

uploadImages().catch(err => {
  console.error('Upload script encountered an error:', err.message);
});

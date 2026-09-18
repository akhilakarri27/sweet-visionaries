const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
dotenv.config({ path: path.join(__dirname, 'frontend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key not found in .env files.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadHeroVideo(videoFilePath) {
  if (!videoFilePath) {
    console.error('❌ Usage: node upload_hero_video.js "<path-to-video.mp4>"');
    process.exit(1);
  }

  const resolvedPath = path.resolve(videoFilePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Video file does not exist at: ${resolvedPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(resolvedPath);
  console.log(`📹 Preparing to upload video: ${resolvedPath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

  const fileBuffer = fs.readFileSync(resolvedPath);
  const targetBucket = 'hero-videos';
  const targetPath = 'kotaiah-sweets-hero.mp4';

  // 1. Upload/Upsert to Supabase Storage
  console.log(`⬆️ Uploading to Supabase Storage: bucket '${targetBucket}', file '${targetPath}'...`);
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from(targetBucket)
    .upload(targetPath, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true,
    });

  if (uploadErr) {
    console.error('❌ Upload failed:', uploadErr.message);
    process.exit(1);
  }

  // 2. Get Public URL
  const { data: publicUrlData } = supabase.storage
    .from(targetBucket)
    .getPublicUrl(targetPath);

  const heroVideoUrl = publicUrlData.publicUrl;
  console.log(`✅ Video uploaded successfully!`);
  console.log(`🌐 Public URL: ${heroVideoUrl}`);

  // 3. Update site_settings table in Supabase
  console.log('⚙️ Updating site_settings in database...');
  const { error: settingsErr } = await supabase
    .from('site_settings')
    .upsert({
      key: 'hero_video_url',
      value: heroVideoUrl,
      description: 'Supabase Storage Hero Video Public URL',
      updated_at: new Date().toISOString()
    });

  if (settingsErr) {
    console.warn(`⚠️ Could not update site_settings table (${settingsErr.message}), but public URL is available: ${heroVideoUrl}`);
  } else {
    console.log(`✅ site_settings updated successfully with key 'hero_video_url'!`);
  }

  console.log('\n🎉 Hero video configuration complete!');
}

const inputVideoPath = process.argv[2];
uploadHeroVideo(inputVideoPath).catch(err => {
  console.error('Fatal error during hero video upload:', err);
  process.exit(1);
});

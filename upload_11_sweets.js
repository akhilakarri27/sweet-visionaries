const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('./backend/node_modules/dotenv');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
dotenv.config({ path: path.join(__dirname, 'frontend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://bunigrqjuvrenwgsodab.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

const mapping = [
  { name: 'Bobbatlu', file: 'bobbatlu.jpg' },
  { name: 'Sunnundalu', file: 'sunnundalu.jpg' },
  { name: 'Jangri', file: 'jangri.jpg' },
  { name: 'Paneer Jalebi', file: 'paneer-jalebi.jpg' },
  { name: 'Kaju Barfi', file: 'kaju-barfi.jpg' },
  { name: 'Madatha Kaja', file: 'madatha-kaja.jpg' },
  { name: 'Gulab Jamun', file: 'gulab-jamun.jpg' },
  { name: 'Bellam Gavvalu', file: 'bellam-gavvalu.jpg' },
  { name: 'Mysore Pak', file: 'mysore-pak.jpg' },
  { name: 'Malai Puri', file: 'malai-puri.jpg' },
  { name: 'White Rasakanda', file: 'white-rasakanda.jpg' }
];

async function run() {
  const sweetsDir = path.join(__dirname, 'frontend', 'public', 'sweets');
  console.log('Checking local sweets directory:', sweetsDir);

  for (const item of mapping) {
    const filePath = path.join(sweetsDir, item.file);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing file: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `sweets/${item.file}`;

    console.log(`Uploading ${item.file} (${fileBuffer.length} bytes) to product-images/${storagePath}...`);
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.warn(`Upload warning for ${item.file}:`, uploadError.message);
    } else {
      console.log(`✓ Uploaded ${item.file}`);
    }

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;
    console.log(`Public URL for ${item.name}: ${publicUrl}`);

    // Update product table by EXACT name
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({
        image_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('name', item.name)
      .select('id, name, image_url');

    if (updateError) {
      console.warn(`DB update warning for ${item.name}:`, updateError.message);
    } else if (updateData && updateData.length > 0) {
      console.log(`✓ DB updated for product: ${updateData[0].name} -> ${updateData[0].image_url}`);
    } else {
      console.log(`Note: No database row matching name='${item.name}' found to update via client (will be updated via SQL migration script).`);
    }
  }

  console.log('\nAll 11 product image uploads processed.');
}

run().catch(console.error);

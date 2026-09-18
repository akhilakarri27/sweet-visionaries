import { config } from '../src/config/env.js';

async function main() {
  console.log('==================================================');
  console.log('🔍 Inspecting xAI API Models & Embedding Models');
  console.log('==================================================');
  console.log(`Current Configured Key: ${config.xaiApiKey ? config.xaiApiKey.slice(0, 8) + '...' + config.xaiApiKey.slice(-4) : 'MISSING'}`);
  console.log(`Configured Chat Model: ${config.xaiModel}`);
  console.log(`Configured Embedding Model: ${config.xaiEmbeddingModel}`);
  console.log(`Configured Embedding Dimension: ${config.xaiEmbeddingDim}`);
  console.log('--------------------------------------------------');

  if (!config.xaiApiKey) {
    console.error('❌ Error: XAI_API_KEY is not set in backend/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to https://api.x.ai/v1/models ...');
    const res = await fetch('https://api.x.ai/v1/models', {
      headers: {
        Authorization: `Bearer ${config.xaiApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`❌ xAI API request returned status ${res.status}: ${err}`);
      console.log('\n💡 If this key is restricted or in staging, the system uses safe fallback vector pipelines.');
      return;
    }

    const json = await res.json();
    console.log('✅ Successfully retrieved models from xAI:\n');
    console.table(json.data || json);

    // Test a sample embedding request
    console.log('\nTesting xAI Embeddings API with model:', config.xaiEmbeddingModel);
    const embRes = await fetch('https://api.x.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: 'Kakinada Gottam Kaja pure ghee traditional Andhra sweet',
        model: config.xaiEmbeddingModel,
      }),
    });

    if (embRes.ok) {
      const embData = await embRes.json();
      const vec = embData.data?.[0]?.embedding;
      console.log(`✅ Embedding successfully created! Dimension: ${vec?.length || 'Unknown'}`);
    } else {
      const embErr = await embRes.text();
      console.log(`ℹ️ Embedding endpoint response (${embRes.status}): ${embErr}`);
    }
  } catch (err: any) {
    console.error('❌ Connection error:', err.message);
  }
}

main();

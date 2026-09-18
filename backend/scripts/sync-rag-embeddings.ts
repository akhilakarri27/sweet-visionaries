import { config } from '../src/config/env.js';
import { ragService } from '../src/services/rag.service.js';

async function main() {
  console.log('==================================================');
  console.log('🔄 Kotaiah Sweets: Syncing RAG Product Embeddings');
  console.log('==================================================');
  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`xAI Embedding Model: ${config.xaiEmbeddingModel}`);
  console.log('--------------------------------------------------');

  const defaultShopId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

  try {
    const summary = await ragService.syncShopRAGDocuments(defaultShopId);
    console.log(`\n🎉 RAG Synchronization Complete!`);
    console.log(`- Successfully indexed: ${summary.indexed} products`);
    console.log(`- Failed: ${summary.failed} products`);
  } catch (err: any) {
    console.error('❌ RAG sync failed:', err.message);
  }
}

main();

import { Router } from 'express';
import { handleChatMessage, createOrGetSession } from '../controllers/chat.controller.js';
import { generateEmbedding, syncShopRAG, getRAGStats } from '../controllers/rag.controller.js';
import { listAvailableModels } from '../controllers/xai.controller.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Kotaiah Sweets Backend & RAG Orchestrator',
    timestamp: new Date().toISOString(),
  });
});

// AI Shopping Assistant Endpoints (Grok 4.6 + pgvector RAG)
router.post('/chat', handleChatMessage);
router.post('/chat/session', createOrGetSession);

// RAG & Embeddings Endpoints
router.post('/embeddings/generate', generateEmbedding);
router.post('/rag/sync', syncShopRAG);
router.get('/rag/stats', getRAGStats);

// xAI Model Discovery & Introspection (Req #3 & #23)
router.get('/xai/models', listAvailableModels);

export default router;

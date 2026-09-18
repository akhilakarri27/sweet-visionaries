import { Request, Response } from 'express';
import { ragService } from '../services/rag.service.js';
import { xaiService } from '../services/xai.service.js';
import { getSupabaseAdmin } from '../services/supabase.service.js';

export async function generateEmbedding(req: Request, res: Response): Promise<void> {
  try {
    const { text, model } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text string is required for embedding generation' });
      return;
    }

    const vector = await xaiService.createEmbedding(text, model);
    res.status(200).json({
      success: true,
      dimension: vector.length,
      embedding: vector,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function syncShopRAG(req: Request, res: Response): Promise<void> {
  try {
    const { shopId } = req.body;
    const targetShopId = shopId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

    const summary = await ragService.syncShopRAGDocuments(targetShopId);
    res.status(200).json({
      success: true,
      message: `RAG documents synchronized for shop ${targetShopId}`,
      indexed: summary.indexed,
      failed: summary.failed,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getRAGStats(req: Request, res: Response): Promise<void> {
  try {
    const shopId = (req.query.shopId as string) || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    const supabase = getSupabaseAdmin();

    const { count, error } = await supabase
      .from('rag_documents')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId);

    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      shopId,
      documentCount: count || 0,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

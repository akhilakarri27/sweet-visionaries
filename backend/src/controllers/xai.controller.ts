import { Request, Response } from 'express';
import { xaiService } from '../services/xai.service.js';
import { config } from '../config/env.js';

export async function listAvailableModels(req: Request, res: Response): Promise<void> {
  try {
    const models = await xaiService.listModels();
    res.status(200).json({
      success: true,
      currentConfig: {
        chatModel: config.xaiModel,
        embeddingModel: config.xaiEmbeddingModel,
        embeddingDim: config.xaiEmbeddingDim,
      },
      models,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list models from xAI API',
      currentConfig: {
        chatModel: config.xaiModel,
        embeddingModel: config.xaiEmbeddingModel,
        embeddingDim: config.xaiEmbeddingDim,
      },
      hint: 'Verify that XAI_API_KEY is valid and has model listing permissions.',
    });
  }
}

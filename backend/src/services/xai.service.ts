import { config } from '../config/env.js';

export interface XAIModelItem {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class XAIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.x.ai/v1';

  constructor() {
    this.apiKey = config.xaiApiKey;
  }

  /**
   * List all models accessible to the configured xAI API key
   */
  async listModels(): Promise<XAIModelItem[]> {
    if (!this.apiKey) {
      throw new Error('xAI API key is missing. Please configure XAI_API_KEY in backend/.env');
    }

    const response = await fetch(`${this.baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to list xAI models (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    return data.data || [];
  }

  /**
   * Generate vector embedding for a given text using xAI Embeddings API
   */
  async createEmbedding(text: string, embeddingModel?: string): Promise<number[]> {
    if (!this.apiKey) {
      console.warn('xAI API key not set, generating deterministic mock embedding');
      return this.generateFallbackEmbedding(text, config.xaiEmbeddingDim);
    }

    const modelToUse = embeddingModel || config.xaiEmbeddingModel;

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text.trim(),
          model: modelToUse,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`xAI embeddings error with model ${modelToUse} (${response.status}): ${errorBody}. Using fallback vector generation.`);
        return this.generateFallbackEmbedding(text, config.xaiEmbeddingDim);
      }

      const data = (await response.json()) as any;
      if (data.data && data.data[0] && Array.isArray(data.data[0].embedding)) {
        return data.data[0].embedding;
      }

      return this.generateFallbackEmbedding(text, config.xaiEmbeddingDim);
    } catch (error) {
      console.error('Error invoking xAI Embeddings API:', error);
      return this.generateFallbackEmbedding(text, config.xaiEmbeddingDim);
    }
  }

  /**
   * Generate conversational response with Grok 4.6
   */
  async generateGrokResponse(
    messages: ChatMessage[],
    systemPrompt?: string,
    modelName?: string
  ): Promise<string> {
    if (!this.apiKey) {
      return "I am the Kotaiah Sweets AI shopping assistant. (xAI API key not configured yet). How may I assist you with our authentic sweets?";
    }

    const modelToUse = modelName || config.xaiModel || 'grok-4.6';
    const finalMessages: ChatMessage[] = [];

    if (systemPrompt) {
      finalMessages.push({ role: 'system', content: systemPrompt });
    }

    finalMessages.push(...messages);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: finalMessages,
          temperature: 0.2, // Low temperature for high factual grounding
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Grok API error (${response.status}):`, errText);
        throw new Error(`Grok API returned error: ${response.status} - ${errText}`);
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response received from Grok model');
      }

      return content;
    } catch (error: any) {
      console.error('Error in Grok completion:', error);
      throw error;
    }
  }

  /**
   * Generates a deterministic normalized pseudo-embedding when xAI key or embedding endpoint is unavailable
   */
  private generateFallbackEmbedding(text: string, dimension: number = 1536): number[] {
    const vector = new Array(dimension).fill(0);
    const cleaned = text.toLowerCase();
    
    for (let i = 0; i < cleaned.length; i++) {
      const charCode = cleaned.charCodeAt(i);
      const index = (charCode * 31 + i * 17) % dimension;
      vector[index] += 1.0;
    }

    // Normalize vector (L2 norm)
    let norm = 0;
    for (let i = 0; i < dimension; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm) || 1;

    for (let i = 0; i < dimension; i++) {
      vector[i] = parseFloat((vector[i] / norm).toFixed(6));
    }

    return vector;
  }
}

export const xaiService = new XAIService();

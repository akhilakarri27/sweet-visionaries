import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  clientUrl: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseAnonKey: string;
  xaiApiKey: string;
  xaiBaseUrl: string;
  xaiModel: string;
  xaiEmbeddingModel: string;
  xaiEmbeddingDim: number;
}

const rawApiKey = process.env.XAI_API_KEY || process.env.GROQ_API_KEY || '';
const isGroqKey = rawApiKey.startsWith('gsk_');

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL || 'https://bunigrqjuvrenwgsodab.supabase.co',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  xaiApiKey: rawApiKey,
  xaiBaseUrl: process.env.XAI_BASE_URL || (isGroqKey ? 'https://api.groq.com/openai/v1' : 'https://api.x.ai/v1'),
  xaiModel: process.env.XAI_MODEL || (isGroqKey ? 'qwen/qwen3.8-27b' : 'grok-4.6'),
  xaiEmbeddingModel: process.env.XAI_EMBEDDING_MODEL || 'embedding-bert',
  xaiEmbeddingDim: parseInt(process.env.XAI_EMBEDDING_DIM || '1536', 10),
};

if (!config.xaiApiKey) {
  console.warn('⚠️ WARNING: XAI_API_KEY is not set. AI assistant and embeddings will run in fallback mock mode.');
}

if (!config.supabaseUrl) {
  console.warn('⚠️ WARNING: SUPABASE_URL is not configured.');
}

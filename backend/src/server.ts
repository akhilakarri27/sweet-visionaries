import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import apiRoutes from './routes/api.routes.js';

// Kotaiah Sweets API Application
const app = express();

// Security Headers
app.use(helmet());

// CORS configuration (allow Vite frontend dev server and production domains)
app.use(cors({
  origin: [
    config.clientUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP Logger
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiter for AI Chat / Grok endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { error: 'Too many requests to the AI Assistant. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/chat', aiLimiter);

// Mount API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Kotaiah Sweets API & RAG Gateway',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const server = app.listen(config.port, () => {
  console.log(`==================================================`);
  console.log(`🚀 Kotaiah Sweets Secure API Server running on port ${config.port}`);
  console.log(`📍 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`🤖 xAI Model: ${config.xaiModel} | Embedding Model: ${config.xaiEmbeddingModel}`);
  console.log(`==================================================`);
});

export default app;

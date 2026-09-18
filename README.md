# 🪔 Kotaiah Sweets - Full-Stack E-Commerce & Hybrid RAG Platform

A modern, production-ready, full-stack Indian sweets e-commerce web application for **Kotaiah Sweets** (Master artisans of authentic Kakinada Gottam Kaja and pure desi ghee delicacies since 1900).

Built with **React, Vite, TypeScript, Tailwind CSS**, **Supabase (PostgreSQL + pgvector + Auth + Storage + RLS)**, and a secure **Node.js/Express backend** integrating **xAI Grok 4.6** and **xAI Embeddings** for a Hybrid RAG shopping assistant.

---

## 🏛️ System Architecture

```
                      CUSTOMER / ADMIN BROWSER
                     (React + Vite + TypeScript)
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
       SUPABASE CLOUD                    SECURE BACKEND API
   - PostgreSQL 16 + pgvector          - Node.js + Express
   - Supabase Auth (JWT & RLS)         - xAI Grok 4.6 Model
   - Supabase Storage                  - xAI Embeddings API
   - RLS Row Isolation                 - pgvector RAG Orchestrator
                                                 │
                                                 ▼
                                           xAI CLOUD API
```

---

## 📁 Repository Structure

```
├── backend/                  # Secure Node/Express Server & AI Gateway
│   ├── src/
│   │   ├── config/env.ts     # Env validation & secrets manager
│   │   ├── controllers/      # Chat, RAG sync & xAI model discovery
│   │   ├── routes/           # API router endpoints
│   │   ├── services/         # Grok 4.6, Embeddings & RAG retrieval service
│   │   └── server.ts         # Express server with Helmet, CORS & Rate limiting
│   ├── scripts/
│   │   ├── inspect-xai-models.ts  # Inspect & list xAI chat & embedding models
│   │   └── sync-rag-embeddings.ts # Batch index products into pgvector
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # Customer Web App & Dashboards
│   ├── src/
│   │   ├── components/
│   │   │   ├── chatbot/      # Floating Grok AI Shopping Assistant
│   │   │   ├── layout/       # Navbar & Footer
│   │   │   ├── products/     # ProductCard & Filter Sidebar
│   │   │   └── ui/           # Toast, Skeleton loaders
│   │   ├── context/          # AuthContext, CartContext, WishlistContext
│   │   ├── pages/            # Home, Products, Details, Cart, Checkout, etc.
│   │   ├── types/            # Database TypeScript types
│   │   └── lib/supabase.ts   # Supabase client initializer
│   ├── .env.example
│   └── package.json
│
└── supabase/                 # Database Migrations & Seed Data
    ├── 01_schema.sql         # PostgreSQL tables & pgvector extension
    ├── 02_rls_policies.sql   # Row Level Security policies
    ├── 03_pgvector_rpc.sql   # match_rag_documents similarity search RPC
    └── 04_storage_and_seed.sql # Storage buckets & authentic demo sweets data
```

---

## 🔐 Security Standards & Rules

1. **xAI API Key Isolation**: The `XAI_API_KEY` is strictly held on the `backend/` server and never bundled into frontend client JavaScript.
2. **PostgreSQL Row Level Security (RLS)**: Public customers can only read active catalog items and manage their own orders, profile, and wishlist. Multi-tenant `shop_id` isolation is enforced on every query.
3. **Price & Stock Integrity**: Real-time prices and stock availability are always retrieved directly from live PostgreSQL database records. The LLM is never used as an inventory ledger.

---

## 🚀 Quickstart Guide

### 1. Database Setup (Supabase)
In your [Supabase SQL Editor](https://supabase.com/dashboard), execute the scripts in order:
1. `supabase/01_schema.sql` (Creates tables & pgvector extension)
2. `supabase/02_rls_policies.sql` (Enables Row Level Security)
3. `supabase/03_pgvector_rpc.sql` (Creates vector similarity search RPC)
4. `supabase/04_storage_and_seed.sql` (Initializes storage buckets & seeds demo sweets)

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key
SUPABASE_ANON_KEY=your_supabase_anon_publishable_key

XAI_API_KEY=your_xai_or_grok_api_key_here
XAI_MODEL=grok-4.6
XAI_EMBEDDING_MODEL=embedding-bert
XAI_EMBEDDING_DIM=1536
```

**Frontend (`frontend/.env`):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_publishable_key
VITE_BACKEND_URL=http://localhost:5000
VITE_DEFAULT_SHOP_ID=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
```

### 3. Model Discovery & Indexing
To query models available to your xAI API key and generate product vector embeddings:
```bash
# List xAI models
cd backend
npm run list-models

# Generate pgvector embeddings for all products
npm run sync-rag
```

### 4. Running Locally
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Web App):**
```bash
cd frontend
npm run dev
```
Open **http://localhost:5173** to view the store.

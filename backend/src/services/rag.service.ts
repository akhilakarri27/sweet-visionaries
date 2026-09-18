import { getSupabaseAdmin } from './supabase.service.js';
import { xaiService, ChatMessage } from './xai.service.js';
import { BACKEND_DEMO_PRODUCTS } from './demoProducts.js';

export interface RAGSearchFilter {
  shopId: string;
  maxPrice?: number;
  minPrice?: number;
  categoryId?: string;
  inStockOnly?: boolean;
}

export interface GroundedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  weight: string;
  description: string;
  ingredients: string;
  taste_profile: string;
  allergens: string;
  shelf_life: string;
  storage_instructions: string;
  stock: number;
  is_available: boolean;
  rating: number;
  review_count: number;
  image_url?: string;
}

export interface ChatResponse {
  answer: string;
  product_ids: string[];
  recommended_products: GroundedProduct[];
  sources_count: number;
}

export class RAGService {
  /**
   * System prompt enforcing strict anti-hallucination and grounded context
   */
  private buildSystemPrompt(contextText: string): string {
    return `You are the friendly, knowledgeable AI shopping assistant for "Kotaiah Sweets", legendary master artisans of authentic Andhra sweets and savouries.

CRITICAL OPERATIONAL RULES:
1. Grounding Rule: Use ONLY the information provided in the VERIFIED STORE KNOWLEDGE BASE below. Never invent or hallucinate products, prices, ingredients, discounts, stock, opening hours, or store policies.
2. Live Data Rule: The prices, weights, ingredients, and stock in the context are live from our database. Treat them as absolute ground truth.
3. Missing Information Rule: If a user asks about an item, policy, recipe, or question not found in the verified knowledge base, politely state: "I don't have that information in the Kotaiah Sweets knowledge base, but our store team at Kakinada would be delighted to assist you directly."
4. Product Recommendation Rule: When recommending sweets or savouries, you MUST ONLY recommend products that are present in the verified context. Include their exact product names and mention why they fit the customer's request.
5. Tone & Personality: Warm, polite, celebratory, and authentically Indian. Celebrate traditional tastes (pure ghee, jaggery, cardamom, kaja craftsmanship).
6. Structured Output Requirement: You must ALWAYS format your final response as valid JSON matching this schema:
{
  "answer": "Your natural, engaging, helpful text answer here.",
  "product_ids": ["uuid-of-recommended-product-1", "uuid-of-recommended-product-2"]
}
If no products are relevant or recommended, return "product_ids": [].

==================================================
VERIFIED STORE KNOWLEDGE BASE:
${contextText || 'No specific product records matched the search query.'}
==================================================`;
  }

  /**
   * Build searchable document content from a product entity
   */
  public buildProductSearchDocument(product: any, categoryName?: string): string {
    return `Product: ${product.name}
Category: ${categoryName || 'Sweets'}
Price: ₹${product.price} (${product.weight || '500g'})
Availability: ${product.is_available && product.stock > 0 ? 'In Stock (' + product.stock + ' available)' : 'Out of Stock'}
Description: ${product.description || 'Traditional delicacy'}
Taste Profile: ${product.taste_profile || 'Rich and traditional sweet flavour'}
Ingredients: ${product.ingredients || 'Information not currently available'}
Allergens: ${product.allergens || 'Information not currently available'}
Shelf Life: ${product.shelf_life || 'Information not currently available'}
Storage Instructions: ${product.storage_instructions || 'Information not currently available'}`.trim();
  }

  /**
   * Execute Hybrid RAG Query
   */
  async processCustomerQuery(
    userMessage: string,
    shopId: string,
    chatHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    const supabase = getSupabaseAdmin();

    // 1. Intent & Structured Filter Extraction from user text
    const lowerQuery = userMessage.toLowerCase();
    
    // Extract price constraints (e.g. "under 500", "below 400", "under ₹500")
    let maxPriceFilter: number | undefined;
    const priceMatch = lowerQuery.match(/(?:under|below|less than|within)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
    if (priceMatch && priceMatch[1]) {
      maxPriceFilter = parseFloat(priceMatch[1]);
    }

    // 2. Fetch live products from database with structured filtering
    let productQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        weight,
        description,
        ingredients,
        taste_profile,
        allergens,
        shelf_life,
        storage_instructions,
        stock,
        is_available,
        rating,
        review_count,
        categories ( name ),
        product_images ( image_url, is_primary )
      `)
      .eq('shop_id', shopId);

    if (maxPriceFilter !== undefined) {
      productQuery = productQuery.lte('price', maxPriceFilter);
    }

    const { data: allProducts, error: dbError } = await productQuery;

    if (dbError) {
      console.error('Error fetching live products from Supabase:', dbError);
    }

    const liveProducts = allProducts && allProducts.length > 0 
      ? allProducts 
      : (maxPriceFilter ? BACKEND_DEMO_PRODUCTS.filter(p => p.price <= maxPriceFilter) : BACKEND_DEMO_PRODUCTS);

    // 3. Vector Similarity Search with pgvector via Supabase RPC
    let vectorMatchedIds: string[] = [];
    try {
      // Generate query embedding via xAI Embeddings API
      const queryEmbedding = await xaiService.createEmbedding(userMessage);

      // Invoke Supabase RPC
      const { data: rpcMatches, error: rpcError } = await supabase.rpc('match_rag_documents', {
        query_embedding: queryEmbedding,
        filter_shop_id: shopId,
        match_threshold: 0.15,
        match_count: 6,
      });

      if (rpcError) {
        console.warn('pgvector RPC search notice:', rpcError.message);
      } else if (rpcMatches && Array.isArray(rpcMatches)) {
        vectorMatchedIds = rpcMatches.map((m: any) => m.product_id).filter(Boolean);
      }
    } catch (vectorErr) {
      console.warn('Vector embedding/search fallback triggered:', vectorErr);
    }

    // 4. Hybrid Ranking & Context Assembly
    const scoredProducts: { product: any; score: number }[] = [];
    const searchTerms = lowerQuery.split(/\s+/).filter(w => w.length > 2);

    for (const prod of liveProducts) {
      let score = 0;
      if (vectorMatchedIds.includes(prod.id)) {
        score += 10;
      }
      const catName = Array.isArray((prod as any).categories) 
        ? (prod as any).categories[0]?.name 
        : (prod as any).categories?.name || '';
      const nameText = prod.name.toLowerCase();
      const searchableText = `${prod.name} ${prod.slug} ${prod.description} ${prod.taste_profile} ${prod.ingredients} ${catName}`.toLowerCase();

      for (const term of searchTerms) {
        if (nameText.includes(term)) score += 5;
        else if (catName.toLowerCase().includes(term)) score += 3;
        else if (searchableText.includes(term)) score += 1;
      }

      if (score > 0) {
        scoredProducts.push({ product: prod, score });
      }
    }

    scoredProducts.sort((a, b) => b.score - a.score);

    const retrievedProducts = scoredProducts.length > 0
      ? scoredProducts.slice(0, 8).map(s => s.product)
      : liveProducts.slice(0, 5);

    // 5. Construct Grounding Context string
    const contextLines = retrievedProducts.map((p: any) => {
      const catName = Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name || 'Traditional Sweets';
      return `[PRODUCT ID: ${p.id}]
Name: ${p.name}
Category: ${catName}
Price: ₹${p.price} for ${p.weight || '500g'}
Stock Status: ${p.is_available && p.stock > 0 ? `Available in stock (${p.stock} units)` : 'Currently Out of Stock'}
Rating: ${p.rating} / 5.0 (${p.review_count} reviews)
Description: ${p.description || 'Authentic traditional Andhra delicacy'}
Taste Profile: ${p.taste_profile || 'Rich, aromatic sweet flavor'}
Ingredients: ${p.ingredients || 'Information not currently available'}
Allergens: ${p.allergens || 'Information not currently available'}
Shelf Life: ${p.shelf_life || 'Information not currently available'}
Storage Instructions: ${p.storage_instructions || 'Information not currently available'}
---`;
    });

    const contextText = contextLines.join('\n');
    const systemPrompt = this.buildSystemPrompt(contextText);

    // 6. Send Context + Conversation to Grok 4.6
    const messages: ChatMessage[] = [
      ...chatHistory.slice(-4), // maintain recent turns
      { role: 'user', content: userMessage }
    ];

    let rawResponse = '';
    let parsedAnswer = '';
    let parsedProductIds: string[] = [];

    try {
      rawResponse = await xaiService.generateGrokResponse(messages, systemPrompt);

      // Attempt to extract JSON from response (handling potential markdown code blocks)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsedAnswer = parsed.answer || rawResponse;
        if (Array.isArray(parsed.product_ids)) {
          // Verify that product IDs actually belong to our database
          const validIdsSet = new Set(liveProducts.map(p => p.id));
          parsedProductIds = parsed.product_ids.filter((id: string) => validIdsSet.has(id));
        }
      } else {
        parsedAnswer = rawResponse;
      }
    } catch (grokError: any) {
      console.warn('Grok generation error, providing rule-based grounded response:', grokError?.message);
      
      // Grounded fallback response
      if (retrievedProducts.length > 0) {
        parsedAnswer = `Here are authentic delicacies from Kotaiah Sweets matching your inquiry:\n` +
          retrievedProducts.slice(0, 3).map(p => `• **${p.name}** (₹${p.price} / ${p.weight}): ${p.description}`).join('\n\n');
        parsedProductIds = retrievedProducts.slice(0, 3).map(p => p.id);
      } else {
        parsedAnswer = "Welcome to Kotaiah Sweets! How may I assist you with our famous Kakinada Gottam Kaja, Pootharekulu, or traditional ghee sweets?";
      }
    }

    // 7. Attach structured verified product objects for frontend cards
    if (parsedProductIds.length === 0 && retrievedProducts.length > 0) {
      parsedProductIds = retrievedProducts.slice(0, 3).map(p => p.id);
    }

    const recommendedProducts: GroundedProduct[] = liveProducts
      .filter(p => parsedProductIds.includes(p.id))
      .map(p => {
        const primaryImg = p.product_images?.find((img: any) => img.is_primary)?.image_url || p.product_images?.[0]?.image_url;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          weight: p.weight,
          description: p.description,
          ingredients: p.ingredients,
          taste_profile: p.taste_profile,
          allergens: p.allergens,
          shelf_life: p.shelf_life,
          storage_instructions: p.storage_instructions,
          stock: p.stock,
          is_available: p.is_available,
          rating: p.rating,
          review_count: p.review_count,
          image_url: primaryImg
        };
      });

    return {
      answer: parsedAnswer,
      product_ids: parsedProductIds,
      recommended_products: recommendedProducts,
      sources_count: retrievedProducts.length,
    };
  }

  /**
   * Re-sync all products of a shop into the rag_documents table with embeddings
   */
  async syncShopRAGDocuments(shopId: string): Promise<{ indexed: number; failed: number }> {
    const supabase = getSupabaseAdmin();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('shop_id', shopId);

    if (error || !products) {
      throw new Error(`Failed to fetch products for RAG sync: ${error?.message}`);
    }

    let indexed = 0;
    let failed = 0;

    for (const prod of products) {
      try {
        const docText = this.buildProductSearchDocument(prod, prod.categories?.name);
        const embedding = await xaiService.createEmbedding(docText);

        // Upsert into rag_documents
        const { error: upsertErr } = await supabase
          .from('rag_documents')
          .upsert({
            shop_id: shopId,
            product_id: prod.id,
            content: docText,
            embedding: embedding,
            metadata: {
              name: prod.name,
              price: prod.price,
              category: prod.categories?.name,
              weight: prod.weight,
              updated_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (upsertErr) {
          console.warn(`Error indexing product ${prod.name}:`, upsertErr.message);
          failed++;
        } else {
          indexed++;
        }
      } catch (err) {
        console.error(`Error processing embedding for ${prod.name}:`, err);
        failed++;
      }
    }

    return { indexed, failed };
  }
}

export const ragService = new RAGService();

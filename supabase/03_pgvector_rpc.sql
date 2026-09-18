-- ====================================================================
-- KOTAIAH SWEETS - PGVECTOR VECTOR SIMILARITY SEARCH RPC FUNCTION
-- ====================================================================

-- Function to search RAG documents by vector similarity with strict shop isolation
CREATE OR REPLACE FUNCTION public.match_rag_documents(
    query_embedding VECTOR(1536),
    filter_shop_id UUID,
    match_threshold FLOAT DEFAULT 0.20,
    match_count INT DEFAULT 8
)
RETURNS TABLE (
    id UUID,
    product_id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT
        rd.id,
        rd.product_id,
        rd.content,
        rd.metadata,
        (1 - (rd.embedding <=> query_embedding))::FLOAT AS similarity
    FROM public.rag_documents rd
    WHERE rd.shop_id = filter_shop_id
      AND rd.embedding IS NOT NULL
      AND (1 - (rd.embedding <=> query_embedding)) >= match_threshold
    ORDER BY rd.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- Grant execution to authenticated and anon users (and service role)
GRANT EXECUTE ON FUNCTION public.match_rag_documents TO anon, authenticated, service_role;

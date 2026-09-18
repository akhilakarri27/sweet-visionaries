import { Request, Response } from 'express';
import { ragService } from '../services/rag.service.js';
import { getSupabaseAdmin } from '../services/supabase.service.js';

export async function handleChatMessage(req: Request, res: Response): Promise<void> {
  try {
    const { message, shopId, chatHistory, sessionId, userId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    // Default to Kotaiah Sweets seed shop ID if not provided
    const targetShopId = shopId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

    const result = await ragService.processCustomerQuery(
      message,
      targetShopId,
      chatHistory || []
    );

    // If a session ID exists, store the messages asynchronously
    if (sessionId) {
      const supabase = getSupabaseAdmin();
      try {
        await supabase.from('chat_messages').insert([
          { session_id: sessionId, role: 'user', content: message },
          { session_id: sessionId, role: 'assistant', content: result.answer, metadata: { product_ids: result.product_ids } }
        ]);
      } catch (saveErr) {
        console.warn('Non-blocking chat message history save warning:', saveErr);
      }
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error processing AI chat query',
    });
  }
}

export async function createOrGetSession(req: Request, res: Response): Promise<void> {
  try {
    const { userId, shopId } = req.body;
    const targetShopId = shopId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    const supabase = getSupabaseAdmin();

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId || null,
        shop_id: targetShopId,
        title: 'Shopping Conversation',
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

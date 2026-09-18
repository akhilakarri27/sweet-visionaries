import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  RotateCcw,
  Check,
  Star,
  ExternalLink,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { BACKEND_URL, DEFAULT_SHOP_ID } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getProductImageUrl, DEFAULT_FALLBACK_IMAGE } from '../../lib/storage';

interface GroundedProductCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  weight: string;
  description: string;
  stock: number;
  is_available: boolean;
  rating: number;
  review_count: number;
  image_url?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: GroundedProductCard[];
  timestamp: string;
}

interface FloatingChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Namaste! 🙏 I'm the **Kotaiah Sweets AI Assistant**.\n\nI can help you find authentic Andhra sweets, check pure ghee ingredients, compare gift boxes, or find sweets under a budget.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const suggestedQuestions = [
    'Show me traditional sweets',
    'Find sweets under ₹500',
    'Which sweets contain dry fruits?',
    'I need sweets for a celebration',
    'What is the shelf life of Gottam Kaja?',
    'What products are available today?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const chatHistory = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-4)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: query,
          shopId: DEFAULT_SHOP_ID,
          chatHistory,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const resData = await response.json();
      const aiData = resData.data;

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiData.answer || 'Here are the recommended delicacies from Kotaiah Sweets:',
        products: aiData.recommended_products || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I'm currently unable to reach our secure AI knowledge service. You can browse our full product catalogue directly on the website!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = (product: GroundedProductCard) => {
    // Transform to Product format for CartContext
    const fullProd: any = {
      ...product,
      shop_id: DEFAULT_SHOP_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addToCart(fullProd, 1, product.weight || '500g');

    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Namaste! 🙏 Conversation reset. How may I assist you with Kotaiah Sweets today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button (When Closed) */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light px-4 py-3 rounded-full shadow-float border-2 border-brand-gold hover:scale-105 transition-all duration-300 group"
          aria-label="Open Kotaiah Sweets AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-brand-gold-light animate-spin-slow group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-brand-maroon animate-ping" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-tight font-serif text-[#FFFDF9]">Ask Grok AI</div>
            <div className="text-[10px] text-brand-gold-light font-medium">Kotaiah Assistant</div>
          </div>
        </button>
      )}

      {/* Chat Drawer Window (When Open) */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#FFFDF9] rounded-3xl shadow-float border-2 border-brand-gold/40 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Chatbot Header */}
          <div className="bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-[#FFFDF9] p-4 flex items-center justify-between border-b border-brand-gold/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-maroon-dark border border-brand-gold flex items-center justify-center text-brand-gold-light shadow-soft">
                <Sparkles className="w-4 h-4 text-brand-gold-light" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#FFFDF9] flex items-center gap-1.5">
                  <span>Kotaiah AI Assistant</span>
                  <span className="text-[9px] bg-brand-gold/30 text-brand-gold-light px-1.5 py-0.2 rounded font-sans uppercase font-bold tracking-wider">
                    Grok 4.6 RAG
                  </span>
                </h3>
                <p className="text-[10px] text-stone-300">Grounded in Live Store Database & pgvector</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-stone-300 hover:text-brand-gold-light hover:bg-white/10 rounded-lg transition-colors"
                title="Clear Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-warm-gradient">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-brand-maroon text-brand-gold-light flex items-center justify-center shrink-0 mt-1 border border-brand-gold/40 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                  {/* Text Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-maroon text-[#FFFDF9] rounded-br-none shadow-sm'
                        : 'bg-[#FAF7F2] text-brand-charcoal border border-brand-border rounded-bl-none shadow-soft'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">
                      {msg.content}
                    </div>
                  </div>

                  {/* Render Grounded Product Cards if returned by RAG */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-brand-gold-dark flex items-center gap-1 font-serif">
                        <Sparkles className="w-3 h-3 text-brand-gold" />
                        <span>Recommended Products ({msg.products.length}):</span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {msg.products.map((p) => {
                          const isAdded = !!addedItemIds[p.id];
                          return (
                            <div
                              key={p.id}
                              className="bg-[#FFFDF9] p-2.5 rounded-xl border border-brand-border/80 shadow-xs flex items-center justify-between gap-3 hover:border-brand-gold transition-colors"
                            >
                              <img
                                src={getProductImageUrl(p)}
                                alt={p.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                                }}
                                className="w-12 h-12 object-cover rounded-lg shrink-0 bg-stone-100"
                              />

                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/products/${p.id}`}
                                  onClick={onClose}
                                  className="font-serif font-bold text-xs text-brand-charcoal hover:text-brand-gold truncate block"
                                >
                                  {p.name}
                                </Link>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-bold text-xs text-brand-maroon">
                                    ₹{p.price}
                                  </span>
                                  <span className="text-[10px] text-stone-500">
                                    ({p.weight || '500g'})
                                  </span>
                                  <div className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    <span>{Number(p.rating || 5.0).toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Link
                                  to={`/products/${p.id}`}
                                  onClick={onClose}
                                  className="p-1.5 text-stone-500 hover:text-brand-gold hover:bg-brand-surface rounded-lg"
                                  title="View details"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                  onClick={() => handleQuickAdd(p)}
                                  disabled={!p.is_available || p.stock === 0}
                                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                                    isAdded
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-brand-maroon text-brand-gold-light hover:bg-brand-gold hover:text-white'
                                  }`}
                                  title="Add to cart"
                                >
                                  {isAdded ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className={`text-[9px] text-stone-400 mt-1 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-brand-surface border border-brand-border text-brand-charcoal flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-maroon text-brand-gold-light flex items-center justify-center shrink-0 border border-brand-gold/40 shadow-xs">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-brand-border text-xs flex items-center gap-2 text-brand-charcoal shadow-soft">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                  <span>Consulting knowledge base & Grok 4.6...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="px-3 py-2 bg-brand-surface border-t border-brand-border/60 overflow-x-auto flex gap-1.5 scrollbar-none">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] font-medium bg-[#FFFDF9] hover:bg-brand-gold hover:text-white text-stone-700 px-2.5 py-1 rounded-full border border-brand-border hover:border-brand-gold transition-colors shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#FFFDF9] border-t border-brand-border flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sweets, ghee, ingredients..."
              disabled={isLoading}
              className="flex-1 bg-brand-surface text-xs text-brand-charcoal px-3.5 py-2.5 rounded-full border border-brand-border focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-full bg-brand-maroon text-brand-gold-light flex items-center justify-center hover:bg-brand-gold hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-soft shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Offer } from '../types/database';

export const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await supabase.from('offers').select('*').eq('is_active', true);
      if (data) setOffers(data as Offer[]);
    };
    fetchOffers();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      <div className="bg-brand-warm-gradient rounded-3xl p-8 sm:p-12 border border-brand-border text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider bg-brand-surface px-3.5 py-1 rounded-full border border-brand-border">
          <Gift className="w-3.5 h-3.5" />
          <span>Exclusive Seasonal Promotions</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal">
          Festive Treats & Special Offers
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto font-sans">
          Celebrate family milestones, weddings, and festivals with authentic Andhra sweets. Use the coupon codes below during checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-[#FFFDF9] rounded-3xl border-2 border-brand-gold/40 p-6 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
                <span className="font-serif font-black text-2xl text-brand-maroon">
                  {offer.discount_percent}% OFF
                </span>
                <span className="text-[10px] bg-brand-cream text-brand-maroon px-2 py-0.5 rounded-full font-bold uppercase">
                  Active
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-brand-charcoal mt-3">{offer.title}</h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{offer.description}</p>
              
              <div className="mt-3 text-[11px] text-stone-500">
                Min. Order Amount: <strong className="text-stone-700">₹{offer.min_order_amount}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between gap-2">
              <div className="bg-brand-surface border border-brand-border px-3 py-1.5 rounded-xl font-mono font-bold text-xs text-brand-charcoal">
                {offer.code}
              </div>

              <button
                onClick={() => handleCopy(offer.code)}
                className="flex items-center gap-1 text-xs font-bold text-brand-maroon hover:text-brand-gold transition-colors"
              >
                {copiedCode === offer.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light px-8 py-3.5 rounded-full font-bold text-xs shadow-gold hover:scale-105 transition-all"
        >
          <span>Apply Offers in Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

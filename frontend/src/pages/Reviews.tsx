import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle2, Heart, Sparkles, MessageSquarePlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Review } from '../types/database';

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('reviews')
          .select('*, products(name)')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (filterRating > 0) {
          query = query.gte('rating', filterRating);
        }

        const { data } = await query;
        if (data) setReviews(data as Review[]);
      } catch (err) {
        console.error('Reviews load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [filterRating]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider bg-brand-surface px-3.5 py-1 rounded-full border border-brand-border">
          <Heart className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
          <span>Customer Stories & Feedback</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal">
          Authentic Customer Reviews
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-sans">
          Read genuine feedback from sweet enthusiasts across India who order our pure ghee delicacies.
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center justify-center gap-2">
        {[0, 5, 4].map((star) => (
          <button
            key={star}
            onClick={() => setFilterRating(star)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterRating === star
                ? 'bg-brand-maroon text-brand-gold-light border-brand-maroon shadow-soft'
                : 'bg-[#FFFDF9] text-stone-600 border-brand-border hover:border-brand-gold'
            }`}
          >
            {star === 0 ? 'All Ratings' : `${star} ★ Ratings`}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                {rev.is_verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Order
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-sans">"{rev.comment}"</p>
            </div>

            <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs text-stone-500">
              <span className="font-bold text-brand-charcoal">{rev.customer_name}</span>
              <span>{new Date(rev.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

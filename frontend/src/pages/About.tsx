import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Award, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider bg-brand-surface px-3 py-1 rounded-full border border-brand-border">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Craftsmanship Since 1900</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-brand-charcoal leading-tight">
          The Legendary Heritage of Kotaiah Sweets
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
          Originating over a century ago in the port town of Kakinada, Andhra Pradesh, Kotaiah Sweets pioneered the iconic cylindrical Gottam Kaja, transforming coastal Andhra confectionery into an internationally celebrated culinary art form.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-brand-maroon">
            A Recipe Perfected Across Four Generations
          </h2>
          <p>
            In the early 1900s, master confectioner Sri Kotaiah introduced a distinct method of rolling delicate wheat flour pastry into cylindrical shells and slow-frying them in pure country ghee before steeping them in warm, cardamom-scented cane syrup.
          </p>
          <p>
            Unlike conventional soft sweets, the authentic <strong>Kakinada Gottam Kaja</strong> features a crisp, golden exterior that seals a pocket of warm, aromatic cardamom syrup inside. Every single bite delivers a burst of celebratory flavor.
          </p>
          <p>
            Today, our sweet artisans uphold those very same protocols: pure desi cow ghee, hand-churned jaggery, unadulterated nuts, and fresh daily morning preparations.
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden border-2 border-brand-gold/60 shadow-float">
          <img
            src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80"
            alt="Authentic Indian Sweets Preparation"
            className="w-full h-96 object-cover"
          />
        </div>
      </div>

      {/* Values Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-brand-border shadow-soft space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-border text-brand-gold flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-base text-brand-charcoal">Pure Generational Recipes</h3>
          <p className="text-xs text-stone-600">Zero artificial preservatives, artificial flavors, or synthetic additives.</p>
        </div>

        <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-brand-border shadow-soft space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-border text-brand-gold flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-base text-brand-charcoal">100% Desi Cow Ghee</h3>
          <p className="text-xs text-stone-600">Pure golden country cow ghee sourced from trusted dairy farmers.</p>
        </div>

        <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-brand-border shadow-soft space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-border text-brand-gold flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-base text-brand-charcoal">Devotion in Every Pack</h3>
          <p className="text-xs text-stone-600">Carefully hand-packaged to bring festive happiness to your home.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light px-8 py-3.5 rounded-full font-bold text-xs shadow-gold hover:scale-105 transition-all"
        >
          <span>Taste Our Heritage Delicacies</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

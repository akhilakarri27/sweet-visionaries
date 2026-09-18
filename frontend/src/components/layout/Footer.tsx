import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-charcoal text-[#FAF7F2] pt-16 pb-8 border-t-4 border-brand-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Heritage Guarantee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-brand-charcoal/80 border-stone-800">
          <div className="flex items-center gap-4 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold-light shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#FFFDF9]">100% Pure Desi Ghee</h4>
              <p className="text-xs text-stone-400">Crafted with pure country cow ghee</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold-light shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#FFFDF9]">Fresh Daily Batches</h4>
              <p className="text-xs text-stone-400">Prepared fresh every single morning</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold-light shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#FFFDF9]">Authentic Heritage</h4>
              <p className="text-xs text-stone-400">Original Kakinada recipe traditions</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold-light shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#FFFDF9]">Express Safe Delivery</h4>
              <p className="text-xs text-stone-400">Carefully sealed freshness packs</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-maroon flex items-center justify-center border border-brand-gold">
                <span className="font-serif font-bold text-lg text-brand-gold-light">K</span>
              </div>
              <span className="font-serif font-bold text-2xl text-[#FFFDF9] tracking-wide">
                KOTAIAH<span className="text-brand-gold"> SWEETS</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed pr-6">
              Original home of the world-famous Kakinada Gottam Kaja, Atreyapuram Pootharekulu, and traditional Andhra confectionery. Spreading sweetness and festive joy across generations since 1900.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-stone-800 text-stone-300 text-[11px] rounded-full border border-stone-700">
                ✨ Powered by xAI Grok 4.6 & pgvector RAG
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-sm text-[#FFFDF9] uppercase tracking-wider text-brand-gold-light">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/products" className="hover:text-brand-gold transition-colors">All Products Catalogue</Link></li>
              <li><Link to="/products?category=b1000000-0000-0000-0000-000000000001" className="hover:text-brand-gold transition-colors">Kakinada Kaja Specials</Link></li>
              <li><Link to="/products?category=b1000000-0000-0000-0000-000000000002" className="hover:text-brand-gold transition-colors">Traditional Sweets</Link></li>
              <li><Link to="/products?category=b1000000-0000-0000-0000-000000000006" className="hover:text-brand-gold transition-colors">Savouries & Murukku</Link></li>
              <li><Link to="/offers" className="hover:text-brand-gold transition-colors">Festive Offers & Hampers</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-sm text-[#FFFDF9] uppercase tracking-wider text-brand-gold-light">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/account" className="hover:text-brand-gold transition-colors">My Account & Orders</Link></li>
              <li><Link to="/account?tab=orders" className="hover:text-brand-gold transition-colors">Track Your Order</Link></li>
              <li><Link to="/reviews" className="hover:text-brand-gold transition-colors">Customer Reviews</Link></li>
              <li><Link to="/about" className="hover:text-brand-gold transition-colors">Our Craftsmanship Story</Link></li>
              <li><Link to="/contact" className="hover:text-brand-gold transition-colors">Store Locations</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-sm text-[#FFFDF9] uppercase tracking-wider text-brand-gold-light">
              Main Store
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>Main Bazaar Road, Kakinada, Andhra Pradesh - 533001</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                <span>+91 884 237 8999</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <span>orders@kotaiahsweets.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Mon - Sun: 7:00 AM - 10:30 PM</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Demo Notice */}
        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Kotaiah Sweets. Crafted with devotion for authentic Indian sweets lovers.</p>
          <p className="text-[11px] text-stone-400 text-center md:text-right bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
            ℹ️ Demo Platform: Product catalogue and sample prices are for demonstration and full-stack architecture testing.
          </p>
        </div>

      </div>
    </footer>
  );
};

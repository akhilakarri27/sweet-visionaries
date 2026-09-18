import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Award,
  Heart,
  ChevronRight,
  Clock,
  MapPin,
  Star,
  Gift,
  CheckCircle2,
  Eye,
  ShoppingBag,
  Check,
  X,
  Send,
  Phone,
  Mail,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category, Product, Offer, Review } from '../types/database';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '../lib/demoData';
import { ProductCard } from '../components/products/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  getProductImageUrl,
  DEFAULT_FALLBACK_IMAGE,
  DEFAULT_HERO_VIDEO_URL,
  DEFAULT_HERO_POSTER_URL,
  getSiteSetting
} from '../lib/storage';

interface HomeProps {
  onOpenChatbot?: () => void;
  onToast?: (msg: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onOpenChatbot, onToast }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [allProducts, setAllProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Hero Video & Poster URLs loaded from Supabase site_settings
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>(DEFAULT_HERO_VIDEO_URL);
  const [heroPosterUrl, setHeroPosterUrl] = useState<string>(DEFAULT_HERO_POSTER_URL);
  
  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [modalWeight, setModalWeight] = useState<string>('500g');
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalAdded, setModalAdded] = useState<boolean>(false);

  // Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', message: '' });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        // 1. Fetch Dynamic Hero Video & Poster Settings
        const [videoSetting, posterSetting] = await Promise.all([
          getSiteSetting<string>('hero_video_url', DEFAULT_HERO_VIDEO_URL),
          getSiteSetting<string>('hero_poster_url', DEFAULT_HERO_POSTER_URL),
        ]);
        if (videoSetting) setHeroVideoUrl(videoSetting);
        if (posterSetting) setHeroPosterUrl(posterSetting);

        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        if (cats && cats.length > 0) setCategories(cats as Category[]);

        const { data: prods } = await supabase
          .from('products')
          .select('*, categories(name), product_images(*)')
          .eq('is_available', true)
          .order('rating', { ascending: false });
        if (prods && prods.length > 0) setAllProducts(prods as Product[]);

        const { data: offs } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true)
          .limit(3);
        if (offs && offs.length > 0) setOffers(offs as Offer[]);

        const { data: revs } = await supabase
          .from('reviews')
          .select('*')
          .eq('is_approved', true)
          .limit(6);
        if (revs && revs.length > 0) setReviews(revs as Review[]);
      } catch (err) {
        console.error('Home data load error:', err);
      }
    };

    loadHomeData();
  }, []);

  // Filtered Sweets according to selected tab
  const displayedProducts = selectedCategoryTab === 'all'
    ? allProducts
    : allProducts.filter((p) => {
        if (selectedCategoryTab === 'kaja') return p.name.toLowerCase().includes('kaja');
        if (selectedCategoryTab === 'laddu') return p.name.toLowerCase().includes('laddu');
        if (selectedCategoryTab === 'milk') return p.name.toLowerCase().includes('pak') || p.name.toLowerCase().includes('kova') || p.name.toLowerCase().includes('mysore');
        if (selectedCategoryTab === 'traditional') return p.name.toLowerCase().includes('pootharekulu') || p.name.toLowerCase().includes('bobbatlu') || p.name.toLowerCase().includes('jangri') || p.name.toLowerCase().includes('halwa');
        if (selectedCategoryTab === 'dryfruit') return p.name.toLowerCase().includes('dry fruit') || p.name.toLowerCase().includes('kaju');
        if (selectedCategoryTab === 'savouries') return p.name.toLowerCase().includes('murukku') || p.name.toLowerCase().includes('mixture');
        return true;
      });

  const calculateModalPrice = (basePrice: number, weight: string) => {
    if (weight === '250g') return Math.round(basePrice * 0.55);
    if (weight === '1kg') return Math.round(basePrice * 1.95);
    return basePrice;
  };

  const handleModalAddToCart = () => {
    if (!quickViewProduct) return;
    addToCart(quickViewProduct, modalQuantity, modalWeight);
    setModalAdded(true);
    if (onToast) {
      onToast(`Added ${modalQuantity} x ${quickViewProduct.name} (${modalWeight}) to your cart!`);
    }
    setTimeout(() => setModalAdded(false), 2000);
  };

  const handleModalBuyNow = () => {
    if (!quickViewProduct) return;
    addToCart(quickViewProduct, modalQuantity, modalWeight);
    setQuickViewProduct(null);
    navigate('/checkout');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', phone: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* 1. FULL-WIDTH HERO VIDEO SECTION */}
      <section className="relative w-full min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-stone-950 border-b border-brand-gold/30">
        
        {/* Full-width Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            key={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            poster={heroPosterUrl}
            className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02] transform transition-transform duration-1000"
          >
            <source src={heroVideoUrl} type="video/mp4" />
            {/* Fallback image if video cannot be played */}
            <img
              src={heroPosterUrl}
              alt="Kotaiah Sweets Traditional Delicacies"
              className="w-full h-full object-cover"
            />
          </video>
        </div>

        {/* Subtle Warm Vignette Overlay - Keeps video clear while giving text high readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/50 pointer-events-none" />

        {/* Hero Content Area */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-7">
          
          {/* Heritage Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-maroon/85 border border-brand-gold/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-brand-gold-light shadow-gold">
            <Sparkles className="w-4 h-4 text-brand-gold animate-spin-slow" />
            <span>Master Artisans of Authentic Andhra Sweets • Since 1900</span>
          </div>

          {/* Headline and Tagline */}
          <div className="space-y-3">
            <h1 className="font-serif font-black text-4xl sm:text-6xl lg:text-7xl text-[#FFFDF9] tracking-tight leading-[1.1] drop-shadow-lg">
              Kotaiah Sweets
            </h1>
            <p className="font-serif italic text-lg sm:text-2xl lg:text-3xl text-brand-gold-light drop-shadow font-medium">
              "Traditional Taste, Made for Every Celebration"
            </p>
          </div>

          {/* Narrative Summary */}
          <p className="text-sm sm:text-base text-stone-200 max-w-2xl leading-relaxed font-sans mx-auto drop-shadow">
            Taste the world-renowned <strong>Kakinada Gottam Kaja</strong>, <strong>Nethi Kaja</strong>, <strong>Atreyapuram Pootharekulu</strong>, <strong>Royal Mysore Pak</strong>, and handcrafted savouries made with 100% pure desi cow ghee.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#menu"
              className="flex items-center gap-2 bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-500 hover:to-brand-gold text-stone-950 px-8 py-4 rounded-full font-black text-sm tracking-wide shadow-gold hover:scale-105 hover:shadow-float transition-all cursor-pointer"
            >
              <span>Explore Sweets</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              to="/products"
              className="flex items-center gap-2 bg-brand-maroon/90 hover:bg-brand-maroon text-[#FFFDF9] border border-brand-gold/60 px-8 py-4 rounded-full font-bold text-sm shadow-soft hover:scale-105 transition-all backdrop-blur-md"
            >
              <ShoppingBag className="w-4 h-4 text-brand-gold-light" />
              <span>Order Now</span>
            </Link>

            {onOpenChatbot && (
              <button
                onClick={onOpenChatbot}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 px-6 py-4 rounded-full font-bold text-xs shadow-soft hover:scale-105 transition-all backdrop-blur-md"
              >
                <Sparkles className="w-4 h-4 text-brand-gold-light" />
                <span>Ask AI Assistant</span>
              </button>
            )}
          </div>

          {/* Trust Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/20 max-w-3xl mx-auto">
            <div className="bg-black/40 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-center">
              <div className="font-serif font-black text-xl sm:text-2xl text-brand-gold-light">120+</div>
              <div className="text-[11px] text-stone-300 font-medium">Years Heritage</div>
            </div>
            <div className="bg-black/40 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-center">
              <div className="font-serif font-black text-xl sm:text-2xl text-brand-gold-light">100%</div>
              <div className="text-[11px] text-stone-300 font-medium">Pure Desi Cow Ghee</div>
            </div>
            <div className="bg-black/40 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-center">
              <div className="font-serif font-black text-xl sm:text-2xl text-brand-gold-light">4.9 ★</div>
              <div className="text-[11px] text-stone-300 font-medium">1,200+ Reviews</div>
            </div>
            <div className="bg-black/40 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-center">
              <div className="font-serif font-black text-xl sm:text-2xl text-brand-gold-light">Fresh</div>
              <div className="text-[11px] text-stone-300 font-medium">Daily Pure Batches</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. COMPLETE SWEETS MENU & CATEGORIES (ALL IN ONE) */}
      <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-brand-gold text-brand-gold" />
            <span>Complete Traditional Sweets Menu</span>
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal">
            Explore All Authentic Sweets & Savouries
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-sans">
            Choose your favorites below. Click on any item for full ingredients, taste profile, weight options, and instant order.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
          {[
            { key: 'all', label: `All Sweets (${allProducts.length})` },
            { key: 'kaja', label: 'Kaja Specials' },
            { key: 'laddu', label: 'Laddu Varieties' },
            { key: 'milk', label: 'Mysore Pak & Paalkova' },
            { key: 'traditional', label: 'Pootharekulu & Bobbatlu' },
            { key: 'dryfruit', label: 'Dry Fruit Sweets' },
            { key: 'savouries', label: 'Savouries & Gift Boxes' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedCategoryTab(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                selectedCategoryTab === tab.key
                  ? 'bg-brand-maroon text-brand-gold-light border-brand-maroon shadow-soft scale-105'
                  : 'bg-[#FFFDF9] text-stone-700 border-brand-border hover:border-brand-gold hover:bg-brand-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sweets Grid with Quick View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map((product) => {
            const primaryImg = getProductImageUrl(product);

            return (
              <div
                key={product.id}
                className="group bg-[#FFFDF9] rounded-2xl border border-brand-border/90 p-4 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative"
              >
                <div>
                  {/* Image */}
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-brand-surface mb-3">
                    <img
                      src={primaryImg}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => {
                        setQuickViewProduct(product);
                        setModalWeight(product.weight || '500g');
                        setModalQuantity(1);
                      }}
                    />

                    {/* Quick View Button */}
                    <button
                      onClick={() => {
                        setQuickViewProduct(product);
                        setModalWeight(product.weight || '500g');
                        setModalQuantity(1);
                      }}
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Full Details</span>
                    </button>

                    {/* In Wishlist toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
                        isInWishlist(product.id)
                          ? 'bg-rose-50 text-rose-600 shadow-sm'
                          : 'bg-white/80 text-stone-600 hover:text-rose-600'
                      }`}
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Category & Rating */}
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-brand-gold font-semibold uppercase tracking-wider text-[10px]">
                      {product.categories?.name || 'Traditional Delicacy'}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-600 text-xs font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{Number(product.rating || 5.0).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => {
                      setQuickViewProduct(product);
                      setModalWeight(product.weight || '500g');
                      setModalQuantity(1);
                    }}
                    className="font-serif font-bold text-sm text-brand-charcoal line-clamp-1 hover:text-brand-gold cursor-pointer"
                  >
                    {product.name}
                  </h3>

                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-500 mr-1">Price:</span>
                    <span className="font-serif font-black text-base text-brand-maroon">
                      ₹{product.price}
                    </span>
                    <span className="text-[10px] text-stone-400 block">for {product.weight || '500g'}</span>
                  </div>

                  <button
                    onClick={() => {
                      setQuickViewProduct(product);
                      setModalWeight(product.weight || '500g');
                      setModalQuantity(1);
                    }}
                    className="flex items-center gap-1 bg-brand-maroon text-brand-gold-light text-xs font-bold px-3 py-2 rounded-xl hover:bg-brand-gold hover:text-white transition-colors"
                  >
                    <span>View & Order</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SPECIAL OFFERS SECTION */}
      <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-maroon via-brand-maroon-dark to-stone-900 rounded-3xl p-6 sm:p-10 border-2 border-brand-gold/50 shadow-float text-[#FFFDF9] relative overflow-hidden">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-brand-gold/20 text-brand-gold-light border border-brand-gold/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5" />
                <span>Festive Celebration Promo</span>
              </div>
              <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#FFFDF9] leading-tight">
                Use Coupon Codes For Instant Discounts!
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                Apply coupon code <code className="bg-black/50 px-2 py-0.5 rounded text-brand-gold-light font-mono font-bold">FESTIVE15</code> for 15% off orders over ₹999, or <code className="bg-black/50 px-2 py-0.5 rounded text-brand-gold-light font-mono font-bold">WELCOME10</code> for 10% off your first order.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-2.5">
              {[
                { code: 'FESTIVE15', title: '15% Off All Sweets', min: '₹999' },
                { code: 'KAJA50', title: '10% Off Gottam & Nethi Kaja', min: '₹499' },
                { code: 'WELCOME10', title: '10% Welcome Discount', min: '₹300' },
              ].map((c) => (
                <div key={c.code} className="bg-white/10 backdrop-blur-md border border-brand-gold/30 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-xs text-brand-gold-light bg-black/40 px-2 py-0.5 rounded border border-brand-gold/40">
                      {c.code}
                    </span>
                    <h4 className="font-serif font-bold text-xs text-[#FFFDF9] mt-0.5">{c.title}</h4>
                  </div>
                  <span className="text-[10px] text-stone-300">Min. {c.min}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE KOTAIAH SWEETS */}
      <section id="about" className="bg-brand-cream/50 py-16 border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider font-serif">
              Artisanal Commitment
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-brand-charcoal mt-1">
              Why Kotaiah Sweets Stands Apart
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 font-sans">
              Every single batch is crafted following traditional culinary protocols to preserve generational purity and authentic taste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-brand-border shadow-soft text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/70 border border-amber-300/60 text-brand-gold-dark flex items-center justify-center mx-auto shadow-xs">
                <Flame className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-base text-brand-charcoal">100% Pure Desi Cow Ghee</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                We strictly use 100% pure country cow ghee, giving our sweets their signature aroma and wholesome velvety richness.
              </p>
            </div>

            <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-brand-border shadow-soft text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/70 border border-amber-300/60 text-brand-gold-dark flex items-center justify-center mx-auto shadow-xs">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-base text-brand-charcoal">Original 1900 Kakinada Recipe</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Generations of confectionery mastery creating the authentic Gottam Kaja and Nethi Kaja with crispy layers and aromatic syrup.
              </p>
            </div>

            <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-brand-border shadow-soft text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/70 border border-amber-300/60 text-brand-gold-dark flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-base text-brand-charcoal">Vacuum-Sealed Fresh Packing</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Specialized tamper-proof food grade packaging ensures peak crispiness and freshness delivered right to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VERIFIED REVIEWS */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-gold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
            <span>Customer Testimonials</span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-brand-charcoal">
            Stories of Celebration & Taste
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Dr. Venkat Raman',
              city: 'Hyderabad',
              rating: 5,
              title: 'Authentic Gottam & Nethi Kaja!',
              comment: 'The crispy shell and warm cardamom syrup inside the Kaja brought back sweet childhood memories. Pure ghee aroma is outstanding.',
              product: 'Nethi Kaja',
            },
            {
              name: 'Sravani Chowdary',
              city: 'Bengaluru',
              rating: 5,
              title: 'Melt-in-mouth Mysore Pak & Pootharekulu',
              comment: 'Paper-thin dry fruit pootharekulu and velvety Mysore pak that dissolves on contact. Packaging arrived fresh in 2 days.',
              product: 'Royal Mysore Pak',
            },
            {
              name: 'Raghavendra V.',
              city: 'Visakhapatnam',
              rating: 5,
              title: 'Best Motichoor & Boondhi Laddu',
              comment: 'Juicy saffron pearls and generous cashews. Highly recommend for festive celebrations and family milestones!',
              product: 'Moti Chor Laddu',
            },
          ].map((rev, idx) => (
            <div
              key={idx}
              className="bg-[#FFFDF9] rounded-2xl border border-brand-border p-6 shadow-soft space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Order
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-brand-charcoal">{rev.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed mt-1">"{rev.comment}"</p>
              </div>

              <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-brand-charcoal">{rev.name}</div>
                  <div className="text-[10px] text-stone-500">{rev.city}</div>
                </div>
                <span className="text-[10px] text-brand-gold-dark font-medium bg-brand-surface px-2 py-0.5 rounded">
                  {rev.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. STORE LOCATIONS & INQUIRY FORM */}
      <section id="contact" className="bg-brand-surface py-16 border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Store Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold text-brand-gold uppercase tracking-wider font-serif">
                  Store Visit & Inquiries
                </span>
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-brand-charcoal">
                  Kotaiah Sweets Flagship Store
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Visit our historic Kakinada counter or order online for fast home delivery across all cities.
                </p>
              </div>

              <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-brand-border shadow-soft space-y-3 text-xs text-stone-600">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <span>Main Bazaar Road, Near Clock Tower, Kakinada, Andhra Pradesh - 533001</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>+91 884 237 8999 / +91 94401 23456</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>orders@kotaiahsweets.com</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>Open Daily: 7:00 AM – 10:30 PM (Fresh morning batches at 8 AM)</span>
                </p>
              </div>
            </div>

            {/* Quick Bulk Inquiry Form */}
            <div className="lg:col-span-7 bg-[#FFFDF9] rounded-3xl p-8 border border-brand-border shadow-soft space-y-4">
              <h3 className="font-serif font-bold text-lg text-brand-charcoal">
                Send Bulk Order Inquiry / Message
              </h3>

              {contactSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-xs text-emerald-900">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm">Inquiry Received!</h4>
                  <p>Our store team will contact you regarding fresh batch packing.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Your Full Name *"
                      className="bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                    />
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="Your Phone Number *"
                      className="bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Your Email Address"
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />

                  <textarea
                    rows={3}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us about the sweets, varieties or bulk gift box quantities needed..."
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />

                  <button
                    type="submit"
                    className="bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light px-8 py-3 rounded-2xl font-bold text-xs shadow-soft hover:scale-[1.02] transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* QUICK VIEW & ORDER MODAL (ALL DETAILS IN ONE PLACE) */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#FFFDF9] rounded-3xl border-2 border-brand-gold/60 max-w-2xl w-full p-6 sm:p-8 shadow-float space-y-6 my-8 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-brand-charcoal bg-brand-surface rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              {/* Product Image */}
              <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-brand-surface border border-brand-border">
                <img
                  src={getProductImageUrl(quickViewProduct)}
                  alt={quickViewProduct.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold font-serif">
                  {quickViewProduct.categories?.name || 'Traditional Delicacy'}
                </span>

                <h3 className="font-serif font-bold text-lg text-brand-charcoal leading-snug">
                  {quickViewProduct.name}
                </h3>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-stone-700">
                    {Number(quickViewProduct.rating || 5).toFixed(1)}
                  </span>
                  <span className="text-stone-400">({quickViewProduct.review_count || 100}+ reviews)</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  {quickViewProduct.description}
                </p>

                {/* Price Display */}
                <div className="bg-brand-surface p-3 rounded-xl border border-brand-border flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-stone-500 mr-1">Price:</span>
                    <span className="font-serif font-black text-xl text-brand-maroon">
                      ₹{calculateModalPrice(quickViewProduct.price, modalWeight) * modalQuantity}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">for {modalWeight}</span>
                </div>

                {/* Weight Selector */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-stone-700 uppercase font-serif">
                    Pack Weight:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['250g', '500g', '1kg'].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setModalWeight(w)}
                        className={`py-1 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          modalWeight === w
                            ? 'bg-brand-maroon text-brand-gold-light border-brand-maroon'
                            : 'bg-brand-surface text-stone-600 border-brand-border hover:border-brand-gold'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-bold text-stone-700">Qty:</span>
                  <div className="flex items-center border border-brand-border rounded-lg bg-brand-surface">
                    <button
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="px-2.5 py-1 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-2 py-1 text-xs font-bold text-brand-charcoal">{modalQuantity}</span>
                    <button
                      onClick={() => setModalQuantity(modalQuantity + 1)}
                      className="px-2.5 py-1 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Tabs in Modal: Ingredients, Taste, Shelf Life, Storage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-brand-surface p-4 rounded-2xl border border-brand-border text-xs text-stone-600">
              <div>
                <strong className="text-brand-charcoal block font-serif">Ingredients Used:</strong>
                <span>{quickViewProduct.ingredients || 'Pure Desi Cow Ghee, Refined Flour, Sugar, Cardamom'}</span>
              </div>
              <div>
                <strong className="text-brand-charcoal block font-serif">Taste Profile:</strong>
                <span>{quickViewProduct.taste_profile || 'Crispy shell with rich fragrant cardamom sweetness'}</span>
              </div>
              <div>
                <strong className="text-brand-charcoal block font-serif">Shelf Life:</strong>
                <span>{quickViewProduct.shelf_life || '15 Days from packing date'}</span>
              </div>
              <div>
                <strong className="text-brand-charcoal block font-serif">Storage:</strong>
                <span>{quickViewProduct.storage_instructions || 'Store in cool dry airtight container'}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleModalAddToCart}
                className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  modalAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-cream border-2 border-brand-gold text-brand-maroon hover:bg-brand-gold hover:text-white'
                }`}
              >
                {modalAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{modalAdded ? 'Added to Cart!' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleModalBuyNow}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light hover:shadow-gold transition-all"
              >
                <span>Buy Now • Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

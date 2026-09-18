import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Award,
  Heart,
  ChevronRight,
  ChevronLeft,
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
  Play,
  Pause,
  Film,
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
  DEFAULT_HERO_HEADING,
  DEFAULT_HERO_SUBHEADING,
  DEFAULT_HERO_CTA_TEXT,
  DEFAULT_SWEET_VIDEO_SLIDES,
  DEFAULT_TEMPTATION_VIDEOS,
  SweetVideoSlide,
  TemptationVideoCard,
  getAllSiteSettings
} from '../lib/storage';

interface HomeProps {
  onOpenChatbot?: () => void;
  onToast?: (msg: string) => void;
}

interface HomepageCategoryCard {
  name: string;
  slug: string;
  representativeSlug: string;
  representativeName: string;
  description: string;
  count: number;
}

const EXACT_HOMEPAGE_CATEGORIES: HomepageCategoryCard[] = [
  {
    name: 'Kaja Varieties',
    slug: 'kaja-varieties',
    representativeSlug: 'madatha-kaja',
    representativeName: 'Madatha Kaja',
    description: 'Discover traditional Kakinada kaja varieties in different styles.',
    count: 6,
  },
  {
    name: 'Kaju & Dry Fruit Sweets',
    slug: 'dry-fruit-sweets',
    representativeSlug: 'kaju-barfi',
    representativeName: 'Kaju Barfi',
    description: 'Rich and premium sweets featuring cashew and dry-fruit flavours.',
    count: 1,
  },
  {
    name: 'Traditional Sweets',
    slug: 'traditional-sweets',
    representativeSlug: 'jangri',
    representativeName: 'Jangri',
    description: 'Classic Indian sweets and traditional Andhra favourites.',
    count: 10,
  },
  {
    name: 'Laddu Varieties',
    slug: 'laddu-varieties',
    representativeSlug: 'boondhi-laddu',
    representativeName: 'Boondhi Laddu',
    description: 'A selection of traditional laddu varieties for every occasion.',
    count: 6,
  },
  {
    name: 'Milk Sweets & Kalakand',
    slug: 'milk-ghee-sweets',
    representativeSlug: 'white-piece-kalakand',
    representativeName: 'White Piece Kalakand',
    description: 'Rich milk-based sweets and traditional kalakand varieties.',
    count: 9,
  },
  {
    name: 'Halwa Varieties',
    slug: 'halwa-varieties',
    representativeSlug: 'fruit-halwa',
    representativeName: 'Fruit Halwa',
    description: 'Traditional halwa varieties with rich flavours.',
    count: 3,
  },
  {
    name: 'Pootharekulu',
    slug: 'pootharekulu',
    representativeSlug: 'bellam-pootharekulu',
    representativeName: 'Bellam Pootharekulu',
    description: 'Delicate Andhra paper-thin sweet varieties.',
    count: 4,
  },
  {
    name: 'Savouries & Snacks',
    slug: 'savouries-snacks',
    representativeSlug: 'mixture',
    representativeName: 'Mixture',
    description: 'Crunchy and savoury favourites from the Kotaiah Sweets catalogue.',
    count: 3,
  },
  {
    name: 'Special Andhra Snacks',
    slug: 'special-andhra-snacks',
    representativeSlug: 'special-andhra-ribbon-murukku',
    representativeName: 'Special Andhra Ribbon Murukku',
    description: 'Traditional Andhra-style crunchy ribbon murukku.',
    count: 1,
  },
];

export const Home: React.FC<HomeProps> = ({ onOpenChatbot, onToast }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [allProducts, setAllProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Video Carousel Slides & Temptation Cards
  const [sweetSlides, setSweetSlides] = useState<SweetVideoSlide[]>(DEFAULT_SWEET_VIDEO_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [temptationVideos, setTemptationVideos] = useState<TemptationVideoCard[]>(DEFAULT_TEMPTATION_VIDEOS);
  const [activePlayingTemptation, setActivePlayingTemptation] = useState<string | null>(null);

  // Hero Headlines & CTA
  const [heroHeading, setHeroHeading] = useState<string>(DEFAULT_HERO_HEADING);
  const [heroSubheading, setHeroSubheading] = useState<string>(DEFAULT_HERO_SUBHEADING);
  const [heroCtaText, setHeroCtaText] = useState<string>(DEFAULT_HERO_CTA_TEXT);
  const [heroVideoError, setHeroVideoError] = useState<boolean>(false);
  
  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [modalWeight, setModalWeight] = useState<string>('500g');
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalAdded, setModalAdded] = useState<boolean>(false);

  // Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', message: '' });

  // Video Carousel Auto Rotation (Clean timer lifecycle without rebuilding on every frame)
  useEffect(() => {
    if (sweetSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % sweetSlides.length);
    }, 9000);

    return () => clearInterval(timer);
  }, [sweetSlides.length]);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        // 1. Fetch Dynamic Hero Video & Poster Settings in a single batched query
        const [settingsMap, { data: cats }, { data: prods }, { data: offs }, { data: revs }] = await Promise.all([
          getAllSiteSettings(),
          supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
          supabase.from('products').select('*, categories(name), product_images(*)').eq('is_available', true).order('rating', { ascending: false }),
          supabase.from('offers').select('*').eq('is_active', true).limit(3),
          supabase.from('reviews').select('*').eq('is_approved', true).limit(6),
        ]);

        if (!isMounted) return;

        if (settingsMap) {
          if (settingsMap.hero_heading) setHeroHeading(settingsMap.hero_heading);
          if (settingsMap.hero_subheading) setHeroSubheading(settingsMap.hero_subheading);
          if (settingsMap.hero_cta_text) setHeroCtaText(settingsMap.hero_cta_text);
          if (settingsMap.hero_video_slides && Array.isArray(settingsMap.hero_video_slides) && settingsMap.hero_video_slides.length > 0) {
            setSweetSlides(settingsMap.hero_video_slides);
          } else if (settingsMap.hero_video_url && settingsMap.hero_video_url !== DEFAULT_HERO_VIDEO_URL) {
            setSweetSlides((prev) => [
              {
                ...prev[0],
                videoUrl: settingsMap.hero_video_url,
                posterUrl: settingsMap.hero_poster_url || prev[0].posterUrl,
              },
              ...prev.slice(1),
            ]);
          }
          if (settingsMap.temptation_videos && Array.isArray(settingsMap.temptation_videos) && settingsMap.temptation_videos.length > 0) {
            setTemptationVideos(settingsMap.temptation_videos);
          }
        }

        if (cats && cats.length > 0) setCategories(cats as Category[]);
        if (prods && prods.length > 0) setAllProducts(prods as Product[]);
        if (offs && offs.length > 0) setOffers(offs as Offer[]);
        if (revs && revs.length > 0) setReviews(revs as Review[]);
      } catch (err) {
        console.error('Home data load error:', err);
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Featured Sweets (is_featured === true)
  const featuredProducts = allProducts.filter((p) => p.is_featured).slice(0, 8);

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
    <div className="bg-heritage-ivory min-h-screen space-y-16 sm:space-y-24 pb-16 text-brand-charcoal">
      
      {/* 1. HERO VIDEO CAROUSEL SECTION */}
      {(() => {
        const currentSlide = sweetSlides[activeSlideIndex] || sweetSlides[0] || DEFAULT_SWEET_VIDEO_SLIDES[0];

        return (
          <section className="relative w-full h-[460px] sm:h-[520px] lg:h-[600px] flex items-center justify-start overflow-hidden bg-stone-950 border-b border-brand-gold/30">
            
            {/* Background Video Player Layer */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <video
                key={currentSlide.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={currentSlide.posterUrl}
                onError={() => setHeroVideoError(true)}
                onEnded={() => setActiveSlideIndex((prev) => (prev + 1) % sweetSlides.length)}
                className="hero-bg-video absolute inset-0 w-full h-full object-cover object-center scale-[1.01] transform transition-all duration-700"
                aria-hidden="true"
              >
                <source src={currentSlide.videoUrl} type="video/mp4" />
                <source src={DEFAULT_HERO_VIDEO_URL} type="video/mp4" />
              </video>

              {/* Reduced-motion & loading poster fallback */}
              <img
                src={currentSlide.posterUrl}
                alt={currentSlide.title || "Kotaiah Sweets Traditional Indian Sweets"}
                className={`hero-poster-fallback absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
                  heroVideoError ? 'opacity-100 z-1' : 'hidden'
                }`}
              />
            </div>

            {/* Modern Food-Ordering Gradient Overlay (Left to Right) */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(36, 28, 24, 0.82) 0%, rgba(36, 28, 24, 0.45) 55%, rgba(36, 28, 24, 0.12) 100%)'
              }}
            />

            {/* Vertical Vignette for Mobile & Edge Softness */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />

            {/* Bottom Gradient Fade connecting Hero seamlessly into Page Background (#FFF9F5) */}
            <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-[#FFF9F5] to-transparent pointer-events-none z-10" />

            {/* Main Food-Ordering Hero Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl text-left space-y-4 sm:space-y-6">
                
                {/* Active Sweet Pill Badge */}
                <div className="inline-flex items-center gap-2 bg-brand-primary/95 text-white border border-brand-gold/60 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold shadow-primary">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold-light animate-spin-slow" />
                  <span className="tracking-wide">
                    {currentSlide.tag || 'Signature Sweet'}: {currentSlide.title}
                  </span>
                  {currentSlide.priceText && (
                    <span className="bg-black/30 px-2 py-0.5 rounded-full text-[10px] text-brand-gold-light font-extrabold ml-1">
                      {currentSlide.priceText}
                    </span>
                  )}
                </div>

                {/* Primary Hero Headlines */}
                <div className="space-y-2">
                  <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[#FFFFFF] tracking-tight leading-[1.15] drop-shadow-md">
                    Fresh Sweets. <br className="hidden sm:inline" />
                    <span className="text-brand-gold-light">Traditional Taste.</span>
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-stone-200 line-clamp-2 sm:line-clamp-3 leading-relaxed font-sans max-w-xl drop-shadow">
                    {currentSlide.subtitle || 'Experience the world-renowned Kakinada Gottam Kaja, Atreyapuram Pootharekulu, and authentic pure desi cow ghee sweets.'}
                  </p>
                </div>

                {/* Main Action CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#menu"
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-7 sm:px-9 py-3.5 sm:py-4 rounded-full font-black text-xs sm:text-sm tracking-wider shadow-primary hover:scale-105 transition-all cursor-pointer"
                  >
                    <span>{heroCtaText || 'ORDER NOW'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <Link
                    to="/products"
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md px-6 py-3.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm shadow-soft hover:scale-105 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4 text-brand-gold-light" />
                    <span>View Menu</span>
                  </Link>

                  {onOpenChatbot && (
                    <button
                      onClick={onOpenChatbot}
                      className="hidden sm:flex items-center gap-1.5 bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white border border-white/20 backdrop-blur-md px-4 py-3.5 rounded-full font-semibold text-xs shadow-soft transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold-light" />
                      <span>Ask AI</span>
                    </button>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-6 pt-2 text-[11px] sm:text-xs text-stone-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold-light" />
                    <span>100% Desi Cow Ghee</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-gold-light" />
                    <span>Fresh Daily Batches</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-brand-gold-light" />
                    <span>Since 1900</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Video Carousel Indicators & Controls */}
            {sweetSlides.length > 1 && (
              <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                <button
                  onClick={() => setActiveSlideIndex((prev) => (prev - 1 + sweetSlides.length) % sweetSlides.length)}
                  className="text-stone-300 hover:text-white p-1 transition-colors"
                  title="Previous sweet video"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 px-1">
                  {sweetSlides.map((slide, idx) => (
                    <button
                      key={slide.id || idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeSlideIndex === idx
                          ? 'w-6 bg-brand-primary shadow-xs'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      title={slide.title}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setActiveSlideIndex((prev) => (prev + 1) % sweetSlides.length)}
                  className="text-stone-300 hover:text-white p-1 transition-colors"
                  title="Next sweet video"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </section>
        );
      })()}


      {/* 2. FEATURED SWEETS (SIGNATURE COLLECTION) */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-brand-border/80 pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider font-serif">
              <Award className="w-4 h-4 text-brand-gold" />
              <span>Kotaiah's Signature Heritage</span>
            </div>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal">
              Featured Signature Sweets
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted font-sans">
              Handpicked customer favourites crafted fresh with pure country cow ghee and generational recipes.
            </p>
          </div>

          <Link
            to="/products"
            className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-hover transition-colors bg-brand-light-orange px-4 py-2 rounded-full border border-brand-border"
          >
            <span>View All ({allProducts.length}) Sweets</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured Sweets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => {
            const primaryImg = getProductImageUrl(product);
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-brand-border/90 p-4 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative"
              >
                <div>
                  {/* Badge */}
                  <span className="absolute top-6 left-6 z-10 bg-brand-primary text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-soft">
                    ⭐ Featured
                  </span>

                  {/* Image Container */}
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-brand-light-orange mb-3">
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
                      className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Quick View & Order</span>
                    </button>

                    {/* Wishlist toggle */}
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
                      <Star className="w-3 h-3 fill-current text-brand-gold" />
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
                    className="font-serif font-bold text-sm text-brand-charcoal line-clamp-1 hover:text-brand-primary cursor-pointer"
                  >
                    {product.name}
                  </h3>

                  <p className="text-[11px] text-brand-muted mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-brand-muted mr-1">Price:</span>
                    <span className="font-serif font-black text-base text-brand-primary">
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
                    className="flex items-center gap-1 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-xs"
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

      {/* Ornamental Divider */}
      <div className="ornamental-divider max-w-4xl px-4 opacity-50">
        <span className="text-brand-gold text-xs">❖</span>
      </div>

      {/* 3. CATEGORIES SECTION */}
      <section id="categories" className="bg-heritage-mandala py-16 border-y border-brand-border/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider font-serif">
              Authentic Variety
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal">
              Explore By Sweet Categories
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted font-sans">
              Discover authentic Andhra culinary delicacies prepared with time-honored traditional protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {EXACT_HOMEPAGE_CATEGORIES.map((cat) => {
              // Retrieve representative product from Supabase / products catalogue data
              const repProduct = allProducts.find(
                (p) =>
                  p.slug === cat.representativeSlug ||
                  p.name.toLowerCase().includes(cat.representativeName.toLowerCase())
              );

              // Get actual unique product image from database or catalogue asset
              const repImageUrl = repProduct
                ? getProductImageUrl(repProduct)
                : `/sweets/${cat.representativeSlug}.jpg`;

              // Match corresponding database category if available, else use slug
              const matchingDbCat = categories.find(
                (c) =>
                  c.slug === cat.slug ||
                  c.name.toLowerCase() === cat.name.toLowerCase() ||
                  (cat.slug === 'kaja-varieties' && (c.slug === 'kaja-specials' || c.name.includes('Kaja'))) ||
                  (cat.slug === 'halwa-varieties' && (c.slug === 'halwa-specials' || c.name.includes('Halwa'))) ||
                  (cat.slug === 'savouries-snacks' && (c.slug === 'savouries-namkeen' || c.name.includes('Savouries')))
              );

              const categoryLink = matchingDbCat
                ? `/products?category=${matchingDbCat.id}`
                : `/products?category=${cat.slug}`;

              const countText = `${cat.count} ${cat.count === 1 ? 'Delicacy' : 'Delicacies'}`;

              return (
                <Link
                  key={cat.slug}
                  to={categoryLink}
                  className="group bg-white rounded-2xl border border-brand-border/80 overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 text-center"
                >
                  <div className="relative w-full h-36 overflow-hidden bg-brand-light-orange">
                    <img
                      src={repImageUrl}
                      alt={cat.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `/sweets/${cat.representativeSlug}.jpg`;
                      }}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  </div>

                  <div className="p-4 space-y-1.5 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-brand-charcoal group-hover:text-brand-primary transition-colors line-clamp-1">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-brand-muted line-clamp-2 leading-relaxed mt-1">
                        {cat.description}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-brand-border/50 mt-2">
                      <span className="inline-block text-[10px] font-bold text-brand-primary bg-brand-light-orange px-2.5 py-0.5 rounded-full">
                        {countText}
                      </span>
                      <span className="text-[11px] font-bold text-brand-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <span>Browse</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ornamental Divider */}
      <div className="ornamental-divider max-w-4xl px-4 opacity-50">
        <span className="text-brand-gold text-xs">❖</span>
      </div>

      {/* 4. POPULAR & BESTSELLER PRODUCTS (FULL CATALOGUE WITH TABS) */}
      <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider font-serif">
            <Flame className="w-4 h-4 fill-brand-gold text-brand-gold" />
            <span>Complete Traditional Sweets Menu</span>
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal">
            Popular & Bestseller Sweets
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted font-sans">
            Choose your favorites below. Click on any item for full ingredients, taste profile, weight options, and instant order.
          </p>
        </div>

        {/* Category Filter Tabs */}
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
                  ? 'bg-brand-primary text-white border-brand-primary shadow-xs scale-105'
                  : 'bg-white text-brand-muted border-brand-border hover:border-brand-primary hover:text-brand-primary'
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
                className="group bg-white rounded-2xl border border-brand-border/90 p-4 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative"
              >
                <div>
                  {/* Image */}
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-brand-light-orange mb-3">
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
                      <Star className="w-3 h-3 fill-current text-brand-gold" />
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
                    className="font-serif font-bold text-sm text-brand-charcoal line-clamp-1 hover:text-brand-primary cursor-pointer"
                  >
                    {product.name}
                  </h3>

                  <p className="text-[11px] text-brand-muted mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-brand-muted mr-1">Price:</span>
                    <span className="font-serif font-black text-base text-brand-primary">
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
                    className="flex items-center gap-1 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-xs"
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

      {/* Ornamental Divider */}
      <div className="ornamental-divider max-w-4xl px-4 opacity-50">
        <span className="text-brand-gold text-xs">❖</span>
      </div>

      {/* 4.5. MADE TO TEMPT YOU - FOOD VIDEO SHOWCASE SECTION */}
      <section id="made-to-tempt-you" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider bg-brand-light-orange px-3.5 py-1 rounded-full border border-brand-border">
            <Film className="w-3.5 h-3.5 text-brand-primary" />
            <span>Fresh From The Sweet Kitchen</span>
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal">
            Made to Tempt You
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted font-sans">
            Watch our master sweet artisans handcraft golden Kaja, melt-in-mouth Laddus, and crisp Pootharekulu in pure country ghee.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {temptationVideos.map((item) => {
            const matchedProduct = allProducts.find(
              (p) => p.slug === item.slug || p.name.toLowerCase().includes(item.name.toLowerCase())
            );

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-[#F0E5DC] overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                {/* Video / Poster Showcase with Rounded Top */}
                <div className="relative w-full h-52 overflow-hidden bg-stone-900 rounded-t-2xl">
                  <video
                    src={item.videoUrl}
                    poster={item.posterUrl}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    aria-label={`Video of ${item.name}`}
                  >
                    <source src={item.videoUrl} type="video/mp4" />
                    <source src={DEFAULT_HERO_VIDEO_URL} type="video/mp4" />
                  </video>

                  {/* Fallback image */}
                  <img
                    src={item.posterUrl}
                    alt={item.name}
                    className="hero-poster-fallback hidden absolute inset-0 w-full h-full object-cover object-center"
                  />

                  {/* Top Badge: Category */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/60 backdrop-blur-md text-brand-gold-light text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-white/20">
                      {item.category}
                    </span>
                  </div>

                  {/* Bottom Video Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-sans">
                    <Play className="w-2.5 h-2.5 fill-current text-brand-primary" />
                    <span>Sweetcraft</span>
                  </div>
                </div>

                {/* Card Details & Quick Order Action */}
                <div className="p-4 space-y-2 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-serif font-bold text-base text-brand-charcoal group-hover:text-brand-primary transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-brand-muted line-clamp-2 mt-0.5 leading-relaxed">
                      {item.tasteNote}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Pure Ghee Price:</span>
                      <span className="font-serif font-black text-base text-brand-primary">
                        ₹{item.price}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (matchedProduct) {
                          setQuickViewProduct(matchedProduct);
                          setModalWeight(matchedProduct.weight || '500g');
                          setModalQuantity(1);
                        } else {
                          navigate('/products');
                        }
                      }}
                      className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order Delicacy</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ornamental Divider */}
      <div className="ornamental-divider max-w-4xl px-4 opacity-50">
        <span className="text-brand-gold text-xs">❖</span>
      </div>

      {/* 5. ABOUT / BRAND HERITAGE SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white bg-heritage-mandala rounded-3xl border border-brand-gold/40 p-6 sm:p-10 shadow-soft">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider font-serif">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>Generations of Master Craftsmanship</span>
            </div>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal leading-tight">
              About Kotaiah Sweets
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-sans">
              Founded in <strong>1900 in Kakinada, Andhra Pradesh</strong>, Kotaiah Sweets is the home of the world-famous <strong>Kakinada Gottam Kaja</strong>. For over a century, our master confectionery artisans have preserved the authentic taste, layered crunch, and warm cardamom syrup infusion that has delighted generations of sweet lovers across India.
            </p>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-sans">
              Every preparation strictly uses 100% pure desi cow ghee, freshly ground spices, and traditional brass and copper vessels to achieve the genuine aroma and velvety richness celebrated in every festive moment.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-border/60 text-center sm:text-left">
              <div>
                <div className="font-serif font-black text-2xl text-brand-primary">1900</div>
                <div className="text-[11px] text-brand-muted font-medium">Established in Kakinada</div>
              </div>
              <div>
                <div className="font-serif font-black text-2xl text-brand-primary">100%</div>
                <div className="text-[11px] text-brand-muted font-medium">Pure Desi Cow Ghee</div>
              </div>
              <div>
                <div className="font-serif font-black text-2xl text-brand-primary">43+</div>
                <div className="text-[11px] text-brand-muted font-medium">Traditional Sweets</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden border-2 border-brand-gold/40 shadow-card bg-brand-light-orange">
              <img
                src="/sweets/kakinada-gottam-kaja.jpg"
                alt="Traditional Kakinada Gottam Kaja"
                className="w-full h-72 object-cover object-center"
              />
              <div className="p-4 bg-white border-t border-brand-border">
                <span className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-wider block">Signature Creation</span>
                <h4 className="font-serif font-bold text-sm text-brand-charcoal">Original Kakinada Gottam Kaja</h4>
                <p className="text-[11px] text-brand-muted">Crispy exterior with luscious cardamom syrup center.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section id="why-choose-us" className="bg-heritage-warm py-16 border-y border-brand-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider font-serif">
              Artisanal Commitment
            </span>
            <h2 className="font-serif font-black text-3xl text-brand-charcoal">
              Why Choose Kotaiah Sweets
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted font-sans">
              Every batch is crafted following traditional confectionery protocols to preserve purity and genuine taste.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-soft text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-light-orange border border-brand-primary/20 text-brand-primary flex items-center justify-center mx-auto shadow-xs">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-sm text-brand-charcoal">100% Pure Desi Ghee</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Prepared exclusively with pure country cow ghee for signature aroma and velvety richness.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-soft text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-light-orange border border-brand-primary/20 text-brand-primary flex items-center justify-center mx-auto shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-sm text-brand-charcoal">Original 1900 Recipe</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Generational confectionery mastery creating authentic Gottam Kaja and Nethi Kaja.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-soft text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-light-orange border border-brand-primary/20 text-brand-primary flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-sm text-brand-charcoal">Vacuum-Sealed Packing</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Food grade tamper-proof packing ensuring peak crispiness and freshness delivered to your doorstep.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-soft text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-light-orange border border-brand-primary/20 text-brand-primary flex items-center justify-center mx-auto shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-sm text-brand-charcoal">Fresh Daily Batches</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Slow-simmered daily in morning batches to ensure optimal taste and extended shelf-life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ornamental Divider */}
      <div className="ornamental-divider max-w-4xl px-4 opacity-50">
        <span className="text-brand-gold text-xs">❖</span>
      </div>

      {/* 7. CUSTOMER REVIEWS */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-gold uppercase tracking-wider font-serif">
            <Heart className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
            <span>Customer Testimonials</span>
          </div>
          <h2 className="font-serif font-black text-3xl text-brand-charcoal">
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
              className="bg-white rounded-2xl border border-brand-border p-6 shadow-soft space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-brand-gold" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#2E8B57] bg-[#2E8B57]/10 px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Order
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-brand-charcoal">{rev.title}</h4>
                <p className="text-xs text-brand-muted leading-relaxed mt-1">"{rev.comment}"</p>
              </div>

              <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-brand-charcoal">{rev.name}</div>
                  <div className="text-[10px] text-brand-muted">{rev.city}</div>
                </div>
                <span className="text-[10px] text-brand-primary font-bold bg-brand-light-orange px-2 py-0.5 rounded">
                  {rev.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ornamental Divider */}
      <div className="ornamental-divider max-w-4xl px-4 opacity-50">
        <span className="text-brand-gold text-xs">❖</span>
      </div>

      {/* 8. AI ASSISTANT / RAG DISCOVERY SECTION */}
      {onOpenChatbot && (
        <section id="ai-assistant" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#241B18] via-[#3A2218] to-[#1C1412] rounded-3xl p-8 sm:p-12 border-2 border-brand-gold/60 shadow-float text-[#FFFFFF] relative overflow-hidden">
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 bg-brand-primary/25 text-brand-gold-light border border-brand-gold/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-serif">
                  <Sparkles className="w-4 h-4 text-brand-gold-light" />
                  <span>Interactive AI Sweet Connoisseur</span>
                </div>
                <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#FFFFFF] leading-tight">
                  Need Help Choosing The Perfect Sweets?
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                  Ask our AI Assistant about ingredients, allergen information, shelf-life, custom gift assortments, or taste profiles across all 43 authentic delicacies.
                </p>

                {/* Sample Prompt Chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    '🎁 Best sweets for wedding & festive gifting',
                    '✨ Difference between Gottam Kaja & Madatha Kaja',
                    '🌿 Pure ghee sweets with organic jaggery',
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={onOpenChatbot}
                      className="text-[11px] bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 transition-all text-stone-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
                <button
                  onClick={onOpenChatbot}
                  className="flex items-center gap-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 rounded-full font-black text-sm tracking-wide shadow-primary hover:scale-105 transition-all"
                >
                  <Sparkles className="w-5 h-5 fill-current" />
                  <span>Launch AI Assistant</span>
                </button>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Ornamental Divider */}
      <div className="ornamental-divider max-w-4xl px-4 opacity-50">
        <span className="text-brand-gold text-xs">❖</span>
      </div>

      {/* 9. SPECIAL OFFERS SECTION (🟠 Light Orange #FFF0E6 Background Section) */}
      <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-light-orange rounded-3xl p-6 sm:p-10 border-2 border-brand-primary/30 shadow-soft text-brand-charcoal relative overflow-hidden">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-serif shadow-xs">
                <Gift className="w-3.5 h-3.5" />
                <span>Festive Celebration Promo</span>
              </div>
              <h3 className="font-serif font-black text-2xl sm:text-4xl text-brand-charcoal leading-tight">
                Use Coupon Codes For Instant Discounts!
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted max-w-xl leading-relaxed">
                Apply coupon code <code className="bg-white px-2 py-0.5 rounded text-brand-primary font-mono font-bold border border-brand-primary/30">FESTIVE15</code> for 15% off orders over ₹999, or <code className="bg-white px-2 py-0.5 rounded text-brand-primary font-mono font-bold border border-brand-primary/30">WELCOME10</code> for 10% off your first order.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-2.5">
              {[
                { code: 'FESTIVE15', title: '15% Off All Sweets', min: '₹999' },
                { code: 'KAJA50', title: '10% Off Gottam & Nethi Kaja', min: '₹499' },
                { code: 'WELCOME10', title: '10% Welcome Discount', min: '₹300' },
              ].map((c) => (
                <div key={c.code} className="bg-white border border-brand-border rounded-2xl p-3 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="font-mono font-black text-xs text-white bg-brand-primary px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <h4 className="font-serif font-bold text-xs text-brand-charcoal mt-1">{c.title}</h4>
                  </div>
                  <span className="text-[11px] text-brand-muted font-medium">Min. {c.min}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. STORE LOCATIONS & INQUIRY FORM */}
      <section id="contact" className="bg-heritage-warm py-16 border-t border-brand-border/80">
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
                <p className="text-xs text-brand-muted leading-relaxed">
                  Visit our historic Kakinada counter or order online for fast home delivery across all cities.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-soft space-y-3 text-xs text-brand-muted">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>Main Bazaar Road, Near Clock Tower, Kakinada, Andhra Pradesh - 533001</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                  <span>+91 884 237 8999 / +91 94401 23456</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                  <span>orders@kotaiahsweets.com</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                  <span>Open Daily: 7:00 AM – 10:30 PM (Fresh morning batches at 8 AM)</span>
                </p>
              </div>
            </div>

            {/* Quick Bulk Inquiry Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-brand-border shadow-soft space-y-4">
              <h3 className="font-serif font-bold text-lg text-brand-charcoal">
                Send Bulk Order Inquiry / Message
              </h3>

              {contactSubmitted ? (
                <div className="p-6 bg-[#2E8B57]/10 border border-[#2E8B57]/30 rounded-2xl text-center space-y-2 text-xs text-[#2E8B57]">
                  <CheckCircle2 className="w-8 h-8 text-[#2E8B57] mx-auto" />
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
                      className="bg-brand-bg p-2.5 rounded-xl border border-brand-border text-brand-charcoal focus:outline-none focus:border-brand-primary"
                    />
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="Your Phone Number *"
                      className="bg-brand-bg p-2.5 rounded-xl border border-brand-border text-brand-charcoal focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Your Email Address"
                    className="w-full bg-brand-bg p-2.5 rounded-xl border border-brand-border text-brand-charcoal focus:outline-none focus:border-brand-primary"
                  />

                  <textarea
                    rows={3}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us about the sweets, varieties or bulk gift box quantities needed..."
                    className="w-full bg-brand-bg p-2.5 rounded-xl border border-brand-border text-brand-charcoal focus:outline-none focus:border-brand-primary"
                  />

                  <button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-3 rounded-2xl font-bold text-xs shadow-primary hover:scale-[1.02] transition-all flex items-center gap-2"
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
          <div className="bg-white rounded-3xl border-2 border-brand-gold/60 max-w-2xl w-full p-6 sm:p-8 shadow-float space-y-6 my-8 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 text-brand-muted hover:text-brand-charcoal bg-brand-light-orange rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              {/* Product Image */}
              <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-brand-light-orange border border-brand-border">
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
                      <Star key={i} className="w-3 h-3 fill-current text-brand-gold" />
                    ))}
                  </div>
                  <span className="font-bold text-brand-charcoal">
                    {Number(quickViewProduct.rating || 5).toFixed(1)}
                  </span>
                  <span className="text-brand-muted">({quickViewProduct.review_count || 100}+ reviews)</span>
                </div>

                <p className="text-xs text-brand-muted leading-relaxed font-sans">
                  {quickViewProduct.description}
                </p>

                {/* Price Display */}
                <div className="bg-brand-light-orange p-3 rounded-xl border border-brand-border flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-brand-muted mr-1">Price:</span>
                    <span className="font-serif font-black text-xl text-brand-primary">
                      ₹{calculateModalPrice(quickViewProduct.price, modalWeight) * modalQuantity}
                    </span>
                  </div>
                  <span className="text-[11px] text-brand-muted">for {modalWeight}</span>
                </div>

                {/* Weight Selector */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-brand-charcoal uppercase font-serif">
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
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-brand-light-orange text-brand-muted border-brand-border hover:border-brand-primary hover:text-brand-primary'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-bold text-brand-charcoal">Qty:</span>
                  <div className="flex items-center border border-brand-border rounded-lg bg-brand-light-orange">
                    <button
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="px-2.5 py-1 font-bold text-xs text-brand-charcoal hover:text-brand-primary"
                    >
                      -
                    </button>
                    <span className="px-2 py-1 text-xs font-bold text-brand-charcoal">{modalQuantity}</span>
                    <button
                      onClick={() => setModalQuantity(modalQuantity + 1)}
                      className="px-2.5 py-1 font-bold text-xs text-brand-charcoal hover:text-brand-primary"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Tabs in Modal: Ingredients, Taste, Shelf Life, Storage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-brand-light-orange p-4 rounded-2xl border border-brand-border text-xs text-brand-muted">
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
                    ? 'bg-[#2E8B57] text-white'
                    : 'bg-brand-light-orange border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white'
                }`}
              >
                {modalAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{modalAdded ? 'Added to Cart!' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleModalBuyNow}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white shadow-primary hover:scale-[1.02] transition-all"
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

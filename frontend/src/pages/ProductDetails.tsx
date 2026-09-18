import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  MessageSquarePlus,
  Truck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Review, ProductImage } from '../types/database';
import { DEMO_PRODUCTS } from '../lib/demoData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/Skeleton';
import { ProductCard } from '../components/products/ProductCard';
import { getProductImageUrl } from '../lib/storage';

interface ProductDetailsProps {
  onToast?: (msg: string) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ onToast }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, profile } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedWeight, setSelectedWeight] = useState<string>('500g');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'storage' | 'reviews'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Review Submission State
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const { data: prod, error: prodErr } = await supabase
          .from('products')
          .select('*, categories(name), product_images(*)')
          .eq('id', id)
          .single();

        let matchedProduct = prod as Product;
        if (!matchedProduct) {
          matchedProduct = DEMO_PRODUCTS.find((p) => p.id === id) as Product;
        }

        if (matchedProduct) {
          setProduct(matchedProduct);
          setSelectedWeight(matchedProduct.weight || '500g');
          
          const primaryImg = getProductImageUrl(matchedProduct);
          setSelectedImage(primaryImg);
        }

        // Fetch all products for related recommendations
        const { data: allProds } = await supabase
          .from('products')
          .select('*, categories(name), product_images(*)')
          .eq('is_available', true);
        if (allProds && allProds.length > 0) {
          setAllProducts(allProds as Product[]);
        }

        // Fetch Approved Reviews
        const { data: revs } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (revs) setReviews(revs as Review[]);
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="w-full h-96 rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/4 h-8" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl text-brand-charcoal">Product Not Found</h2>
        <p className="text-xs text-stone-500">The sweet delicacy you are looking for might have moved or sold out.</p>
        <Link
          to="/products"
          className="inline-block bg-brand-maroon text-brand-gold-light font-bold text-xs px-6 py-3 rounded-xl hover:bg-brand-gold hover:text-white transition-colors"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  // Dynamic Price Calculation
  const calculatePrice = (weight: string) => {
    if (weight === '250g') return Math.round(product.price * 0.55);
    if (weight === '1kg') return Math.round(product.price * 1.95);
    return product.price;
  };

  const currentUnitPrice = calculatePrice(selectedWeight);
  const totalPrice = currentUnitPrice * quantity;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!product.is_available || product.stock <= 0) return;
    addToCart(product, quantity, selectedWeight);
    if (onToast) {
      onToast(`Added ${quantity} x ${product.name} (${selectedWeight}) to Cart!`);
    }
  };

  const handleBuyNow = () => {
    if (!product.is_available || product.stock <= 0) return;
    addToCart(product, quantity, selectedWeight);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    setReviewMessage('');

    try {
      const { data, error } = await supabase.from('reviews').insert({
        shop_id: product.shop_id,
        product_id: product.id,
        user_id: user.id,
        customer_name: profile?.full_name || user.email?.split('@')[0] || 'Sweet Lover',
        rating: newRating,
        comment: newComment.trim(),
        is_verified_purchase: false,
        is_approved: true,
      }).select().single();

      if (!error && data) {
        setReviews((prev) => [data as Review, ...prev]);
        setNewComment('');
        setReviewMessage('Thank you! Your verified review has been published.');
      } else {
        setReviewMessage('Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      setReviewMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-brand-gold">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-brand-gold">Catalogue</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${product.category_id}`} className="hover:text-brand-gold">
          {product.categories?.name || 'Sweets'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-brand-charcoal font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative w-full h-[420px] rounded-3xl overflow-hidden bg-brand-surface border-2 border-brand-border/80 shadow-card">
            <img
              src={selectedImage}
              alt={product.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=800&q=80';
              }}
              className="w-full h-full object-cover object-center"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.is_featured && (
                <span className="bg-brand-maroon text-brand-gold-light text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                  ⭐ Festive Special
                </span>
              )}
              {product.stock <= 10 && product.stock > 0 && (
                <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Only {product.stock} Units Left
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full transition-all shadow-md ${
                inWishlist
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/90 backdrop-blur-sm text-stone-600 hover:text-rose-600'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {product.product_images && product.product_images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.product_images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img.image_url
                      ? 'border-brand-gold ring-2 ring-brand-gold/30'
                      : 'border-brand-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Order Configuration */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark font-serif">
              {product.categories?.name || 'Traditional Delicacy'}
            </span>
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal mt-1 leading-tight">
              {product.name}
            </h1>

            {/* Rating Bar */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-900 text-sm">
                  {Number(product.rating || 5.0).toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                Based on {product.review_count || reviews.length} verified customer ratings
              </span>
            </div>
          </div>

          {/* Live Price Display */}
          <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border flex items-baseline justify-between">
            <div>
              <span className="text-xs text-stone-500 mr-2 font-medium">Price:</span>
              <span className="font-serif font-black text-3xl text-brand-maroon">
                ₹{currentUnitPrice}
              </span>
              <span className="text-xs text-stone-500 ml-2">for {selectedWeight} (incl. all taxes)</span>
            </div>
            
            <div className="text-right">
              {product.is_available && product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Currently Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Weight Pack Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-serif">
              Select Pack Weight / Quantity:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '250 grams', val: '250g', price: calculatePrice('250g') },
                { label: '500 grams (Standard)', val: '500g', price: calculatePrice('500g') },
                { label: '1 Kilogram (Best Value)', val: '1kg', price: calculatePrice('1kg') },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setSelectedWeight(opt.val)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedWeight === opt.val
                      ? 'bg-brand-maroon text-[#FFFDF9] border-brand-maroon shadow-card ring-2 ring-brand-gold/40'
                      : 'bg-[#FFFDF9] text-stone-700 border-brand-border hover:border-brand-gold'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.val}</div>
                  <div className={`text-[11px] mt-0.5 ${selectedWeight === opt.val ? 'text-brand-gold-light' : 'text-stone-500'}`}>
                    ₹{opt.price}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Picker & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 font-serif">
                Quantity:
              </span>
              <div className="flex items-center border border-brand-border rounded-xl bg-brand-surface overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 font-bold text-stone-700 hover:bg-brand-cream transition-colors text-sm"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-xs text-brand-charcoal min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 50, quantity + 1))}
                  className="px-3.5 py-2 font-bold text-stone-700 hover:bg-brand-cream transition-colors text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-stone-500">
                Total: <strong className="text-brand-maroon font-serif font-bold text-sm">₹{totalPrice}</strong>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_available || product.stock === 0}
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-xs bg-brand-cream border-2 border-brand-gold text-brand-maroon hover:bg-brand-gold hover:text-white transition-all shadow-soft disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!product.is_available || product.stock === 0}
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-xs bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light hover:shadow-gold transition-all shadow-soft hover:scale-[1.02] disabled:opacity-50"
              >
                <span>Buy Now (₹{totalPrice})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Value Assurance Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-brand-border">
            <div className="flex items-center gap-2.5 text-xs text-stone-600 bg-brand-surface p-2.5 rounded-xl border border-brand-border">
              <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
              <span>100% Pure Desi Ghee</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-stone-600 bg-brand-surface p-2.5 rounded-xl border border-brand-border">
              <Truck className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Vacuum-Sealed Packing</span>
            </div>
          </div>

        </div>

      </div>

      {/* Product Details Tabs (Ingredients, Taste, Allergens, Shelf Life, Reviews) */}
      <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        
        {/* Tab Header */}
        <div className="flex border-b border-brand-border overflow-x-auto bg-brand-surface">
          {[
            { key: 'overview', label: 'Overview & Taste' },
            { key: 'ingredients', label: 'Ingredients & Allergens' },
            { key: 'storage', label: 'Shelf Life & Storage' },
            { key: 'reviews', label: `Customer Reviews (${reviews.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 font-serif ${
                activeTab === t.key
                  ? 'bg-[#FFFDF9] text-brand-maroon border-brand-maroon'
                  : 'text-stone-500 border-transparent hover:text-brand-gold'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif font-bold text-lg text-brand-charcoal mb-2">Description</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  {product.description || 'Information not currently available.'}
                </p>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-brand-charcoal mb-2">Taste Profile & Culinary Notes</h3>
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-xs text-stone-700 leading-relaxed">
                  {product.taste_profile || 'Rich, authentic traditional Andhra flavour profile.'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif font-bold text-lg text-brand-charcoal mb-2">Ingredients Used</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  {product.ingredients || 'Information not currently available.'}
                </p>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-brand-charcoal mb-2">Allergen Information</h3>
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 text-xs text-rose-900 leading-relaxed">
                  {product.allergens || 'Information not currently available.'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif font-bold text-lg text-brand-charcoal mb-2">Shelf Life</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  {product.shelf_life || 'Information not currently available.'}
                </p>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-brand-charcoal mb-2">Storage Instructions</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  {product.storage_instructions || 'Store in a clean, airtight container at room temperature.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-4xl">
              
              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-lg text-brand-charcoal">
                  Customer Reviews ({reviews.length})
                </h3>

                {reviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-brand-surface p-4 rounded-2xl border border-brand-border space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex text-amber-500">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          {rev.is_verified_purchase && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-700 font-sans">"{rev.comment}"</p>
                        <div className="flex justify-between items-center text-[10px] text-stone-400 pt-1">
                          <span className="font-semibold text-brand-charcoal">{rev.customer_name}</span>
                          <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">
                    No reviews yet. Be the first to share your experience with this delicacy!
                  </p>
                )}
              </div>

              {/* Submit Review Form */}
              <div className="bg-brand-cream/60 p-6 rounded-2xl border border-brand-border space-y-4">
                <h4 className="font-serif font-bold text-base text-brand-charcoal flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-brand-gold" />
                  <span>Leave a Review</span>
                </h4>

                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Your Rating (1 to 5 Stars):
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                newRating >= star
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Your Feedback / Tasting Notes:
                      </label>
                      <textarea
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tell us about the texture, ghee flavour, sweetness balance..."
                        required
                        className="w-full bg-[#FFFDF9] text-xs text-brand-charcoal p-3 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                      />
                    </div>

                    {reviewMessage && (
                      <p className="text-xs font-semibold text-emerald-700">{reviewMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newComment.trim()}
                      className="bg-brand-maroon text-brand-gold-light text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-brand-gold hover:text-white transition-colors disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="text-xs text-stone-600 flex items-center justify-between">
                    <span>Please sign in to your customer account to submit a review.</span>
                    <Link
                      to="/login"
                      className="bg-brand-maroon text-brand-gold-light text-xs font-bold px-4 py-1.5 rounded-xl hover:bg-brand-gold hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {(() => {
        const related = allProducts
          .filter((p) => p.id !== product.id && (p.category_id === product.category_id || p.categories?.name === product.categories?.name))
          .slice(0, 4);
        if (related.length === 0) return null;

        return (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark font-serif">
                  Handcrafted Pairings
                </span>
                <h2 className="font-serif font-bold text-2xl text-brand-charcoal">
                  Related Traditional Delicacies
                </h2>
              </div>
              <Link
                to={`/products?category=${product.category_id}`}
                className="text-xs font-bold text-brand-maroon hover:text-brand-gold transition-colors flex items-center gap-1"
              >
                <span>View More in {product.categories?.name || 'Category'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} onToast={onToast} />
              ))}
            </div>
          </div>
        );
      })()}

    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { Product } from '../../types/database';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductImageUrl, DEFAULT_FALLBACK_IMAGE } from '../../lib/storage';

interface ProductCardProps {
  product: Product;
  onToast?: (msg: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onToast }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [selectedWeight, setSelectedWeight] = useState<string>(product.weight || '500g');
  const [isAdded, setIsAdded] = useState(false);

  const primaryImage = getProductImageUrl(product);

  const inWishlist = isInWishlist(product.id);

  // Dynamic price calculation based on selected weight
  const calculatePrice = (weight: string) => {
    if (weight === '250g') return Math.round(product.price * 0.55);
    if (weight === '1kg') return Math.round(product.price * 1.95);
    return product.price;
  };

  const currentPrice = calculatePrice(selectedWeight);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.is_available || product.stock <= 0) return;

    addToCart(product, 1, selectedWeight);
    setIsAdded(true);
    if (onToast) {
      onToast(`Added ${product.name} (${selectedWeight}) to your cart!`);
    }
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.is_available || product.stock <= 0) return;

    addToCart(product, 1, selectedWeight);
    navigate('/checkout');
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  return (
    <div className="group bg-[#FFFDF9] rounded-2xl border border-brand-border/90 p-4 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative">
      
      <div>
        {/* Image Container with Badges */}
        <div className="relative w-full h-52 rounded-xl overflow-hidden bg-brand-surface mb-3">
          <Link to={`/products/${product.id}`}>
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600&q=80';
              }}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <span className="bg-brand-maroon text-brand-gold-light text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm tracking-wider">
                Festive Best Seller
              </span>
            )}
            {product.stock <= 10 && product.stock > 0 && (
              <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Only {product.stock} Left
              </span>
            )}
            {!product.is_available || product.stock === 0 ? (
              <span className="bg-stone-800 text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Sold Out
              </span>
            ) : null}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
              inWishlist
                ? 'bg-rose-50 text-rose-600 shadow-sm'
                : 'bg-white/80 backdrop-blur-sm text-stone-600 hover:text-rose-600 hover:bg-white'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Category & Rating Row */}
        <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
          <span className="text-brand-gold font-semibold uppercase tracking-wider text-[11px] truncate">
            {product.categories?.name || 'Traditional Delicacy'}
          </span>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-amber-900 text-xs">
              {Number(product.rating || 5.0).toFixed(1)}
            </span>
            <span className="text-[10px] text-stone-500">({product.review_count || 0})</span>
          </div>
        </div>

        {/* Product Title */}
        <Link to={`/products/${product.id}`} className="block group-hover:text-brand-gold transition-colors">
          <h3 className="font-serif font-bold text-base text-brand-charcoal leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed font-sans">
          {product.description}
        </p>

        {/* Weight Selector */}
        <div className="mt-3 flex items-center gap-1.5">
          {['250g', '500g', '1kg'].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setSelectedWeight(w)}
              className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition-all ${
                selectedWeight === w
                  ? 'bg-brand-maroon text-brand-gold-light border-brand-maroon shadow-xs'
                  : 'bg-brand-surface text-stone-600 border-brand-border hover:border-brand-gold'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Price & Action Row */}
      <div className="mt-4 pt-3 border-t border-brand-border/60">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-xs text-stone-500 mr-1">Price:</span>
            <span className="font-serif font-black text-lg text-brand-maroon">
              ₹{currentPrice}
            </span>
          </div>
          <span className="text-[11px] text-stone-500">for {selectedWeight}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.is_available || product.stock === 0}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-cream border border-brand-gold/60 text-brand-maroon hover:bg-brand-gold hover:text-white hover:border-brand-gold'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={!product.is_available || product.stock === 0}
            className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light hover:shadow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            <span>Buy Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

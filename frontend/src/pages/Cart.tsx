import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Tag,
  Check,
  Truck,
  Store,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { Offer } from '../types/database';
import { getProductImageUrl } from '../lib/storage';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    deliveryType,
    setDeliveryType,
    appliedOffer,
    applyCoupon,
    removeCoupon,
    subtotal,
    deliveryFee,
    discountAmount,
    taxAmount,
    totalAmount,
  } = useCart();

  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await supabase.from('offers').select('*').eq('is_active', true);
      if (data) setAvailableOffers(data as Offer[]);
    };
    fetchOffers();
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const result = applyCoupon(couponInput.trim(), availableOffers);
    setCouponMessage({
      text: result.message,
      isError: !result.success,
    });
    if (result.success) {
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-cream border-2 border-brand-border flex items-center justify-center mx-auto text-brand-gold">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif font-black text-3xl text-brand-charcoal">Your Shopping Bag is Empty</h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Explore our authentic Andhra sweets, legendary Kakinada Gottam Kaja, and savoury snacks to fill your bag with sweetness!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light px-8 py-3.5 rounded-full font-bold text-xs shadow-gold hover:scale-105 transition-all"
        >
          <span>Explore Sweets Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-charcoal">
            Your Shopping Bag
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Review your selected sweets and choose delivery options
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border shadow-soft divide-y divide-brand-border/60 overflow-hidden">
            {cart.map((item) => {
              const primaryImg = getProductImageUrl(item.product);

              return (
                <div
                  key={`${item.product.id}-${item.selectedWeight}`}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={primaryImg}
                      alt={item.product.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=300&q=80';
                      }}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-brand-border bg-brand-surface shrink-0"
                    />

                    <div>
                      <span className="text-[10px] font-bold uppercase text-brand-gold-dark font-serif">
                        {item.product.categories?.name || 'Traditional Sweet'}
                      </span>
                      <Link
                        to={`/products/${item.product.id}`}
                        className="font-serif font-bold text-sm sm:text-base text-brand-charcoal hover:text-brand-gold transition-colors line-clamp-1 block"
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Selected Weight: <strong className="text-stone-700">{item.selectedWeight}</strong>
                      </div>
                      <div className="text-xs font-bold text-brand-maroon mt-1">
                        ₹{item.unitPrice} <span className="text-[10px] font-normal text-stone-500">per pack</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
                    <div className="flex items-center border border-brand-border rounded-xl bg-brand-surface overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedWeight)}
                        className="px-3 py-1.5 font-bold text-stone-700 hover:bg-brand-cream text-xs"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 font-bold text-xs text-brand-charcoal min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedWeight)}
                        className="px-3 py-1.5 font-bold text-stone-700 hover:bg-brand-cream text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="font-serif font-bold text-base text-brand-maroon">
                        ₹{item.unitPrice * item.quantity}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedWeight)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-maroon hover:text-brand-gold transition-colors pt-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Continue Shopping for More Sweets</span>
          </Link>
        </div>

        {/* Right: Order Summary & Checkout Card */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Delivery Method Selector */}
          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-5 shadow-soft space-y-3">
            <h3 className="font-serif font-bold text-sm text-brand-charcoal uppercase tracking-wider">
              Choose Delivery Option
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  deliveryType === 'delivery'
                    ? 'bg-brand-maroon text-[#FFFDF9] border-brand-maroon shadow-sm'
                    : 'bg-brand-surface text-stone-700 border-brand-border hover:border-brand-gold'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Home Delivery</span>
                </div>
                <div className={`text-[10px] ${deliveryType === 'delivery' ? 'text-brand-gold-light' : 'text-stone-500'}`}>
                  {subtotal >= 799 ? 'FREE (Orders > ₹799)' : '₹50 Standard'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  deliveryType === 'pickup'
                    ? 'bg-brand-maroon text-[#FFFDF9] border-brand-maroon shadow-sm'
                    : 'bg-brand-surface text-stone-700 border-brand-border hover:border-brand-gold'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Store className="w-3.5 h-3.5" />
                  <span>Store Pickup</span>
                </div>
                <div className={`text-[10px] ${deliveryType === 'pickup' ? 'text-brand-gold-light' : 'text-stone-500'}`}>
                  FREE at Kakinada
                </div>
              </button>
            </div>
          </div>

          {/* Coupon Code Applicator */}
          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-5 shadow-soft space-y-3">
            <h3 className="font-serif font-bold text-sm text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-gold" />
              <span>Apply Coupon</span>
            </h3>

            {appliedOffer ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900">{appliedOffer.code}</span>
                  <p className="text-[11px] text-emerald-700">{appliedOffer.title} ({appliedOffer.discount_percent}% off)</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="e.g. FESTIVE15, WELCOME10"
                  className="flex-1 bg-brand-surface text-xs uppercase text-brand-charcoal px-3 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                />
                <button
                  type="submit"
                  className="bg-brand-maroon text-brand-gold-light text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-gold hover:text-white transition-colors"
                >
                  Apply
                </button>
              </form>
            )}

            {couponMessage && (
              <p className={`text-xs font-medium ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                {couponMessage.text}
              </p>
            )}
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-base text-brand-charcoal pb-2 border-b border-brand-border">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-brand-charcoal">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>GST (5% Confectionery Tax)</span>
                <span>₹{taxAmount}</span>
              </div>

              <div className="pt-3 border-t border-brand-border flex justify-between items-baseline">
                <span className="font-serif font-bold text-base text-brand-charcoal">Grand Total</span>
                <span className="font-serif font-black text-2xl text-brand-maroon">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light py-4 rounded-2xl font-bold text-sm shadow-gold hover:scale-[1.02] transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Secure Checkout & Fresh Vacuum Packaging Guaranteed</span>
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

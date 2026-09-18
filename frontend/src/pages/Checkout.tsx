import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Store,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase, DEFAULT_SHOP_ID } from '../lib/supabase';
import { getProductImageUrl } from '../lib/storage';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, deliveryFee, discountAmount, taxAmount, totalAmount, deliveryType, clearCart } = useCart();
  const { user, profile } = useAuth();

  // Form State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Kakinada');
  const [state, setState] = useState('Andhra Pradesh');
  const [pincode, setPincode] = useState('533001');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'razorpay'>('cod');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Load user default address if available
  useEffect(() => {
    const loadAddress = async () => {
      if (user) {
        const { data } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .limit(1);

        if (data && data[0]) {
          const addr = data[0];
          setFullName(addr.full_name || fullName);
          setPhone(addr.phone || phone);
          setAddressLine1(addr.address_line1 || '');
          setAddressLine2(addr.address_line2 || '');
          setCity(addr.city || 'Kakinada');
          setState(addr.state || 'Andhra Pradesh');
          setPincode(addr.pincode || '533001');
        }
      }
    };
    loadAddress();
  }, [user]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const orderNumber = `KS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const shippingDetails = {
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        deliveryType,
      };

      // 1. Insert Order record into Supabase
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          shop_id: DEFAULT_SHOP_ID,
          user_id: user?.id || null,
          order_number: orderNumber,
          status: 'confirmed',
          total_amount: totalAmount,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          discount: discountAmount,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
          payment_method: paymentMethod,
          delivery_type: deliveryType,
          shipping_address: shippingDetails,
          customer_name: fullName,
          customer_email: email,
          customer_phone: phone,
          notes: orderNotes || null,
        })
        .select()
        .single();

      if (orderErr || !orderData) {
        throw new Error(orderErr?.message || 'Failed to initialize order');
      }

      // 2. Insert Order Items
      const orderItemsToInsert = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        price: item.unitPrice,
        quantity: item.quantity,
        weight: item.selectedWeight,
        subtotal: item.unitPrice * item.quantity,
        image_url: getProductImageUrl(item.product),
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsToInsert);
      if (itemsErr) {
        console.warn('Items insert note:', itemsErr.message);
      }

      // 3. Clear Cart & Navigate to Order Confirmation
      clearCart();
      navigate(`/order-confirmation/${orderData.id}`);
    } catch (err: any) {
      console.error('Order placement error:', err);
      setErrorMessage(err.message || 'Error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/cart" className="p-2 bg-[#FFFDF9] border border-brand-border rounded-xl text-stone-600 hover:text-brand-gold">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-charcoal">
            Secure Checkout
          </h1>
          <p className="text-xs text-stone-500">Complete your delivery and payment details</p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Delivery & Shipping Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Contact Details Card */}
          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-base text-brand-charcoal border-b border-brand-border pb-2">
              1. Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sridhar Sharma"
                  className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-stone-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address Card (Only if Home Delivery) */}
          {deliveryType === 'delivery' ? (
            <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4">
              <h3 className="font-serif font-bold text-base text-brand-charcoal border-b border-brand-border pb-2 flex items-center justify-between">
                <span>2. Delivery Address</span>
                <span className="text-xs text-stone-500 font-sans font-normal">Home Delivery</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-stone-700">Street Address / House No. *</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Flat / House No., Landmark, Street"
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-stone-700">Apartment / Area / Colony (Optional)</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Colony, Area or Floor"
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="533001"
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Special Delivery Instructions</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Ring bell, deliver in morning"
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/70 rounded-3xl border border-amber-200 p-6 space-y-2 text-xs">
              <h3 className="font-serif font-bold text-base text-amber-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-brand-gold" />
                <span>Store Pickup Details</span>
              </h3>
              <p className="text-stone-700">
                You have chosen to collect your fresh box directly from our main counter:
              </p>
              <div className="font-bold text-brand-maroon">
                Kotaiah Sweets, Main Bazaar Road, Kakinada, AP - 533001
              </div>
              <p className="text-stone-500 text-[11px]">
                Your box will be freshly packed and ready 30 minutes after placing this order.
              </p>
            </div>
          )}

          {/* Payment Method Card */}
          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-base text-brand-charcoal border-b border-brand-border pb-2">
              3. Payment Option
            </h3>

            <div className="space-y-2 text-xs">
              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'cod' ? 'bg-brand-surface border-brand-gold shadow-xs' : 'border-brand-border'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-brand-maroon"
                  />
                  <div className="flex items-center gap-2 font-bold text-brand-charcoal">
                    <Banknote className="w-4 h-4 text-brand-gold" />
                    <span>Cash on Delivery / Pay on Pickup</span>
                  </div>
                </div>
                <span className="text-[11px] text-stone-500">Pay when fresh sweets arrive</span>
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'upi' ? 'bg-brand-surface border-brand-gold shadow-xs' : 'border-brand-border'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="accent-brand-maroon"
                  />
                  <div className="flex items-center gap-2 font-bold text-brand-charcoal">
                    <Smartphone className="w-4 h-4 text-brand-gold" />
                    <span>Instant UPI (GPay / PhonePe / Paytm)</span>
                  </div>
                </div>
                <span className="text-[11px] text-stone-500">Instant QR & App Pay</span>
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'razorpay' ? 'bg-brand-surface border-brand-gold shadow-xs' : 'border-brand-border'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-brand-maroon"
                  />
                  <div className="flex items-center gap-2 font-bold text-brand-charcoal">
                    <CreditCard className="w-4 h-4 text-brand-gold" />
                    <span>Credit / Debit Cards / Net Banking</span>
                  </div>
                </div>
                <span className="text-[11px] text-stone-500">Secure Online Gateway</span>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Review & Final Submit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4 sticky top-24">
            <h3 className="font-serif font-bold text-base text-brand-charcoal border-b border-brand-border pb-2">
              Order Review ({cart.length} items)
            </h3>

            {/* Items Summary */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-brand-border/50 text-xs">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedWeight}`} className="pt-2 flex justify-between items-center gap-2">
                  <div>
                    <h4 className="font-serif font-bold text-brand-charcoal line-clamp-1">{item.product.name}</h4>
                    <span className="text-[11px] text-stone-500">
                      {item.quantity} x {item.selectedWeight} (₹{item.unitPrice})
                    </span>
                  </div>
                  <span className="font-bold text-brand-maroon font-serif">
                    ₹{item.unitPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-3 border-t border-brand-border">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-brand-charcoal">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>GST (5%)</span>
                <span>₹{taxAmount}</span>
              </div>

              <div className="pt-3 border-t border-brand-border flex justify-between items-baseline">
                <span className="font-serif font-bold text-base text-brand-charcoal">Total Amount</span>
                <span className="font-serif font-black text-2xl text-brand-maroon">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light py-4 rounded-2xl font-bold text-sm shadow-gold hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Confirming Order...' : `Place Order • ₹${totalAmount}`}</span>
            </button>

            <p className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tamper-Proof Packaging & Express Despatch</span>
            </p>
          </div>
        </div>

      </form>

    </div>
  );
};

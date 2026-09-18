import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Star,
  LogOut,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../lib/supabase';
import { getProductImageUrl, DEFAULT_FALLBACK_IMAGE } from '../lib/storage';
import { Order, CustomerAddress, Review } from '../types/database';

export const Account: React.FC = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { addToCart } = useCart();
  const { wishlistProducts, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'orders';

  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Edit State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  // New Address State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Kakinada');
  const [newAddrState, setNewAddrState] = useState('Andhra Pradesh');
  const [newAddrPincode, setNewAddrPincode] = useState('533001');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');

    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch Orders
        const { data: ords } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (ords) setOrders(ords as Order[]);

        // Fetch Addresses
        const { data: addrs } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id);
        if (addrs) setAddresses(addrs as CustomerAddress[]);

        // Fetch Reviews
        const { data: revs } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (revs) setMyReviews(revs as Review[]);
      } catch (err) {
        console.error('Error fetching account data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        phone: phone,
        updated_at: new Date().toISOString(),
      });

      if (!error) {
        setProfileMsg('Profile updated successfully!');
        await refreshProfile();
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err: any) {
      setProfileMsg('Failed to update profile.');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: fullName || 'Customer',
          phone: phone || '',
          address_line1: newAddrLine1,
          city: newAddrCity,
          state: newAddrState,
          pincode: newAddrPincode,
          is_default: addresses.length === 0,
        })
        .select()
        .single();

      if (!error && data) {
        setAddresses((prev) => [...prev, data as CustomerAddress]);
        setShowAddAddress(false);
        setNewAddrLine1('');
      }
    } catch (err) {
      console.error('Add address error:', err);
    }
  };

  const handleReorder = (order: Order) => {
    order.order_items?.forEach((item) => {
      addToCart(
        {
          id: item.product_id || '',
          shop_id: order.shop_id,
          name: item.product_name,
          slug: '',
          description: '',
          price: item.price,
          weight: item.weight,
          stock: 50,
          is_available: true,
          is_featured: false,
          rating: 5,
          review_count: 0,
          created_at: '',
          updated_at: '',
        },
        item.quantity,
        item.weight
      );
    });
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Account Hero Banner */}
      <div className="bg-brand-warm-gradient rounded-3xl p-6 sm:p-8 border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-maroon to-brand-maroon-dark text-brand-gold-light border-2 border-brand-gold flex items-center justify-center font-serif text-2xl font-bold shadow-gold">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="font-serif font-black text-2xl text-brand-charcoal">
              {profile?.full_name || 'Valued Customer'}
            </h1>
            <p className="text-xs text-stone-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-brand-surface text-brand-maroon text-[10px] font-bold uppercase rounded-md border border-brand-border">
              {profile?.role || 'Customer'}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors border border-rose-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Account Tabs & Views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Tab Navigation */}
        <div className="lg:col-span-3 space-y-1 bg-[#FFFDF9] rounded-2xl border border-brand-border p-3 shadow-soft">
          {[
            { key: 'orders', label: 'My Orders', icon: ShoppingBag, count: orders.length },
            { key: 'wishlist', label: 'My Wishlist', icon: Heart, count: wishlistProducts.length },
            { key: 'addresses', label: 'Saved Addresses', icon: MapPin, count: addresses.length },
            { key: 'reviews', label: 'My Reviews', icon: Star, count: myReviews.length },
            { key: 'profile', label: 'Profile Settings', icon: User },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;

            return (
              <button
                key={t.key}
                onClick={() => setSearchParams({ tab: t.key })}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-maroon text-brand-gold-light shadow-xs'
                    : 'text-stone-600 hover:bg-brand-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </div>
                {t.count !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-brand-maroon-dark text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Tab Content Area */}
        <div className="lg:col-span-9">
          
          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-xl text-brand-charcoal">Order History</h2>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-brand-border/60">
                        <div>
                          <span className="font-mono font-bold text-xs text-brand-gold-dark">
                            #{ord.order_number}
                          </span>
                          <div className="text-[11px] text-stone-500">
                            Placed on {new Date(ord.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                          <Link
                            to={`/order-confirmation/${ord.id}`}
                            className="text-xs text-brand-maroon font-semibold hover:underline"
                          >
                            View Receipt
                          </Link>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 text-xs">
                        {ord.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-stone-700">
                            <span>{item.quantity} x {item.product_name} ({item.weight})</span>
                            <span className="font-serif font-bold text-brand-maroon">₹{item.subtotal}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-500">Total Paid: </span>
                          <span className="font-serif font-black text-base text-brand-maroon">
                            ₹{ord.total_amount}
                          </span>
                        </div>

                        <button
                          onClick={() => handleReorder(ord)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-surface border border-brand-border hover:border-brand-gold rounded-xl text-xs font-bold text-brand-charcoal transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Re-order Items</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-12 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-xs text-stone-500">You have not placed any orders yet.</p>
                  <Link
                    to="/products"
                    className="inline-block bg-brand-maroon text-brand-gold-light text-xs font-bold px-5 py-2.5 rounded-xl"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-xl text-brand-charcoal">My Saved Sweets</h2>

              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => {
                    const primaryImg = getProductImageUrl(p);

                    return (
                      <div
                        key={p.id}
                        className="bg-[#FFFDF9] rounded-2xl border border-brand-border p-4 shadow-soft flex gap-4 items-center justify-between"
                      >
                        <img
                          src={primaryImg}
                          alt={p.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                          }}
                          className="w-16 h-16 object-cover rounded-xl bg-brand-surface"
                        />

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${p.id}`}
                            className="font-serif font-bold text-xs text-brand-charcoal hover:text-brand-gold truncate block"
                          >
                            {p.name}
                          </Link>
                          <div className="font-bold text-xs text-brand-maroon mt-0.5">₹{p.price}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => addToCart(p, 1, p.weight || '500g')}
                            className="p-2 bg-brand-maroon text-brand-gold-light rounded-xl hover:bg-brand-gold transition-colors text-xs font-bold"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleWishlist(p)}
                            className="p-2 text-stone-400 hover:text-rose-600 rounded-xl transition-colors"
                            title="Remove from Wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-12 text-center space-y-3">
                  <Heart className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-xs text-stone-500">Your wishlist is currently empty.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-xl text-brand-charcoal">Saved Delivery Addresses</h2>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-maroon text-brand-gold-light rounded-xl text-xs font-bold hover:bg-brand-gold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-3 text-xs">
                  <h3 className="font-serif font-bold text-sm text-brand-charcoal">New Address Details</h3>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newAddrLine1}
                      onChange={(e) => setNewAddrLine1(e.target.value)}
                      placeholder="House/Flat No., Street, Landmark"
                      className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={newAddrCity}
                      onChange={(e) => setNewAddrCity(e.target.value)}
                      placeholder="City"
                      className="bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                    />
                    <input
                      type="text"
                      required
                      value={newAddrState}
                      onChange={(e) => setNewAddrState(e.target.value)}
                      placeholder="State"
                      className="bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                    />
                    <input
                      type="text"
                      required
                      value={newAddrPincode}
                      onChange={(e) => setNewAddrPincode(e.target.value)}
                      placeholder="Pincode"
                      className="bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-maroon text-brand-gold-light px-5 py-2 rounded-xl text-xs font-bold"
                  >
                    Save Address
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-[#FFFDF9] rounded-2xl border border-brand-border p-4 shadow-soft space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-brand-charcoal">{addr.full_name}</span>
                      {addr.is_default && (
                        <span className="text-[10px] bg-brand-cream text-brand-maroon px-2 py-0.5 rounded font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-stone-600">
                      {addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4 max-w-xl">
              <h2 className="font-serif font-bold text-xl text-brand-charcoal">Profile Settings</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-stone-100 text-stone-500 p-2.5 rounded-xl border border-brand-border cursor-not-allowed"
                  />
                </div>

                {profileMsg && <p className="text-xs font-semibold text-emerald-700">{profileMsg}</p>}

                <button
                  type="submit"
                  className="bg-brand-maroon text-brand-gold-light px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-gold transition-colors"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

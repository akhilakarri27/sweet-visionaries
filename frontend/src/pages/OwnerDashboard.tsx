import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  Gift,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
  RefreshCw,
  Upload,
  Layers,
  Star,
  Settings,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase, DEFAULT_SHOP_ID, BACKEND_URL } from '../lib/supabase';
import { getProductImageUrl, uploadProductSweetImage, DEFAULT_FALLBACK_IMAGE } from '../lib/storage';
import { Product, Order, Category, Offer, Review } from '../types/database';

export const OwnerDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'reviews' | 'offers' | 'rag'
  >('overview');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(300);
  const [prodWeight, setProdWeight] = useState('500g');
  const [prodStock, setProdStock] = useState(50);
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodIngredients, setProdIngredients] = useState('');
  const [prodTaste, setProdTaste] = useState('');
  const [prodShelfLife, setProdShelfLife] = useState('15 Days from packing date.');
  const [prodStorage, setProdStorage] = useState('Store in an airtight container at room temperature.');
  const [prodIsAvailable, setProdIsAvailable] = useState(true);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // RAG Sync State
  const [isSyncingRAG, setIsSyncingRAG] = useState(false);
  const [ragSyncResult, setRagSyncResult] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Products
      const { data: prodData } = await supabase
        .from('products')
        .select('*, categories(name), product_images(*)')
        .eq('shop_id', DEFAULT_SHOP_ID)
        .order('created_at', { ascending: false });
      if (prodData) setProducts(prodData as Product[]);

      // Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('shop_id', DEFAULT_SHOP_ID)
        .order('display_order');
      if (catData) setCategories(catData as Category[]);

      // Orders
      const { data: ordData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('shop_id', DEFAULT_SHOP_ID)
        .order('created_at', { ascending: false });
      if (ordData) setOrders(ordData as Order[]);

      // Offers
      const { data: offData } = await supabase
        .from('offers')
        .select('*')
        .eq('shop_id', DEFAULT_SHOP_ID);
      if (offData) setOffers(offData as Offer[]);

      // Reviews
      const { data: revData } = await supabase
        .from('reviews')
        .select('*')
        .eq('shop_id', DEFAULT_SHOP_ID)
        .order('created_at', { ascending: false });
      if (revData) setReviews(revData as Review[]);
    } catch (err) {
      console.error('Owner dashboard data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Aggregate Metrics
  const totalSales = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const todaySales = orders
    .filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  const lowStockItems = products.filter((p) => p.stock <= 10).length;

  // Recharts Data
  const salesChartData = [
    { day: 'Mon', sales: 4200 },
    { day: 'Tue', sales: 5800 },
    { day: 'Wed', sales: 7100 },
    { day: 'Thu', sales: 6400 },
    { day: 'Fri', sales: 9800 },
    { day: 'Sat', sales: 14500 },
    { day: 'Sun', sales: 18200 },
  ];

  const categoryRevenueData = [
    { name: 'Kaja Specials', value: 45 },
    { name: 'Traditional', value: 25 },
    { name: 'Dry Fruit', value: 15 },
    { name: 'Savouries', value: 15 },
  ];
  const COLORS = ['#881337', '#D97706', '#CA8A04', '#78716C'];

  // Helper to open Add Product Modal with clean state
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice(300);
    setProdWeight('500g');
    setProdStock(50);
    setProdCategoryId(categories[0]?.id || '');
    setProdDescription('');
    setProdIngredients('');
    setProdTaste('');
    setProdShelfLife('15 Days from packing date.');
    setProdStorage('Store in an airtight container at room temperature.');
    setProdIsAvailable(true);
    setProdIsFeatured(false);
    setProdImageUrl('');
    setUploadError(null);
    setUploadSuccess(null);
    setShowProductModal(true);
  };

  // Helper to open Edit Product Modal
  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdWeight(p.weight || '500g');
    setProdStock(p.stock);
    setProdCategoryId(p.category_id || '');
    setProdDescription(p.description || '');
    setProdIngredients(p.ingredients || '');
    setProdTaste(p.taste_profile || '');
    setProdShelfLife(p.shelf_life || '15 Days from packing date.');
    setProdStorage(p.storage_instructions || 'Store in an airtight container at room temperature.');
    setProdIsAvailable(p.is_available !== false);
    setProdIsFeatured(Boolean(p.is_featured));
    setProdImageUrl(getProductImageUrl(p));
    setUploadError(null);
    setUploadSuccess(null);
    setShowProductModal(true);
  };

  // Handle Image Upload directly to Supabase Storage (sweets/<slug>.<ext>)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const derivedSlug =
        editingProduct?.slug ||
        prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
        'sweet-delicacy';

      const res = await uploadProductSweetImage(file, derivedSlug, editingProduct?.id);

      if (!res.success || !res.publicUrl) {
        throw new Error(res.error || 'Failed to upload image to Supabase Storage.');
      }

      setProdImageUrl(res.publicUrl);
      setUploadSuccess(`Image successfully uploaded to Supabase Storage (${res.storagePath})!`);

      // If we are editing an existing product, update local state immediately
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, image_url: res.publicUrl } : p
          )
        );
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Product Save (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (editingProduct) {
        // Update product in Supabase
        const { error } = await supabase
          .from('products')
          .update({
            name: prodName,
            slug,
            image_url: prodImageUrl || undefined,
            price: prodPrice,
            weight: prodWeight,
            stock: prodStock,
            category_id: prodCategoryId || null,
            description: prodDescription,
            ingredients: prodIngredients,
            taste_profile: prodTaste,
            shelf_life: prodShelfLife,
            storage_instructions: prodStorage,
            is_available: prodIsAvailable,
            is_featured: prodIsFeatured,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProduct.id);

        if (!error && prodImageUrl) {
          await supabase.from('product_images').upsert({
            product_id: editingProduct.id,
            image_url: prodImageUrl,
            alt_text: prodName,
            is_primary: true,
          });
        }
      } else {
        // Insert new product in Supabase
        const { data: newProd, error } = await supabase
          .from('products')
          .insert({
            shop_id: DEFAULT_SHOP_ID,
            category_id: prodCategoryId || null,
            name: prodName,
            slug,
            image_url: prodImageUrl || undefined,
            price: prodPrice,
            weight: prodWeight,
            stock: prodStock,
            description: prodDescription,
            ingredients: prodIngredients,
            taste_profile: prodTaste,
            shelf_life: prodShelfLife,
            storage_instructions: prodStorage,
            is_available: prodIsAvailable,
            is_featured: prodIsFeatured,
          })
          .select()
          .single();

        if (!error && newProd && prodImageUrl) {
          await supabase.from('product_images').insert({
            product_id: newProd.id,
            image_url: prodImageUrl,
            alt_text: prodName,
            is_primary: true,
          });
        }
      }

      setShowProductModal(false);
      setEditingProduct(null);
      await loadDashboardData();
    } catch (err: any) {
      console.error('Product save error:', err);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  // Trigger RAG Embeddings Sync via Secure Backend
  const handleSyncRAG = async () => {
    setIsSyncingRAG(true);
    setRagSyncResult(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/rag/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: DEFAULT_SHOP_ID }),
      });

      const json = await response.json();
      if (json.success) {
        setRagSyncResult(`Success! Indexed ${json.indexed} product documents into pgvector.`);
      } else {
        setRagSyncResult(`Notice: ${json.error || 'Sync completed with fallback'}`);
      }
    } catch (err: any) {
      setRagSyncResult(`Backend sync response: ${err.message}`);
    } finally {
      setIsSyncingRAG(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Header */}
      <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-brand-gold-light flex items-center justify-center font-serif text-xl font-bold shadow-soft">
            KS
          </div>
          <div>
            <h1 className="font-serif font-black text-2xl text-brand-charcoal flex items-center gap-2">
              <span>Shop Owner Dashboard</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-sans font-bold">
                Live Store
              </span>
            </h1>
            <p className="text-xs text-stone-500">Kotaiah Sweets, Kakinada • Store Management & Hybrid RAG</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncRAG}
            disabled={isSyncingRAG}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-surface border border-brand-gold text-brand-maroon hover:bg-brand-gold hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-brand-gold ${isSyncingRAG ? 'animate-spin' : ''}`} />
            <span>{isSyncingRAG ? 'Syncing pgvector...' : 'Sync AI Knowledge Base'}</span>
          </button>

          <button
            onClick={openAddProductModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-maroon text-brand-gold-light hover:bg-brand-maroon-dark rounded-xl text-xs font-bold transition-all shadow-soft"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sweet / Savoury</span>
          </button>
        </div>
      </div>

      {ragSyncResult && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-gold shrink-0" />
          <span>{ragSyncResult}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-border overflow-x-auto gap-2 text-xs font-serif font-bold">
        {[
          { key: 'overview', label: 'Store Overview', icon: BarChart3 },
          { key: 'products', label: `Products (${products.length})`, icon: Package },
          { key: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { key: 'categories', label: `Categories (${categories.length})`, icon: Layers },
          { key: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
          { key: 'offers', label: `Offers (${offers.length})`, icon: Gift },
          { key: 'rag', label: 'pgvector RAG Status', icon: Sparkles },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-brand-maroon text-brand-maroon bg-brand-cream/60 rounded-t-xl'
                  : 'border-transparent text-stone-500 hover:text-brand-charcoal'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-brand-border shadow-soft space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Today's Sales</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-serif font-black text-2xl text-brand-maroon">₹{todaySales}</div>
              <div className="text-[10px] text-stone-400">Total Store Revenue: ₹{totalSales}</div>
            </div>

            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-brand-border shadow-soft space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-brand-gold" />
              </div>
              <div className="font-serif font-black text-2xl text-brand-charcoal">{orders.length}</div>
              <div className="text-[10px] text-amber-700 font-bold">{pendingOrders} pending despatch</div>
            </div>

            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-brand-border shadow-soft space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Active Products</span>
                <Package className="w-4 h-4 text-brand-gold-dark" />
              </div>
              <div className="font-serif font-black text-2xl text-brand-charcoal">{products.length}</div>
              <div className="text-[10px] text-stone-500">Across {categories.length} categories</div>
            </div>

            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-brand-border shadow-soft space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Stock Alerts</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="font-serif font-black text-2xl text-amber-700">{lowStockItems}</div>
              <div className="text-[10px] text-stone-500">Products with ≤ 10 units</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sales Trend Chart */}
            <div className="lg:col-span-8 bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4">
              <h3 className="font-serif font-bold text-base text-brand-charcoal">
                Weekly Sales Trend (₹)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#881337" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#881337" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#78716C" fontSize={11} />
                    <YAxis stroke="#78716C" fontSize={11} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stroke="#881337" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue By Category */}
            <div className="lg:col-span-4 bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4">
              <h3 className="font-serif font-bold text-base text-brand-charcoal">
                Sales by Category
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryRevenueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryRevenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl text-brand-charcoal">Product Catalogue Inventory</h2>
            <button
              onClick={openAddProductModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-maroon text-brand-gold-light rounded-xl text-xs font-bold shadow-soft hover:bg-brand-maroon-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border overflow-hidden shadow-soft">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface border-b border-brand-border font-serif text-brand-charcoal uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {products.map((p) => {
                  const img = getProductImageUrl(p);
                  return (
                    <tr key={p.id} className="hover:bg-brand-cream/40 transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={img}
                          alt={p.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                          }}
                          className="w-10 h-10 object-cover rounded-lg bg-brand-surface border border-brand-border/60"
                        />
                        <div>
                          <div className="font-bold text-brand-charcoal">{p.name}</div>
                          <div className="text-[10px] text-stone-500">{p.weight}</div>
                        </div>
                      </td>
                      <td className="p-3 text-stone-600">{p.categories?.name || 'Traditional'}</td>
                      <td className="p-3 font-serif font-bold text-brand-maroon">₹{p.price}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          p.stock <= 10 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="p-3 font-bold text-amber-700">★ {Number(p.rating || 5).toFixed(1)}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-1.5 text-stone-500 hover:text-brand-gold rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-brand-charcoal">Customer Orders Management</h2>

          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border overflow-hidden shadow-soft">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface border-b border-brand-border font-serif text-brand-charcoal uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-brand-cream/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-gold-dark">{o.order_number}</td>
                    <td className="p-3">
                      <div className="font-bold text-brand-charcoal">{o.customer_name}</div>
                      <div className="text-[10px] text-stone-500">{o.customer_phone}</div>
                    </td>
                    <td className="p-3 text-stone-600">{o.order_items?.length || 1} items</td>
                    <td className="p-3 font-serif font-bold text-brand-maroon">₹{o.total_amount}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-brand-surface text-brand-maroon">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="bg-brand-surface text-xs font-semibold py-1 px-2 rounded-lg border border-brand-border focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: RAG KNOWLEDGE BASE STATUS */}
      {activeTab === 'rag' && (
        <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-xl text-brand-charcoal">
                xAI & pgvector Knowledge Base Status
              </h2>
              <p className="text-xs text-stone-500">
                Synchronize structured product information into pgvector embeddings for the Grok 4.6 AI Shopping Assistant
              </p>
            </div>

            <button
              onClick={handleSyncRAG}
              disabled={isSyncingRAG}
              className="bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light px-5 py-2.5 rounded-xl font-bold text-xs shadow-soft hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSyncingRAG ? 'Generating Embeddings...' : 'Sync All Products'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border">
              <span className="text-stone-500">Total Products in Database</span>
              <div className="font-serif font-bold text-xl text-brand-charcoal mt-1">{products.length} Items</div>
            </div>
            <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border">
              <span className="text-stone-500">Vector Search RPC Function</span>
              <div className="font-mono font-bold text-xs text-emerald-700 mt-1">match_rag_documents()</div>
            </div>
            <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border">
              <span className="text-stone-500">LLM Generation Model</span>
              <div className="font-serif font-bold text-xs text-brand-maroon mt-1">xAI Grok 4.6 (Grounded)</div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border max-w-xl w-full p-6 shadow-card space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-brand-border pb-3">
              <h3 className="font-serif font-bold text-lg text-brand-charcoal">
                {editingProduct ? 'Edit Sweet Record' : 'Add New Indian Sweet'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Sweet Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Kakinada Gottam Kaja (Pure Ghee)"
                  className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Weight *</label>
                  <input
                    type="text"
                    required
                    value={prodWeight}
                    onChange={(e) => setProdWeight(e.target.value)}
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Stock Units *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Category</label>
                <select
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Description</label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Authentic Andhra delicacy description..."
                  className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Ingredients</label>
                  <input
                    type="text"
                    value={prodIngredients}
                    onChange={(e) => setProdIngredients(e.target.value)}
                    placeholder="Pure Ghee, Maida, Cardamom, Sugar"
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Taste Profile</label>
                  <input
                    type="text"
                    value={prodTaste}
                    onChange={(e) => setProdTaste(e.target.value)}
                    placeholder="Crispy outer shell with warm syrupy center"
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Shelf Life</label>
                  <input
                    type="text"
                    value={prodShelfLife}
                    onChange={(e) => setProdShelfLife(e.target.value)}
                    placeholder="15 Days from packing date."
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Storage Instructions</label>
                  <input
                    type="text"
                    value={prodStorage}
                    onChange={(e) => setProdStorage(e.target.value)}
                    placeholder="Store in an airtight container..."
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsAvailable}
                    onChange={(e) => setProdIsAvailable(e.target.checked)}
                    className="rounded accent-brand-maroon"
                  />
                  <span className="font-semibold text-stone-700">Active / In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="rounded accent-brand-maroon"
                  />
                  <span className="font-semibold text-stone-700">Mark as Festive Bestseller</span>
                </label>
              </div>

              <div className="space-y-2 pt-1 border-t border-brand-border/60">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-700">
                    Product Image (Supabase Storage: <span className="font-mono text-stone-500">product-images/sweets/&lt;slug&gt;.jpg</span>)
                  </label>
                  {prodName && (
                    <span className="text-[10px] text-stone-400 font-mono">
                      Target: sweets/{editingProduct?.slug || prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'item'}.jpg
                    </span>
                  )}
                </div>

                {/* Upload Status Alerts */}
                {uploadingImage && (
                  <div className="p-2.5 bg-brand-surface border border-brand-gold/50 rounded-xl text-brand-maroon flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-gold" />
                    <span>Uploading image to Supabase Storage and syncing record...</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="line-clamp-1">{uploadSuccess}</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Live Image Preview & Direct Upload Area */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* Preview Thumbnail */}
                  <div className="h-24 rounded-xl border border-brand-border bg-stone-50 overflow-hidden flex items-center justify-center relative group">
                    {prodImageUrl ? (
                      <>
                        <img
                          src={prodImageUrl}
                          alt="Preview"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setProdImageUrl('')}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-stone-400 text-center px-2">No image selected</span>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex gap-2">
                      <label className="flex-1 bg-brand-surface border-2 border-dashed border-brand-border hover:border-brand-gold py-2 px-3 rounded-xl font-bold text-stone-700 hover:text-brand-maroon cursor-pointer flex items-center justify-center gap-2 transition-all">
                        <Upload className="w-4 h-4 text-brand-gold" />
                        <span>{uploadingImage ? 'Uploading...' : 'Choose Image to Upload'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploadingImage}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={prodImageUrl}
                        onChange={(e) => setProdImageUrl(e.target.value)}
                        placeholder="Supabase Storage public URL auto-generated..."
                        className="flex-1 bg-brand-surface p-2 rounded-lg border border-brand-border text-[11px] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-stone-100 rounded-xl text-stone-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-maroon text-brand-gold-light rounded-xl font-bold shadow-soft hover:bg-brand-gold transition-colors"
                >
                  Save Product Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

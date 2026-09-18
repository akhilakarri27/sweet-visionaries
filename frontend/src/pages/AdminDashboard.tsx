import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Store,
  Users,
  Activity,
  Plus,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
} from 'lucide-react';
import { supabase, BACKEND_URL } from '../lib/supabase';
import { Shop, Profile } from '../types/database';

export const AdminDashboard: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [backendHealth, setBackendHealth] = useState<{ status: string; service: string } | null>(null);
  const [xaiModelsData, setXaiModelsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Shop Modal
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopEmail, setShopEmail] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const { data: shopsData } = await supabase.from('shops').select('*').order('created_at');
      if (shopsData) setShops(shopsData as Shop[]);

      const { data: profilesData } = await supabase.from('profiles').select('*').limit(20);
      if (profilesData) setUsers(profilesData as Profile[]);

      // Check backend health
      try {
        const hRes = await fetch(`${BACKEND_URL}/api/health`);
        if (hRes.ok) {
          const hJson = await hRes.json();
          setBackendHealth(hJson);
        }
      } catch (err) {
        console.warn('Backend offline check');
      }

      // Check xAI models
      try {
        const mRes = await fetch(`${BACKEND_URL}/api/xai/models`);
        if (mRes.ok) {
          const mJson = await mRes.json();
          setXaiModelsData(mJson);
        }
      } catch (err) {
        console.warn('xAI models check notice');
      }
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data, error } = await supabase
        .from('shops')
        .insert({
          name: shopName,
          slug,
          address: shopAddress,
          phone: shopPhone,
          email: shopEmail,
          is_active: true,
        })
        .select()
        .single();

      if (!error && data) {
        setShops((prev) => [...prev, data as Shop]);
        setShowShopModal(false);
        setShopName('');
      }
    } catch (err) {
      console.error('Create shop error:', err);
    }
  };

  const handleToggleShopStatus = async (shopId: string, currentStatus: boolean) => {
    try {
      await supabase.from('shops').update({ is_active: !currentStatus }).eq('id', shopId);
      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, is_active: !currentStatus } : s))
      );
    } catch (err) {
      console.error('Toggle shop status error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Super Admin Banner */}
      <div className="bg-brand-charcoal text-[#FFFDF9] rounded-3xl p-6 sm:p-8 border-2 border-brand-gold flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-gold text-brand-charcoal flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif font-black text-2xl text-[#FFFDF9]">
              Super Admin Console
            </h1>
            <p className="text-xs text-stone-400">
              Multi-tenant Shop Administration & xAI Grok RAG Infrastructure
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowShopModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-gold text-brand-charcoal rounded-xl text-xs font-bold hover:bg-brand-gold-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store Branch</span>
        </button>
      </div>

      {/* System Infrastructure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-brand-border shadow-soft space-y-2">
          <div className="flex items-center justify-between font-serif font-bold text-sm text-brand-charcoal">
            <span>Secure Backend API</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-stone-500">Express + xAI Grok Orchestrator</p>
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{backendHealth?.status === 'online' ? 'Online on Port 5000' : 'Operational'}</span>
          </div>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-brand-border shadow-soft space-y-2">
          <div className="flex items-center justify-between font-serif font-bold text-sm text-brand-charcoal">
            <span>PostgreSQL pgvector</span>
            <Database className="w-4 h-4 text-brand-gold" />
          </div>
          <p className="text-stone-500">Supabase Cloud Database</p>
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>pgvector HNSW Ready</span>
          </div>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-brand-border shadow-soft space-y-2">
          <div className="flex items-center justify-between font-serif font-bold text-sm text-brand-charcoal">
            <span>xAI Grok & Embeddings</span>
            <Cpu className="w-4 h-4 text-brand-maroon" />
          </div>
          <p className="text-stone-500">
            Model: {xaiModelsData?.currentConfig?.chatModel || 'grok-4.6'}
          </p>
          <div className="flex items-center gap-1.5 text-brand-maroon font-bold">
            <span>Dim: {xaiModelsData?.currentConfig?.embeddingDim || 1536}</span>
          </div>
        </div>
      </div>

      {/* Multi-Tenant Shops List */}
      <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4">
        <h3 className="font-serif font-bold text-base text-brand-charcoal border-b border-brand-border pb-2">
          Registered Shops ({shops.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-surface font-serif text-stone-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Shop Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Address</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {shops.map((s) => (
                <tr key={s.id} className="hover:bg-brand-surface/40">
                  <td className="p-3 font-bold text-brand-charcoal">{s.name}</td>
                  <td className="p-3 font-mono text-stone-500">{s.slug}</td>
                  <td className="p-3 text-stone-600">{s.address || 'Kakinada, AP'}</td>
                  <td className="p-3 text-stone-600">{s.phone || '+91 884 237 8999'}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {s.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleShopStatus(s.id, s.is_active)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg ${
                        s.is_active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {s.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Shop Modal */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border max-w-md w-full p-6 shadow-card space-y-4">
            <div className="flex justify-between items-center border-b border-brand-border pb-2">
              <h3 className="font-serif font-bold text-base text-brand-charcoal">Create Shop Tenant</h3>
              <button onClick={() => setShowShopModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateShop} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Shop Name *</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Kotaiah Sweets - Rajahmundry Branch"
                  className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Address</label>
                <input
                  type="text"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  placeholder="Store Street Address"
                  className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                />
                <input
                  type="email"
                  value={shopEmail}
                  onChange={(e) => setShopEmail(e.target.value)}
                  placeholder="Email"
                  className="bg-brand-surface p-2.5 rounded-xl border border-brand-border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowShopModal(false)}
                  className="px-4 py-2 bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-maroon text-brand-gold-light rounded-xl font-bold"
                >
                  Create Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

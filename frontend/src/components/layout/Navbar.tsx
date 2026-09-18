import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Sparkles,
  Store,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types/database';

interface NavbarProps {
  onOpenChatbot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChatbot }) => {
  const { user, profile, role, signOut } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Fetch categories for navbar navigation
    const fetchCats = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (data) setCategories(data as Category[]);
    };
    fetchCats();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Top Heritage Notice Bar */}
      <div className="bg-brand-primary text-white py-1.5 px-4 text-xs font-medium text-center flex items-center justify-center gap-2 tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-brand-gold-light animate-pulse" />
        <span>Authentic Andhra Sweets & Legendary Kakinada Gottam Kaja • Free Express Delivery on orders over ₹799!</span>
        <Sparkles className="w-3.5 h-3.5 text-brand-gold-light animate-pulse hidden sm:inline" />
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-panel shadow-soft py-3'
            : location.pathname === '/'
              ? 'bg-stone-950/85 backdrop-blur-md border-b border-brand-gold/30 text-white py-3.5'
              : 'bg-white/95 backdrop-blur-md border-b border-brand-border py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-primary to-brand-primary-hover flex items-center justify-center shadow-primary border-2 border-brand-gold-light transition-transform duration-300 group-hover:scale-105">
                <span className="text-white font-serif font-bold text-xl tracking-wider">K</span>
              </div>
              <div className="flex flex-col">
                <span className={`font-serif font-black text-2xl tracking-tight leading-none ${
                  !isScrolled && location.pathname === '/' ? 'text-white' : 'text-brand-primary'
                }`}>
                  KOTAIAH<span className="text-brand-gold"> SWEETS</span>
                </span>
                <span className={`text-[10px] tracking-widest uppercase font-bold mt-0.5 ${
                  !isScrolled && location.pathname === '/' ? 'text-stone-300' : 'text-brand-muted'
                }`}>
                  Since 1900 • Kakinada
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className={`hidden lg:flex items-center gap-6 font-medium text-sm ${
              !isScrolled && location.pathname === '/' ? 'text-stone-200' : 'text-brand-charcoal'
            }`}>
              <Link
                to="/"
                className={`transition-colors hover:text-brand-primary ${
                  location.pathname === '/' ? 'text-brand-primary font-bold' : ''
                }`}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`transition-colors hover:text-brand-primary ${
                  location.pathname === '/products' ? 'text-brand-primary font-semibold' : ''
                }`}
              >
                All Sweets
              </Link>

              {/* Categories Link */}
              <div className="relative group py-2">
                <Link
                  to="/products"
                  className="flex items-center gap-1 transition-colors hover:text-brand-primary"
                >
                  Categories <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-0 hidden group-hover:block w-56 bg-white rounded-xl shadow-card border border-brand-border p-2 z-50 animate-in fade-in duration-200 text-brand-charcoal">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      className="block px-3 py-2 text-xs font-medium text-brand-charcoal hover:bg-brand-light-orange hover:text-brand-primary rounded-lg transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/offers"
                className="transition-colors hover:text-brand-primary font-semibold flex items-center gap-1 text-brand-primary"
              >
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping inline-block" />
                Offers
              </Link>
              <Link to="/about" className="transition-colors hover:text-brand-primary">
                Heritage
              </Link>
              <Link to="/reviews" className="transition-colors hover:text-brand-primary">
                Reviews
              </Link>
              <Link to="/contact" className="transition-colors hover:text-brand-primary">
                Contact
              </Link>
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative flex-1 max-w-xs mx-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Gottam Kaja, Mysore Pak..."
                className={`w-full text-xs pl-9 pr-4 py-2 rounded-full border transition-all ${
                  !isScrolled && location.pathname === '/'
                    ? 'bg-stone-900/90 text-white placeholder:text-stone-400 border-stone-700 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
                    : 'bg-brand-light-orange text-brand-charcoal border-brand-border focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
                }`}
              />
              <Search className={`w-4 h-4 absolute left-3 top-2.5 pointer-events-none ${
                !isScrolled && location.pathname === '/' ? 'text-stone-400' : 'text-brand-muted'
              }`} />
            </form>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* AI Assistant Launcher Button */}
              {onOpenChatbot && (
                <button
                  onClick={onOpenChatbot}
                  className="hidden sm:flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-primary transition-all border border-brand-gold/40 hover:scale-105"
                  title="Open AI Shopping Assistant"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold-light" />
                  <span>Ask AI Assistant</span>
                </button>
              )}

              {/* Wishlist Link */}
              <Link
                to="/account?tab=wishlist"
                className={`relative p-2 hover:text-brand-primary transition-colors ${
                  !isScrolled && location.pathname === '/' ? 'text-stone-200' : 'text-brand-charcoal'
                }`}
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Cart Link */}
              <Link
                to="/cart"
                className={`relative p-2 hover:text-brand-primary transition-colors ${
                  !isScrolled && location.pathname === '/' ? 'text-stone-200' : 'text-brand-charcoal'
                }`}
                title="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce shadow-xs">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              {/* User Account / Auth Dropdown */}
              <div className="relative">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-1 p-1.5 rounded-full border border-brand-border hover:border-brand-primary transition-all bg-brand-light-orange"
                    >
                      <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold font-serif shadow-xs">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-brand-border p-2 z-50 animate-in fade-in duration-150 text-brand-charcoal">
                        <div className="px-3 py-2 border-b border-brand-border/60">
                          <p className="text-xs font-semibold text-brand-charcoal truncate">
                            {profile?.full_name || 'Valued Customer'}
                          </p>
                          <p className="text-[10px] text-brand-muted truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-brand-light-orange text-brand-primary text-[9px] font-bold uppercase rounded">
                            {role}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/account"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-brand-charcoal hover:bg-brand-light-orange hover:text-brand-primary rounded-lg transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-brand-primary" />
                            My Account & Orders
                          </Link>

                          {(role === 'shop_owner' || role === 'staff' || role === 'super_admin') && (
                            <Link
                              to="/owner"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-brand-primary font-semibold hover:bg-brand-light-orange rounded-lg transition-colors"
                            >
                              <Store className="w-3.5 h-3.5 text-brand-primary" />
                              Shop Owner Portal
                            </Link>
                          )}

                          {role === 'super_admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-brand-gold-dark font-semibold hover:bg-brand-light-orange rounded-lg transition-colors"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                              Super Admin Console
                            </Link>
                          )}

                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className={`flex items-center gap-1.5 border px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      !isScrolled && location.pathname === '/'
                        ? 'bg-brand-primary text-white border-brand-primary hover:bg-brand-primary-hover font-bold shadow-primary'
                        : 'bg-brand-primary text-white border-brand-primary hover:bg-brand-primary-hover shadow-xs'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 hover:text-brand-primary ${
                  !isScrolled && location.pathname === '/' ? 'text-stone-200' : 'text-brand-charcoal'
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-brand-border pt-4 animate-in fade-in">
              <form onSubmit={handleSearchSubmit} className="mb-4 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sweets & savouries..."
                  className="w-full bg-brand-surface text-xs text-brand-charcoal pl-9 pr-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                />
                <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3 pointer-events-none" />
              </form>

              <div className="flex flex-col gap-2 font-medium text-sm">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-brand-cream"
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-brand-cream"
                >
                  All Products Catalogue
                </Link>
                <Link
                  to="/offers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-brand-cream text-brand-maroon font-semibold"
                >
                  Festive Offers
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-brand-cream"
                >
                  Our Heritage
                </Link>
                <Link
                  to="/reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-brand-cream"
                >
                  Customer Reviews
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-brand-cream"
                >
                  Contact & Locations
                </Link>

                {onOpenChatbot && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenChatbot();
                    }}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light py-2.5 rounded-xl font-semibold text-xs mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch AI Shopping Assistant</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

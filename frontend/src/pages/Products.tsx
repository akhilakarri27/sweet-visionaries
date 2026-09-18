import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PackageOpen, ArrowUpDown, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types/database';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '../lib/demoData';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

interface ProductsPageProps {
  onToast?: (msg: string) => void;
  onOpenChatbot?: () => void;
}

export const Products: React.FC<ProductsPageProps> = ({ onToast, onOpenChatbot }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(1500);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        if (catData && catData.length > 0) setCategories(catData as Category[]);

        const { data: prodData } = await supabase
          .from('products')
          .select('*, categories(name), product_images(*)')
          .order('rating', { ascending: false });
        if (prodData && prodData.length > 0) setProducts(prodData as Product[]);
      } catch (err) {
        console.error('Products fetch error:', err);
      }
    };
    fetchInitial();
  }, []);

  // Sync URL search params
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat !== null) setSelectedCategory(urlCat);

    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) setSearchQuery(urlSearch);
  }, [searchParams]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.taste_profile?.toLowerCase().includes(q) ||
          p.ingredients?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      list = list.filter((p) => p.category_id === selectedCategory);
    }

    // Max Price filter
    list = list.filter((p) => p.price <= maxPrice);

    // Rating filter
    if (minRating > 0) {
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }

    // In Stock filter
    if (inStockOnly) {
      list = list.filter((p) => p.is_available && p.stock > 0);
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // popularity (featured first + high rating)
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return list;
  }, [products, searchQuery, selectedCategory, maxPrice, minRating, inStockOnly, sortBy]);

  // Paginated View
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMaxPrice(1500);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('popularity');
    setSearchParams({});
    setCurrentPage(1);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Title & Subtitle */}
      <div className="bg-brand-warm-gradient rounded-3xl p-6 sm:p-10 border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Artisanal Sweet Shop</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal">
            Traditional Sweets & Savouries
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
            Pure Desi Ghee delicacies, authentic Andhra Kaja, and crispy festive snacks delivered freshly packed to your door.
          </p>
        </div>

        {onOpenChatbot && (
          <button
            onClick={onOpenChatbot}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light px-5 py-3 rounded-2xl font-bold text-xs shadow-gold hover:scale-105 transition-all shrink-0 border border-brand-gold/40"
          >
            <Sparkles className="w-4 h-4 text-brand-gold-light" />
            <span>Need recommendations? Ask AI</span>
          </button>
        )}
      </div>

      {/* Main Grid: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <ProductFilters
            categories={categories}
            selectedCategoryId={selectedCategory}
            onSelectCategory={handleCategorySelect}
            maxPrice={maxPrice}
            onPriceChange={(p) => {
              setMaxPrice(p);
              setCurrentPage(1);
            }}
            minRating={minRating}
            onRatingChange={(r) => {
              setMinRating(r);
              setCurrentPage(1);
            }}
            inStockOnly={inStockOnly}
            onInStockChange={(s) => {
              setInStockOnly(s);
              setCurrentPage(1);
            }}
            onReset={handleResetFilters}
          />
        </div>

        {/* Products Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search & Sort Controls Bar */}
          <div className="bg-[#FFFDF9] rounded-2xl border border-brand-border p-3.5 shadow-soft flex flex-wrap items-center justify-between gap-3">
            
            {/* Live Search */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Gottam Kaja, Pootharekulu, Mysore Pak..."
                className="w-full bg-brand-surface text-xs text-brand-charcoal pl-9 pr-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold text-brand-charcoal"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-gold" />
              <span>Filters</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-brand-surface text-xs text-brand-charcoal font-medium py-2 px-3 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
              >
                <option value="popularity">Popular & Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Alphabetical (A to Z)</option>
              </select>
            </div>

          </div>

          {/* Mobile Filter Modal */}
          {showMobileFilters && (
            <div className="lg:hidden">
              <ProductFilters
                categories={categories}
                selectedCategoryId={selectedCategory}
                onSelectCategory={handleCategorySelect}
                maxPrice={maxPrice}
                onPriceChange={setMaxPrice}
                minRating={minRating}
                onRatingChange={setMinRating}
                inStockOnly={inStockOnly}
                onInStockChange={setInStockOnly}
                onReset={handleResetFilters}
              />
            </div>
          )}

          {/* Active Filter Summary */}
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              Showing <strong className="text-brand-charcoal">{filteredProducts.length}</strong> delicacies
            </span>
            {(selectedCategory || searchQuery || minRating > 0 || inStockOnly || maxPrice < 1500) && (
              <button
                onClick={handleResetFilters}
                className="text-brand-gold font-semibold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <ProductCardSkeleton key={n} />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} onToast={onToast} />
              ))}
            </div>
          ) : (
            <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-12 text-center space-y-4">
              <PackageOpen className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-brand-charcoal">
                No sweets match your selected filters
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try widening your price range, searching for another keyword, or resetting all filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-brand-maroon text-brand-gold-light text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-brand-gold hover:text-white transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-brand-maroon text-brand-gold-light shadow-soft'
                        : 'bg-[#FFFDF9] border border-brand-border text-stone-600 hover:border-brand-gold'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

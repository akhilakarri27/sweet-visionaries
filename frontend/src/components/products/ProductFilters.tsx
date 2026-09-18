import React from 'react';
import { Filter, RotateCcw, Check, Star } from 'lucide-react';
import { Category } from '../../types/database';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  maxPrice: number;
  onPriceChange: (price: number) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  maxPrice,
  onPriceChange,
  minRating,
  onRatingChange,
  inStockOnly,
  onInStockChange,
  onReset,
}) => {
  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-brand-border p-5 shadow-soft space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2 text-brand-maroon font-serif font-bold text-base">
          <Filter className="w-4 h-4 text-brand-gold" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-brand-gold transition-colors font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Categories List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 font-serif">
          Categories
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedCategoryId === ''
                ? 'bg-brand-maroon text-brand-gold-light font-bold shadow-xs'
                : 'text-stone-600 hover:bg-brand-surface'
            }`}
          >
            <span>All Sweets & Savouries</span>
            {selectedCategoryId === '' && <Check className="w-3.5 h-3.5" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-brand-maroon text-brand-gold-light font-bold shadow-xs'
                  : 'text-stone-600 hover:bg-brand-surface'
              }`}
            >
              <span>{cat.name}</span>
              {selectedCategoryId === cat.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 font-serif">
          <span>Max Price</span>
          <span className="text-brand-gold-dark font-sans font-bold text-sm">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min="150"
          max="1500"
          step="50"
          value={maxPrice}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full accent-brand-gold cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-stone-500 mt-1">
          <span>₹150</span>
          <span>₹1,500</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 font-serif">
          Minimum Rating
        </h4>
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 4.0, 4.5].map((rate) => (
            <button
              key={rate}
              onClick={() => onRatingChange(rate)}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                minRating === rate
                  ? 'bg-brand-gold text-white border-brand-gold'
                  : 'bg-brand-surface text-stone-600 border-brand-border hover:border-brand-gold'
              }`}
            >
              {rate === 0 ? (
                <span>All</span>
              ) : (
                <>
                  <Star className="w-3 h-3 fill-current" />
                  <span>{rate}+</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Availability Toggle */}
      <div className="pt-2 border-t border-brand-border">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-medium text-stone-700 group-hover:text-brand-gold transition-colors">
            In Stock Only
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="w-4 h-4 accent-brand-maroon rounded cursor-pointer"
          />
        </label>
      </div>

    </div>
  );
};

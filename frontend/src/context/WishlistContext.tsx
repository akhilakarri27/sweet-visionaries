import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Product } from '../types/database';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kotaiah_wishlist_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFetchingRef = useRef(false);

  const fetchWishlist = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!user) {
      // Load products based on local IDs if any
      if (wishlistIds.length > 0) {
        try {
          const { data } = await supabase
            .from('products')
            .select('*, product_images(*)')
            .in('id', wishlistIds);
          if (data) setWishlistProducts(data as Product[]);
        } catch (err) {
          console.error('Wishlist local products fetch error:', err);
        }
      } else {
        setWishlistProducts([]);
      }
      isFetchingRef.current = false;
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id, products(*, product_images(*))')
        .eq('user_id', user.id);

      if (!error && data) {
        const ids = data.map((item: any) => item.product_id);
        const prods = data.map((item: any) => item.products).filter(Boolean);
        setWishlistIds(ids);
        setWishlistProducts(prods as Product[]);
        localStorage.setItem('kotaiah_wishlist_ids', JSON.stringify(ids));
      }
    } catch (err) {
      console.error('Wishlist fetch error:', err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.id, wishlistIds.length]);

  useEffect(() => {
    fetchWishlist();
  }, [user?.id]);

  const toggleWishlist = async (product: Product) => {
    const exists = wishlistIds.includes(product.id);
    const newIds = exists
      ? wishlistIds.filter((id) => id !== product.id)
      : [...wishlistIds, product.id];

    setWishlistIds(newIds);
    localStorage.setItem('kotaiah_wishlist_ids', JSON.stringify(newIds));

    if (exists) {
      setWishlistProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      setWishlistProducts((prev) => [...prev, product]);
    }

    if (user) {
      try {
        if (exists) {
          await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', product.id);
        } else {
          await supabase
            .from('wishlist')
            .insert({ user_id: user.id, product_id: product.id });
        }
      } catch (err) {
        console.error('Failed to sync wishlist with database:', err);
      }
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        isLoading,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

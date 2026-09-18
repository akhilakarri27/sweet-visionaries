import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem, Offer } from '../types/database';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, weight?: string) => void;
  removeFromCart: (productId: string, weight?: string) => void;
  updateQuantity: (productId: string, quantity: number, weight?: string) => void;
  clearCart: () => void;
  deliveryType: 'delivery' | 'pickup';
  setDeliveryType: (type: 'delivery' | 'pickup') => void;
  appliedOffer: Offer | null;
  applyCoupon: (couponCode: string, offers: Offer[]) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kotaiah_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('kotaiah_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cart]);

  const calculateUnitPrice = (basePrice: number, weight: string): number => {
    if (weight === '250g') return Math.round(basePrice * 0.55);
    if (weight === '1kg') return Math.round(basePrice * 1.95);
    if (weight.includes('1.2 kg')) return Math.round(basePrice);
    return basePrice; // default 500g
  };

  const addToCart = (product: Product, quantity: number = 1, weight: string = product.weight || '500g') => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedWeight === weight
      );

      const unitPrice = calculateUnitPrice(product.price, weight);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty > product.stock ? product.stock : newQty,
          unitPrice,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: Math.min(quantity, product.stock || 50),
            selectedWeight: weight,
            unitPrice,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string, weight?: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        if (weight) {
          return !(item.product.id === productId && item.selectedWeight === weight);
        }
        return item.product.id !== productId;
      })
    );
  };

  const updateQuantity = (productId: string, quantity: number, weight?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId && (!weight || item.selectedWeight === weight)) {
          return {
            ...item,
            quantity: Math.min(quantity, item.product.stock || 50),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedOffer(null);
  };

  // Financial Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // Delivery Fee: ₹50 flat, free for orders above ₹799 or for store pickup
  const deliveryFee = deliveryType === 'pickup' || subtotal >= 799 || subtotal === 0 ? 0 : 50;

  // Discount Calculation
  let discountAmount = 0;
  if (appliedOffer) {
    if (subtotal >= appliedOffer.min_order_amount) {
      const calculated = (subtotal * appliedOffer.discount_percent) / 100;
      discountAmount = appliedOffer.max_discount
        ? Math.min(calculated, appliedOffer.max_discount)
        : calculated;
    }
  }

  // 5% Goods and Services Tax (GST) for confectionery in India
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.05);

  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee + taxAmount);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const applyCoupon = (couponCode: string, availableOffers: Offer[]) => {
    const cleanCode = couponCode.trim().toUpperCase();
    const match = availableOffers.find(
      (o) => o.code.toUpperCase() === cleanCode && o.is_active
    );

    if (!match) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }

    if (subtotal < match.min_order_amount) {
      return {
        success: false,
        message: `Minimum order of ₹${match.min_order_amount} required for this coupon.`,
      };
    }

    setAppliedOffer(match);
    return {
      success: true,
      message: `Coupon ${match.code} applied! (${match.discount_percent}% off)`,
    };
  };

  const removeCoupon = () => {
    setAppliedOffer(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
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
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

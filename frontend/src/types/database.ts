export type UserRole = 'super_admin' | 'shop_owner' | 'staff' | 'customer';

export interface Profile {
  id: string;
  shop_id?: string | null;
  role: UserRole;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  banner_url?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  shop_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url?: string | null;
  weight: string;
  ingredients?: string | null;
  taste_profile?: string | null;
  allergens?: string | null;
  shelf_life?: string | null;
  storage_instructions?: string | null;
  stock: number;
  is_available: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
  product_images?: ProductImage[];
}

export interface CustomerAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  price: number;
  quantity: number;
  weight: string;
  subtotal: number;
  image_url?: string | null;
}

export interface Order {
  id: string;
  shop_id: string;
  customer_id?: string | null;
  user_id?: string | null;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  payment_status: PaymentStatus;
  payment_method: string;
  delivery_type: 'delivery' | 'pickup';
  shipping_address: any;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}

export interface Offer {
  id: string;
  shop_id: string;
  code: string;
  title: string;
  description?: string | null;
  discount_percent: number;
  min_order_amount: number;
  max_discount?: number | null;
  valid_until?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  shop_id: string;
  product_id: string;
  user_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  image_url?: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight: string;
  unitPrice: number;
}

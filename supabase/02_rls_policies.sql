-- ====================================================================
-- KOTAIAH SWEETS - SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 2. Helper Functions for Role Resolution
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_shop_id()
RETURNS UUID AS $$
  SELECT shop_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Shops Policies
CREATE POLICY "Public can view active shops"
ON public.shops FOR SELECT
USING (is_active = true OR get_auth_role() = 'super_admin' OR id = get_auth_shop_id());

CREATE POLICY "Super admin can manage all shops"
ON public.shops FOR ALL
USING (get_auth_role() = 'super_admin');

CREATE POLICY "Shop owners can update their own shop"
ON public.shops FOR UPDATE
USING (id = get_auth_shop_id());

-- 4. Profiles Policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid() OR get_auth_role() = 'super_admin' OR (get_auth_role() = 'shop_owner' AND shop_id = get_auth_shop_id()));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid() OR get_auth_role() = 'super_admin');

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid() OR get_auth_role() = 'super_admin');

-- 5. Categories Policies
CREATE POLICY "Public can view active categories"
ON public.categories FOR SELECT
USING (is_active = true OR get_auth_role() = 'super_admin' OR shop_id = get_auth_shop_id());

CREATE POLICY "Shop owners & super admins can manage categories"
ON public.categories FOR ALL
USING (get_auth_role() = 'super_admin' OR (get_auth_role() IN ('shop_owner', 'staff') AND shop_id = get_auth_shop_id()));

-- 6. Products Policies
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (is_available = true OR get_auth_role() = 'super_admin' OR shop_id = get_auth_shop_id());

CREATE POLICY "Shop owners & super admins can manage products"
ON public.products FOR ALL
USING (get_auth_role() = 'super_admin' OR (get_auth_role() IN ('shop_owner', 'staff') AND shop_id = get_auth_shop_id()));

-- 7. Product Images Policies
CREATE POLICY "Public can view product images"
ON public.product_images FOR SELECT
USING (true);

CREATE POLICY "Shop owners can manage product images"
ON public.product_images FOR ALL
USING (
  get_auth_role() = 'super_admin' OR 
  EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_images.product_id 
    AND p.shop_id = get_auth_shop_id()
  )
);

-- 8. Addresses Policies
CREATE POLICY "Users can manage own addresses"
ON public.addresses FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 9. Orders Policies
CREATE POLICY "Customers view own orders"
ON public.orders FOR SELECT
USING (user_id = auth.uid() OR get_auth_role() = 'super_admin' OR shop_id = get_auth_shop_id());

CREATE POLICY "Customers create orders"
ON public.orders FOR INSERT
WITH CHECK (true); -- Allow guest checkout or authenticated checkout

CREATE POLICY "Shop owners manage orders for their shop"
ON public.orders FOR UPDATE
USING (get_auth_role() = 'super_admin' OR (get_auth_role() IN ('shop_owner', 'staff') AND shop_id = get_auth_shop_id()));

-- 10. Order Items Policies
CREATE POLICY "Users & shop owners can view order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_items.order_id 
    AND (o.user_id = auth.uid() OR get_auth_role() = 'super_admin' OR o.shop_id = get_auth_shop_id())
  )
);

CREATE POLICY "System/Users can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

-- 11. Wishlist Policies
CREATE POLICY "Users manage own wishlist"
ON public.wishlist FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 12. Offers Policies
CREATE POLICY "Public can view active offers"
ON public.offers FOR SELECT
USING (is_active = true OR get_auth_role() = 'super_admin' OR shop_id = get_auth_shop_id());

CREATE POLICY "Shop owners can manage offers"
ON public.offers FOR ALL
USING (get_auth_role() = 'super_admin' OR (get_auth_role() IN ('shop_owner') AND shop_id = get_auth_shop_id()));

-- 13. Reviews Policies
CREATE POLICY "Public can view approved reviews"
ON public.reviews FOR SELECT
USING (is_approved = true OR user_id = auth.uid() OR get_auth_role() = 'super_admin' OR shop_id = get_auth_shop_id());

CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
USING (user_id = auth.uid() OR get_auth_role() = 'super_admin' OR shop_id = get_auth_shop_id());

CREATE POLICY "Users or shop owners can delete reviews"
ON public.reviews FOR DELETE
USING (user_id = auth.uid() OR get_auth_role() = 'super_admin' OR shop_id = get_auth_shop_id());

-- 14. Customers Table (CRM) Policies
CREATE POLICY "Shop owners can view customers"
ON public.customers FOR ALL
USING (get_auth_role() = 'super_admin' OR shop_id = get_auth_shop_id());

-- 15. RAG Documents Policies
CREATE POLICY "RAG docs accessible by server / shop owner"
ON public.rag_documents FOR ALL
USING (get_auth_role() = 'super_admin' OR shop_id = get_auth_shop_id() OR auth.role() = 'service_role');

-- 16. Chat Sessions & Messages Policies
CREATE POLICY "Users access own chat sessions"
ON public.chat_sessions FOR ALL
USING (user_id = auth.uid() OR auth.uid() IS NULL OR get_auth_role() = 'super_admin')
WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL OR get_auth_role() = 'super_admin');

CREATE POLICY "Users access own chat messages"
ON public.chat_messages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs 
    WHERE cs.id = chat_messages.session_id 
    AND (cs.user_id = auth.uid() OR cs.user_id IS NULL OR get_auth_role() = 'super_admin')
  )
);

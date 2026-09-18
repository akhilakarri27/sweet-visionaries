-- ====================================================================
-- KOTAIAH SWEETS - STORAGE BUCKETS & COMPLETE PRODUCT CATALOGUE SEED
-- ====================================================================

-- 1. Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('shop-images', 'shop-images', true),
    ('gallery', 'gallery', true),
    ('review-images', 'review-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Public Read Policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Read on Product Images'
    ) THEN
        CREATE POLICY "Public Read on Product Images"
        ON storage.objects FOR SELECT
        USING (bucket_id IN ('product-images', 'shop-images', 'gallery', 'review-images'));
    END IF;
END $$;

-- Storage Upload Policy for Authenticated/Service
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users upload images'
    ) THEN
        CREATE POLICY "Authenticated users upload images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id IN ('product-images', 'shop-images', 'gallery', 'review-images'));
    END IF;
END $$;

-- 2. Seed Default Shop (Kotaiah Sweets)
INSERT INTO public.shops (
    id,
    name,
    slug,
    logo_url,
    banner_url,
    description,
    address,
    phone,
    email,
    is_active
) VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Kotaiah Sweets',
    'kotaiah-sweets',
    'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=500&q=80',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1600&q=80',
    'Master artisans of authentic Andhra sweets, legendary Gottam Kaja, pure ghee delicacies and crispy savouries since 1900.',
    'Main Bazaar Road, Kakinada, Andhra Pradesh - 533001',
    '+91 884 237 8999',
    'orders@kotaiahsweets.com',
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 3. Seed Product Categories (9 Dedicated Categories)
INSERT INTO public.categories (id, shop_id, name, slug, description, image_url, display_order, is_active) VALUES
('b1000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Kaja Specials', 'kaja-specials', 'World-renowned crispy, juicy Kakinada Gottam Kaja, Nethi Kaja and layered Madatha Kaja made with pure ghee.', 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600&q=80', 1, true),
('b1000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Traditional Sweets', 'traditional-sweets', 'Heritage delicacies crafted with time-tested generational recipes and pure country ghee.', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', 2, true),
('b1000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Kaju & Dry Fruit Sweets', 'dry-fruit-sweets', 'Nutritious and decadent sweets loaded with premium cashews, almonds, pistachios and figs.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80', 3, true),
('b1000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Milk Sweets & Kalakand', 'milk-ghee-sweets', 'Rich melt-in-the-mouth Kalakand, Mysore Pak, Paalkova, and artisanal cream burfis.', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80', 4, true),
('b1000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Laddu Varieties', 'laddu-varieties', 'Aromatic Boondi Laddu, Moti Laddu, Besan Laddu, Thokkudu Laddu, Balaji Laddu, and Dry Fruit Laddu.', 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80', 5, true),
('b1000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Halwa Specials', 'halwa-specials', 'Translucent, chewy royal Fruit Halwa, Karachi Red Halwa, and rich Dry Fruit Halwa.', 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80', 6, true),
('b1000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Pootharekulu', 'pootharekulu', 'World-famous Atreyapuram wafer-thin edible paper sweets stuffed with pure ghee, jaggery, sugar and roasted nuts.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80', 7, true),
('b1000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Savouries & Snacks', 'savouries-namkeen', 'Crunchy Andhra special Mixture, spicy Palli Pakodi, Agra Dalmoth Mixture and Ribbon Murukku.', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&q=80', 8, true),
('b1000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Gift Boxes & Hampers', 'gift-boxes', 'Royal celebration boxes and festive assortments for weddings, Diwali and family milestones.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80', 9, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    display_order = EXCLUDED.display_order;

-- 4. Seed Product Records
INSERT INTO public.products (
    id, shop_id, category_id, name, slug, description, price, weight, ingredients, taste_profile, allergens, shelf_life, storage_instructions, stock, is_available, is_featured, rating, review_count
) VALUES
-- Traditional Sweets & Kajas
('c1000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000001',
 'Kakinada Gottam Kaja (Pure Ghee)', 'kakinada-gottam-kaja',
 'The iconic jewel of Andhra Pradesh. Cylindrical golden pastry, crispy on the outer shell and filled with warm, aromatic cardamom sugar syrup in the center.',
 320.00, '500g', 'Refined Wheat Flour (Maida), Pure Country Ghee, Sugar Syrup, Cardamom Powder.',
 'Crispy outer crust with a juicy, melt-in-mouth sugary cardamom syrup center.',
 'Contains Gluten (Wheat) and Dairy (Ghee).', '15 Days from packing date.',
 'Store in an airtight container at room temperature away from direct sunlight. Do not refrigerate.', 85, true, true, 4.95, 148),

('c1000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000001',
 'Ghee Kaja (Nethi Kaja)', 'ghee-kaja',
 'Authentic royal Nethi Kaja prepared with 100% pure desi cow ghee, delicately layered and drenched in fragrant cardamom sugar syrup.',
 350.00, '500g', 'Refined Wheat Flour, Pure Desi Cow Ghee, Cane Sugar, Cardamom Powder.',
 'Rich ghee aroma, crispy outside and oozing with sweet syrup.',
 'Contains Gluten and Dairy.', '15 Days from packing date.',
 'Store at room temperature in an airtight box.', 75, true, true, 4.96, 112),

('c1000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000001',
 'Madatha Kaja', 'madatha-kaja',
 'Traditional folded layered sweet delicacy, crispy and flaky on the outside with syrupy sweetness trapped between delicate pastry layers.',
 280.00, '500g', 'Refined Wheat Flour, Pure Ghee, Sugar, Cardamom.',
 'Flaky, crunchy layered texture with rich sugar infusion.',
 'Contains Gluten and Dairy.', '15 Days from packing date.',
 'Store in cool dry airtight container.', 60, true, true, 4.80, 92),

('c1000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000001',
 'Baby Madata Kaja', 'baby-madata-kaja',
 'Bite-sized miniature layered Madatha Kajas, perfectly crisp, flaky and dipped in rich cardamom syrup for delightful single-bite enjoyment.',
 290.00, '500g', 'Refined Wheat Flour, Pure Ghee, Cane Sugar, Cardamom.',
 'Crisp bite-sized flaky pastry soaked in fragrant sweet syrup.',
 'Contains Gluten and Dairy.', '15 Days from packing date.',
 'Store in an airtight container at room temperature.', 65, true, false, 4.88, 76),

('c1000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000001',
 'Baby Gottam Kaja', 'baby-gottam-kaja',
 'Miniature version of the world-famous Kakinada Gottam Kaja with a crunchy cylindrical outer crust holding luscious warm cardamom syrup.',
 330.00, '500g', 'Refined Wheat Flour, Pure Country Ghee, Sugar, Cardamom.',
 'Crispy bite-sized crust filled with sweet cardamom syrup.',
 'Contains Gluten and Dairy.', '15 Days from packing date.',
 'Store at room temperature in an airtight box.', 70, true, true, 4.92, 88),

('c1000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000001',
 'Paneer Kaja', 'paneer-kaja',
 'Soft and porous kaja variety enriched with fresh cottage cheese (chenna) and infused with light aromatic sugar syrup.',
 340.00, '500g', 'Fresh Paneer (Chenna), Wheat Flour, Pure Ghee, Sugar Syrup, Cardamom.',
 'Soft, spongy texture with rich dairy sweetness and cardamom notes.',
 'Contains Gluten and Dairy.', '10 Days from packing date.',
 'Store in an airtight container.', 50, true, false, 4.85, 62),

('c1000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'Kaju Burfi', 'kaju-burfi',
 'Soft and rich cashew-based sweet with a smooth texture, suitable for festive occasions and gifting.',
 520.00, '500g', 'Premium Cashew Nuts (Kaju), Sugar, Pure Ghee, Cardamom.',
 'Smooth, subtle sweetness with prominent nutty richness and melt-in-mouth finish.',
 'Contains Tree Nuts (Cashew) and Dairy.', '20 Days from packing date.',
 'Keep in cool, dry place. Refrigerator recommended during summer.', 65, true, true, 4.94, 210),

('c1000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'Gulab Jamun', 'gulab-jamun',
 'Soft, syrup-soaked milk-based sweet with a rich and traditional taste.',
 290.00, '500g', 'Khoya (Mawa), Milk Solids, Cane Sugar, Green Cardamom, Rose Water, Pure Ghee.',
 'Extremely soft, juicy, warm cardamom-rose infused sweetness.',
 'Contains Dairy.', '7 Days from packing date.',
 'Store in a cool dry place or refrigerate in an airtight container.', 80, true, true, 4.91, 175),

('c1000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'Jangri', 'jangri',
 'Traditional spiral-shaped sweet with a crisp exterior and juicy syrup-filled center.',
 310.00, '500g', 'Urad Dal (Black Gram), Pure Ghee, Sugar Syrup, Saffron, Cardamom, Lemon juice.',
 'Juicy, syrupy and chewy with rich floral notes.',
 'Contains Dairy.', '8 Days from packing date.',
 'Airtight container at room temperature.', 50, true, false, 4.86, 89),

('c1000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'Paneer Jalebi', 'paneer-jalebi',
 'Festive spiral delicacy prepared with fresh cottage cheese (paneer), golden fried in pure ghee and soaked in saffron sugar syrup.',
 330.00, '500g', 'Fresh Paneer (Chenna), Milk Solids, Pure Ghee, Saffron, Sugar, Cardamom.',
 'Melt-in-the-mouth, juicy, rich and delicately aromatic with saffron notes.',
 'Contains Dairy.', '6 Days from packing date.',
 'Store in a cool dry place or refrigerate.', 45, true, false, 4.87, 54),

('c1000000-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000004',
 'Mysore Pak', 'mysore-pak',
 'Classic royal South Indian delicacy prepared with slow-roasted gram flour, generous pure desi ghee, and fine sugar.',
 340.00, '500g', 'Gram Flour (Besan), Pure Desi Cow Ghee, Sugar, Cardamom.',
 'Aromatic, buttery, traditional porous texture with caramel besan aroma.',
 'Contains Dairy (Ghee).', '20 Days from packing date.',
 'Store at ambient room temperature in clean dry container.', 70, true, true, 4.90, 130),

('c1000000-0000-0000-0000-000000000012', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000004',
 'Milk Mysore Pak', 'milk-mysore-pak',
 'Super soft and velvety variation of Mysore Pak infused with fresh condensed milk solids and pure ghee for a fudge-like texture.',
 360.00, '500g', 'Milk Solids (Khoya), Besan, Pure Desi Ghee, Sugar, Cardamom.',
 'Silky, creamy, melt-in-mouth milk and ghee bliss.',
 'Contains Dairy (Milk, Ghee).', '15 Days from packing date.',
 'Store in a clean dry airtight container.', 55, true, true, 4.93, 118),

('c1000000-0000-0000-0000-000000000013', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000004',
 'Ongole Mysore Pak', 'ongole-mysore-pak',
 'Authentic Andhra-style crispy and honeycomb-porous Mysore Pak with dark caramelised center and intense ghee aroma.',
 320.00, '500g', 'Gram Flour (Besan), Pure Desi Ghee, Sugar.',
 'Crisp, airy honeycomb structure with deeply roasted nutty ghee aroma.',
 'Contains Dairy (Ghee).', '25 Days from packing date.',
 'Store in an airtight container at room temperature.', 60, true, false, 4.88, 82),

('c1000000-0000-0000-0000-000000000014', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000005',
 'Boondi Laddu', 'boondi-laddu',
 'Generously sized golden gram flour boondi pearls tossed in pure ghee, cardamom, cloves, crunchy cashews, and juicy raisins.',
 300.00, '500g', 'Gram Flour (Besan), Pure Cow Ghee, Cane Sugar, Cashews, Raisins, Cardamom, Cloves.',
 'Aromatic, sweet, soft and slightly chewy with crunchy nut bursts.',
 'Contains Tree Nuts and Dairy.', '15 Days from packing date.',
 'Store in airtight box away from moisture.', 90, true, true, 4.89, 120),

('c1000000-0000-0000-0000-000000000015', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000005',
 'Moti Laddu', 'moti-laddu',
 'Tiny golden gram flour pearls fried in pure ghee, bound with saffron-infused sugar syrup, melon seeds, and crushed green cardamom.',
 320.00, '500g', 'Besan, Pure Desi Ghee, Sugar Syrup, Saffron, Cardamom, Magaj (Melon Seeds).',
 'Juicy, soft, fragrant and melt-in-mouth sweetness.',
 'Contains Dairy (Ghee).', '10 Days from packing date.',
 'Airtight container at room temperature.', 80, true, true, 4.93, 164),

('c1000000-0000-0000-0000-000000000016', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000005',
 'Besan Laddu', 'besan-laddu',
 'Golden roasted chickpea flour laddu slow-cooked in pure desi cow ghee, fragrant cardamom and crunchy almond flakes.',
 310.00, '500g', 'Roasted Gram Flour (Besan), Pure Cow Ghee, Sugar, Cardamom, Almonds.',
 'Nutty, rich, aromatic roasted ghee goodness with fine melt-in-mouth texture.',
 'Contains Dairy and Tree Nuts.', '25 Days from packing date.',
 'Store in a cool dry container.', 75, true, false, 4.89, 95),

('c1000000-0000-0000-0000-000000000017', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000005',
 'Dry Fruit Laddu', 'dry-fruit-laddu',
 'Nutrient-dense sugar-free energy balls loaded with crushed almonds, cashews, pistachios, dates, figs, and pure country ghee.',
 480.00, '500g', 'Arabian Dates, Dried Figs (Anjeer), Cashews, Almonds, Pistachios, Pure Desi Ghee, Cardamom.',
 'Naturally sweet from dates and figs with dense, nutty crunch.',
 'Contains Tree Nuts and Dairy.', '30 Days from packing date.',
 'Store in an airtight container.', 60, true, true, 4.97, 188),

('c1000000-0000-0000-0000-000000000018', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000005',
 'Thokkudu Laddu', 'thokkudu-laddu',
 'Machilipatnam legendary pounded besan laddu, velvety smooth and melt-in-mouth, ground with roasted gram flour, ghee and fine powdered sugar.',
 340.00, '500g', 'Roasted Besan Flour, Pure Desi Ghee, Fine Sugar, Cardamom, Cashews.',
 'Silky, velvety, smooth floury texture that melts effortlessly.',
 'Contains Dairy and Tree Nuts.', '20 Days from packing date.',
 'Store at ambient room temperature in clean dry container.', 65, true, true, 4.94, 145),

('c1000000-0000-0000-0000-000000000019', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000005',
 'Balaji Laddu', 'balaji-laddu',
 'Grand festive prasadam-style boondi laddu made with generous pure cow ghee, edible camphor, cashews, raisins, and aromatic cardamom.',
 350.00, '500g', 'Gram Flour, Pure Cow Ghee, Sugar, Cashews, Raisins, Edible Camphor, Cardamom, Kalkandu.',
 'Divinely fragrant with ghee, camphor and rich nutty sweetness.',
 'Contains Dairy and Tree Nuts.', '15 Days from packing date.',
 'Store in an airtight container.', 55, true, true, 4.96, 134),

('c1000000-0000-0000-0000-000000000020', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'Sunnundalu', 'sunnundalu',
 'Traditional high-protein Andhra festive sweet made from slow-roasted whole black gram (urad dal), pure country cow ghee, and organic jaggery.',
 340.00, '500g', 'Roasted Urad Dal, Pure Cow Ghee, Organic Bellam (Jaggery), Cardamom.',
 'Hearty, nutty, earthy jaggery flavour with luxurious ghee aroma.',
 'Contains Dairy (Ghee).', '30 Days from packing date.',
 'Store in an airtight container at room temperature.', 65, true, true, 4.95, 128),

('c1000000-0000-0000-0000-000000000021', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'Bobbatlu', 'bobbatlu',
 'Soft, golden flatbread stuffed with a sweet, aromatic filling of boiled chana dal, jaggery, cardamom, and roasted on a tawa with pure ghee.',
 290.00, 'Pack of 6 Pcs', 'Chana Dal (Bengal Gram), Organic Jaggery, Maida, Cardamom, Pure Desi Cow Ghee, Nutmeg.',
 'Soft, buttery flatbread with aromatic cardamom jaggery filling.',
 'Contains Gluten and Dairy.', '7 Days from packing date.',
 'Store in airtight box. Warm slightly before enjoying.', 55, true, true, 4.95, 156),

('c1000000-0000-0000-0000-000000000022', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000004',
 'Paala Kova', 'paala-kova',
 'Pure farm-fresh whole milk slow-condensed for hours in heavy-bottomed kadai with cane sugar and a hint of cardamom to a luscious fudge.',
 310.00, '500g', 'Fresh Cow Milk, Cane Sugar, Cardamom, Pure Ghee.',
 'Rich, milky, creamy and deeply satisfying traditional dairy sweetness.',
 'Contains Dairy (Milk, Ghee).', '10 Days from packing date.',
 'Keep in cool dry place. Refrigeration recommended.', 70, true, true, 4.92, 135),

('c1000000-0000-0000-0000-000000000023', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'Bellam Gavalu', 'bellam-gavalu',
 'Crispy shell-shaped fried pastries coated in rich, glossy organic jaggery syrup and fragrant cardamom.',
 260.00, '500g', 'Wheat Flour, Pure Ghee, Organic Jaggery (Bellam), Cardamom.',
 'Crunchy, sweet, caramelised jaggery shell with satisfying bite.',
 'Contains Gluten and Dairy.', '30 Days from packing date.',
 'Store in an airtight jar at room temperature.', 80, true, false, 4.88, 72),

('c1000000-0000-0000-0000-000000000024', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'Malai Puri', 'malai-puri',
 'Tender, flaky golden discs crafted from fresh milk cream (malai) and flour, immersed in aromatic saffron cardamom sugar syrup.',
 340.00, '500g', 'Fresh Milk Malai, Maida, Pure Ghee, Sugar Syrup, Saffron, Pistachios.',
 'Juicy, flaky, rich creaminess with subtle saffron fragrance.',
 'Contains Gluten and Dairy.', '8 Days from packing date.',
 'Store in an airtight container or refrigerate.', 45, true, false, 4.86, 58),

('c1000000-0000-0000-0000-000000000025', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'White Rasakanda', 'white-rasakanda',
 'Delicate and juicy sweet made from pure cow milk chenna, gently cooked and soaked in light rose and cardamom scented syrup.',
 300.00, '500g', 'Cow Milk Chenna (Cottage Cheese), Sugar, Rose Water, Cardamom.',
 'Spongy, light, refreshing sweetness with delicate rose undertones.',
 'Contains Dairy.', '6 Days from packing date.',
 'Refrigeration recommended.', 50, true, false, 4.84, 46),

('c1000000-0000-0000-0000-000000000026', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'White Angoor', 'white-angoor',
 'Grape-sized miniature spherical chenna dumplings poached in light, fragrant sugar syrup.',
 290.00, '500g', 'Fresh Cow Milk Chenna, Cane Sugar, Rose Essence, Cardamom.',
 'Spongy, sweet, bite-sized burst of mild dairy sweetness.',
 'Contains Dairy.', '6 Days from packing date.',
 'Store in refrigerator in syrup.', 55, true, false, 4.85, 49),

('c1000000-0000-0000-0000-000000000027', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000002',
 'Brown Angoor', 'brown-angoor',
 'Miniature bite-sized golden brown khoya spheres fried in pure ghee and soaked in warm cardamom sugar syrup.',
 300.00, '500g', 'Mawa (Khoya), Milk Solids, Pure Ghee, Sugar, Cardamom, Saffron.',
 'Soft, juicy miniature bursts of caramelised milk sweetness.',
 'Contains Dairy.', '8 Days from packing date.',
 'Store in a cool dry place or refrigerate.', 60, true, false, 4.87, 53),

-- Kalakand & Milk Sweets
('c1000000-0000-0000-0000-000000000028', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000004',
 'White Piece Kalakand', 'white-piece-kalakand',
 'Granular, moist traditional milk fudge made by slow-simmering whole milk with delicate paneer curds and cardamom.',
 340.00, '500g', 'Fresh Whole Milk, Paneer Curds, Sugar, Cardamom, Pistachio garnish.',
 'Granular (danedar), moist, rich and creamy dairy goodness.',
 'Contains Dairy.', '7 Days from packing date.',
 'Refrigerate in an airtight container.', 65, true, true, 4.93, 115),

('c1000000-0000-0000-0000-000000000029', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000004',
 'Karjur Kalakand', 'karjur-kalakand',
 'Decadent fusion kalakand blending rich reduced milk solids with natural Arabian dates and crushed pistachios.',
 370.00, '500g', 'Fresh Milk, Arabian Dates (Karjur), Sugar, Pure Ghee, Pistachios.',
 'Moist, rich, caramelised date sweetness combined with granular milk fudge.',
 'Contains Dairy and Tree Nuts.', '10 Days from packing date.',
 'Keep refrigerated in an airtight box.', 50, true, false, 4.91, 74),

('c1000000-0000-0000-0000-000000000030', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000004',
 'Horlicks Kalakand', 'horlicks-kalakand',
 'Nostalgic modern fusion sweet blending granular milk kalakand with premium malt Horlicks and roasted cashews.',
 360.00, '500g', 'Fresh Milk, Malted Horlicks, Sugar, Ghee, Cashews, Cardamom.',
 'Malty, creamy, granular fudge with a delightfully comforting aroma.',
 'Contains Dairy and Tree Nuts.', '10 Days from packing date.',
 'Store in a cool dry place or refrigerate.', 55, true, true, 4.94, 98),

('c1000000-0000-0000-0000-000000000031', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000004',
 'Vanilla Ice Cream Burfi', 'vanilla-ice-cream-burfi',
 'Ultra-smooth, melt-in-mouth creamy milk burfi flavoured with natural vanilla bean and garnished with almond slivers.',
 350.00, '500g', 'Khoya (Mawa), Milk Solids, Pure Ghee, Sugar, Natural Vanilla, Almonds.',
 'Silky, velvety, ice cream-like cool vanilla milk flavour.',
 'Contains Dairy and Tree Nuts.', '12 Days from packing date.',
 'Keep refrigerated.', 50, true, false, 4.88, 64),

('c1000000-0000-0000-0000-000000000032', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000004',
 'Badam Ice Cream Burfi', 'badam-ice-cream-burfi',
 'Luxurious double-layered burfi combining rich California almond paste with smooth vanilla milk cream.',
 380.00, '500g', 'California Almonds (Badam), Khoya, Sugar, Pure Cow Ghee, Saffron, Cardamom.',
 'Rich, nutty almond goodness with a smooth creamy dairy finish.',
 'Contains Tree Nuts and Dairy.', '15 Days from packing date.',
 'Keep refrigerated.', 45, true, true, 4.92, 86),

-- Halwa Varieties
('c1000000-0000-0000-0000-000000000033', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000006',
 'Fruit Halwa', 'fruit-halwa',
 'Translucent, chewy royal halwa enriched with real fruit extracts, pineapple pulp, pure ghee, and roasted cashews.',
 320.00, '500g', 'Corn Flour, Sugar, Mixed Fruit Pulp, Pure Ghee, Cashews, Cardamom.',
 'Chewy, fruity, translucent and fragrant with pure ghee.',
 'Contains Dairy and Tree Nuts.', '30 Days from packing date.',
 'Store at room temperature in an airtight box.', 50, true, false, 4.86, 68),

('c1000000-0000-0000-0000-000000000034', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000006',
 'Red Halwa', 'red-halwa',
 'Vibrant ruby-red translucent jelly-textured halwa cooked slowly in pure desi ghee with crunchy roasted cashews and melon seeds.',
 310.00, '500g', 'Corn Starch, Sugar, Pure Desi Cow Ghee, Cashews, Cardamom, Edible Food Color.',
 'Glossy, chewy, sweet with delightful crunch of ghee-roasted nuts.',
 'Contains Dairy and Tree Nuts.', '30 Days from packing date.',
 'Store in a clean airtight container.', 55, true, false, 4.87, 72),

('c1000000-0000-0000-0000-000000000035', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000006',
 'Dry Fruit Halwa', 'dry-fruit-halwa',
 'Slow-simmered dark amber halwa infused with generous amounts of cashews, almonds, pistachios, dates, and cardamom cooked to a rich caramelized fudge.',
 460.00, '500g', 'Dates Pulp, Cashews, Almonds, Pistachios, Corn Flour, Pure Ghee, Cardamom.',
 'Chewy, deeply nutty, aromatic caramel sweetness.',
 'Contains Tree Nuts and Dairy.', '30 Days from packing date.',
 'Store in airtight box away from moisture.', 45, true, true, 4.91, 98),

-- Pootharekulu Delicacies
('c1000000-0000-0000-0000-000000000036', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000007',
 'Bellam Pootharekulu', 'bellam-pootharekulu',
 'World-famous paper-thin rice starch film rolls from Atreyapuram folded with pure country cow ghee and organic jaggery powder.',
 340.00, 'Box of 10 Pcs', 'Jaya Rice Starch Sheets, Pure Desi Cow Ghee, Organic Bellam (Jaggery), Cardamom.',
 'Crisp wafer-thin paper melting into buttery warm jaggery sweetness.',
 'Contains Dairy (Ghee).', '30 Days from packing date.',
 'Keep in a dry, moisture-free container. Handle gently.', 60, true, true, 4.96, 142),

('c1000000-0000-0000-0000-000000000037', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000007',
 'Sugar Pootharekulu', 'sugar-pootharekulu',
 'Delicate paper-sweet made with translucent rice starch sheets rolled with pure melted desi ghee and finely powdered cane sugar.',
 320.00, 'Box of 10 Pcs', 'Rice Starch Sheets, Pure Desi Ghee, Fine Powdered Cane Sugar, Cardamom.',
 'Feather-light crunchy rice wafer dissolving into sweet buttery cardamom.',
 'Contains Dairy (Ghee).', '30 Days from packing date.',
 'Store in an airtight container.', 55, true, false, 4.90, 86),

('c1000000-0000-0000-0000-000000000038', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000007',
 'Dry Fruit Bellam Pootharekulu', 'dry-fruit-bellam-pootharekulu',
 'Ultra-thin edible rice paper rolls stuffed with generous amounts of crushed cashews, almonds, pistachios, pure country ghee and powdered jaggery.',
 450.00, 'Box of 10 Pcs', 'Rice Flour starch sheets, Pure Ghee, Organic Jaggery powder, Cashew Nuts, Almonds, Pistachios, Cardamom.',
 'Delicate paper-thin texture dissolving into buttery nutty jaggery richness.',
 'Contains Tree Nuts and Dairy.', '30 Days from packing date.',
 'Keep in moisture-free container. Handle gently.', 42, true, true, 4.98, 215),

('c1000000-0000-0000-0000-000000000039', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000007',
 'Dry Fruit Sugar Pootharekulu', 'dry-fruit-sugar-pootharekulu',
 'Delicate rice starch paper rolls generously loaded with chopped cashews, almonds, pistachios, pure ghee, and fine powdered sugar.',
 440.00, 'Box of 10 Pcs', 'Rice Starch Sheets, Pure Desi Ghee, Powdered Sugar, Cashews, Almonds, Pistachios, Cardamom.',
 'Wafer-thin, crisp, nutty and rich with sweet pure ghee.',
 'Contains Tree Nuts and Dairy.', '30 Days from packing date.',
 'Store in a dry moisture-free box.', 40, true, false, 4.92, 94),

-- Savouries & Snacks
('c1000000-0000-0000-0000-000000000040', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000008',
 'Mixture', 'mixture',
 'Traditional festive mixture combining crunchy besan sev, boondi, fried peanuts, roasted cashews, curry leaves, garlic flakes and Andhra spice blend.',
 195.00, '400g', 'Gram Flour, Peanuts, Cashews, Poha, Curry Leaves, Garlic, Red Chilli Powder, Salt, Pure Sunflower Oil.',
 'Spicy, zesty, crunchy with aromatic garlic and curry leaf burst.',
 'Contains Peanuts and Tree Nuts.', '45 Days from packing date.',
 'Airtight container at room temperature.', 110, true, false, 4.86, 95),

('c1000000-0000-0000-0000-000000000041', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000008',
 'Palli Pakodi', 'palli-pakodi',
 'Crunchy tea-time savoury made with premium peanuts coated in spiced gram flour batter, curry leaves and deep fried to golden perfection.',
 190.00, '400g', 'Peanuts (Palli), Gram Flour, Rice Flour, Red Chilli Powder, Curry Leaves, Ginger Garlic, Salt, Oil.',
 'Crunchy, nutty, spicy and deeply savoury.',
 'Contains Peanuts.', '45 Days from packing date.',
 'Store in an airtight container.', 95, true, true, 4.90, 84),

('c1000000-0000-0000-0000-000000000042', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000008',
 'Agra Mixture', 'agra-mixture',
 'Classic royal Agra style mixture crafted with crispy fried whole masoor dal, fine sev, cashews, muskmelon seeds and sweet-tangy spice blend.',
 210.00, '400g', 'Masoor Dal (Brown Lentils), Gram Flour, Cashews, Melon Seeds, Amchur (Dry Mango), Chilli, Black Salt, Oil.',
 'Crispy, tangy, mildly sweet and savory with a wonderful crunch.',
 'Contains Tree Nuts.', '45 Days from packing date.',
 'Store in a cool dry airtight jar.', 85, true, false, 4.88, 76),

-- Additional Savoury & Gift Box
('c1000000-0000-0000-0000-000000000043', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000008',
 'Special Andhra Ribbon Murukku', 'special-ribbon-murukku',
 'Crunchy and light ribbon pakoda made with fresh rice flour, gram flour, sesame seeds, ajwain and mild red chilli seasoning.',
 180.00, '400g', 'Rice Flour, Gram Flour, Pure Sesame Oil, Red Chilli Powder, Cumin, Ajwain, Salt, Asafoetida.',
 'Savory, crispy, lightly spiced with fragrant ajwain and sesame notes.',
 'May contain traces of sesame.', '45 Days from packing date.',
 'Store in airtight container to maintain maximum crunch.', 90, true, false, 4.78, 64),

('c1000000-0000-0000-0000-000000000044', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1000000-0000-0000-0000-000000000009',
 'Royal Heritage Celebration Box', 'royal-heritage-celebration-box',
 'A luxurious handcrafted gift assortment containing Kakinada Gottam Kaja, Kaju Katli, Dry Fruit Pootharekulu and Pure Ghee Mysore Pak.',
 999.00, '1.2 kg Assorted', 'Assortment of Cashews, Pure Desi Ghee, Wheat Flour, Sugar, Jaggery, Almonds, Cardamom.',
 'Symphony of crispy, syrupy, smooth and nutty traditional flavours.',
 'Contains Gluten, Tree Nuts, Dairy.', '15 Days from packing date.',
 'Store individual items as indicated inside the gift packaging.', 35, true, true, 4.99, 160)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    weight = EXCLUDED.weight,
    ingredients = EXCLUDED.ingredients,
    taste_profile = EXCLUDED.taste_profile,
    allergens = EXCLUDED.allergens,
    shelf_life = EXCLUDED.shelf_life,
    storage_instructions = EXCLUDED.storage_instructions,
    stock = EXCLUDED.stock,
    is_available = EXCLUDED.is_available,
    is_featured = EXCLUDED.is_featured;

-- 5. Seed Product Images
INSERT INTO public.product_images (id, product_id, image_url, alt_text, is_primary, display_order) VALUES
('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '/sweets/kakinada-gottam-kaja.jpg', 'Kakinada Gottam Kaja Pure Ghee', true, 1),
('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', '/sweets/ghee-kaja.jpg', 'Ghee Kaja Nethi Kaja', true, 1),
('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', '/sweets/madatha-kaja.jpg', 'Madatha Kaja', true, 1),
('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', '/sweets/baby-madatha-kaja.jpg', 'Baby Madatha Kaja', true, 1),
('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005', '/sweets/baby-gottam-kaja.jpg', 'Baby Gottam Kaja', true, 1),
('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000006', '/sweets/paneer-kaja.jpg', 'Paneer Kaja', true, 1),
('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000007', '/sweets/kaju-barfi.jpg', 'Kaju Barfi Diamond Cut', true, 1),
('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000008', '/sweets/gulab-jamun.jpg', 'Gulab Jamun in Rose Syrup', true, 1),
('d1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000009', '/sweets/jangri.jpg', 'Andhra Special Ghee Jangri', true, 1),
('d1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000010', '/sweets/paneer-jalebi.jpg', 'Paneer Jalebi Ghee Fried', true, 1),
('d1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000011', '/sweets/sunnundalu.jpg', 'Sunnundalu Bellam Urad Dal', true, 1),
('d1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000012', '/sweets/bobbatlu.jpg', 'Traditional Bobbatlu Bakshalu', true, 1),
('d1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000013', '/sweets/bellam-gavvalu.jpg', 'Bellam Gavvalu Jaggery Shells', true, 1),
('d1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000014', '/sweets/malai-puri.jpg', 'Malai Puri Saffron Cream', true, 1),
('d1000000-0000-0000-0000-000000000015', 'c1000000-0000-0000-0000-000000000015', '/sweets/white-rasakanda.jpg', 'White Rasakanda Chenna', true, 1),
('d1000000-0000-0000-0000-000000000016', 'c1000000-0000-0000-0000-000000000016', '/sweets/white-angoor.jpg', 'White Angoor Mini Rasgulla', true, 1),
('d1000000-0000-0000-0000-000000000017', 'c1000000-0000-0000-0000-000000000017', '/sweets/brown-angoor.jpg', 'Brown Angoor Mini Gulab Jamun', true, 1),
('d1000000-0000-0000-0000-000000000018', 'c1000000-0000-0000-0000-000000000018', '/sweets/mysore-pak.jpg', 'Royal Mysore Pak', true, 1),
('d1000000-0000-0000-0000-000000000019', 'c1000000-0000-0000-0000-000000000019', '/sweets/milk-mysore-pak.jpg', 'Milk Mysore Pak', true, 1),
('d1000000-0000-0000-0000-000000000020', 'c1000000-0000-0000-0000-000000000020', '/sweets/ongole-mysore-pak.jpg', 'Ongole Mysore Pak', true, 1),
('d1000000-0000-0000-0000-000000000021', 'c1000000-0000-0000-0000-000000000021', '/sweets/pala-kova.jpg', 'Traditional Pala Kova', true, 1),
('d1000000-0000-0000-0000-000000000022', 'c1000000-0000-0000-0000-000000000022', '/sweets/white-piece-kalakand.jpg', 'White Piece Kalakand Danedar', true, 1),
('d1000000-0000-0000-0000-000000000023', 'c1000000-0000-0000-0000-000000000023', '/sweets/karjur-kalakand.jpg', 'Karjur Kalakand Date Fudge', true, 1),
('d1000000-0000-0000-0000-000000000024', 'c1000000-0000-0000-0000-000000000024', '/sweets/horlicks-kalakand.jpg', 'Horlicks Kalakand Malt Fudge', true, 1),
('d1000000-0000-0000-0000-000000000025', 'c1000000-0000-0000-0000-000000000025', '/sweets/vanilla-icecream-burfi.jpg', 'Vanilla Icecream Burfi', true, 1),
('d1000000-0000-0000-0000-000000000026', 'c1000000-0000-0000-0000-000000000026', '/sweets/badam-icecream-burfi.jpg', 'Badam Icecream Burfi', true, 1),
('d1000000-0000-0000-0000-000000000027', 'c1000000-0000-0000-0000-000000000027', '/sweets/boondhi-laddu.jpg', 'Special Ghee Boondhi Laddu', true, 1),
('d1000000-0000-0000-0000-000000000028', 'c1000000-0000-0000-0000-000000000028', '/sweets/mothi-laddu.jpg', 'Mothi Laddu Motichoor', true, 1),
('d1000000-0000-0000-0000-000000000029', 'c1000000-0000-0000-0000-000000000029', '/sweets/besan-laddu.jpg', 'Pure Ghee Besan Laddu', true, 1),
('d1000000-0000-0000-0000-000000000030', 'c1000000-0000-0000-0000-000000000030', '/sweets/dry-fruit-laddu.jpg', 'Royal Dry Fruit Laddu', true, 1),
('d1000000-0000-0000-0000-000000000031', 'c1000000-0000-0000-0000-000000000031', '/sweets/thokkudu-laddu.jpg', 'Machilipatnam Thokkudu Laddu', true, 1),
('d1000000-0000-0000-0000-000000000032', 'c1000000-0000-0000-0000-000000000032', '/sweets/balaji-laddu.jpg', 'Balaji Laddu Prasadam', true, 1),
('d1000000-0000-0000-0000-000000000033', 'c1000000-0000-0000-0000-000000000033', '/sweets/fruit-halwa.jpg', 'Fruit Halwa Assorted', true, 1),
('d1000000-0000-0000-0000-000000000034', 'c1000000-0000-0000-0000-000000000034', '/sweets/red-halwa.jpg', 'Red Halwa Karachi Style', true, 1),
('d1000000-0000-0000-0000-000000000035', 'c1000000-0000-0000-0000-000000000035', '/sweets/dry-fruit-halwa.jpg', 'Royal Dry Fruit Halwa', true, 1),
('d1000000-0000-0000-0000-000000000036', 'c1000000-0000-0000-0000-000000000036', '/sweets/bellam-pootharekulu.jpg', 'Bellam Pootharekulu Jaggery', true, 1),
('d1000000-0000-0000-0000-000000000037', 'c1000000-0000-0000-0000-000000000037', '/sweets/sugar-pootharekulu.jpg', 'Sugar Pootharekulu Classic', true, 1),
('d1000000-0000-0000-0000-000000000038', 'c1000000-0000-0000-0000-000000000038', '/sweets/dry-fruit-bellam-pootharekulu.jpg', 'Dry Fruit Bellam Pootharekulu', true, 1),
('d1000000-0000-0000-0000-000000000039', 'c1000000-0000-0000-0000-000000000039', '/sweets/dry-fruit-sugar-pootharekulu.jpg', 'Dry Fruit Sugar Pootharekulu', true, 1),
('d1000000-0000-0000-0000-000000000040', 'c1000000-0000-0000-0000-000000000040', '/sweets/mixture.jpg', 'Spicy Andhra Mixture', true, 1),
('d1000000-0000-0000-0000-000000000041', 'c1000000-0000-0000-0000-000000000041', '/sweets/palli-pakodi.jpg', 'Palli Pakodi Peanut Pakoda', true, 1),
('d1000000-0000-0000-0000-000000000042', 'c1000000-0000-0000-0000-000000000042', '/sweets/agra-mixture.jpg', 'Agra Mixture Dalmoth', true, 1),
('d1000000-0000-0000-0000-000000000043', 'c1000000-0000-0000-0000-000000000043', '/sweets/special-andhra-ribbon-murukku.jpg', 'Special Andhra Ribbon Murukku', true, 1),
('d1000000-0000-0000-0000-000000000044', 'c1000000-0000-0000-0000-000000000044', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80', 'Royal Heritage Celebration Box', true, 1)
ON CONFLICT (id) DO UPDATE SET
    image_url = EXCLUDED.image_url,
    alt_text = EXCLUDED.alt_text;

-- 6. Seed Promotional Offers
INSERT INTO public.offers (id, shop_id, code, title, description, discount_percent, min_order_amount, max_discount, is_active) VALUES
('e1000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'FESTIVE15', 'Festive Celebration Offer', 'Get 15% instant discount on orders above ₹999.', 15.00, 999.00, 300.00, true),
('e1000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'KAJA50', 'Gottam Kaja Special Bonus', 'Flat 10% discount on traditional Kaja orders.', 10.00, 499.00, 150.00, true),
('e1000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'WELCOME10', 'Welcome Treat for New Customers', '10% off your first online order.', 10.00, 300.00, 200.00, true)
ON CONFLICT (id) DO NOTHING;

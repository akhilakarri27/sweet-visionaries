import re

# Read 04_storage_and_seed.sql
with open('supabase/04_storage_and_seed.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

# Replace product images in 04_storage_and_seed.sql
# Product image mapping table
ITEMS = [
    # Row 1 (6 items)
    ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'kakinada-gottam-kaja', 'Kakinada Gottam Kaja Pure Ghee'),
    ('c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'ghee-kaja', 'Ghee Kaja Nethi Kaja'),
    ('c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'madatha-kaja', 'Madatha Kaja'),
    ('c1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000004', 'baby-madatha-kaja', 'Baby Madatha Kaja'),
    ('c1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', 'baby-gottam-kaja', 'Baby Gottam Kaja'),
    ('c1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000006', 'paneer-kaja', 'Paneer Kaja'),
    
    # Row 2 (6 items)
    ('c1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000007', 'kaju-barfi', 'Kaju Barfi Diamond Cut'),
    ('c1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000008', 'gulab-jamun', 'Gulab Jamun in Rose Syrup'),
    ('c1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000009', 'jangri', 'Andhra Special Ghee Jangri'),
    ('c1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000010', 'paneer-jalebi', 'Paneer Jalebi Ghee Fried'),
    ('c1000000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000011', 'sunnundalu', 'Sunnundalu Bellam Urad Dal'),
    ('c1000000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000012', 'bobbatlu', 'Traditional Bobbatlu Bakshalu'),
    
    # Row 3 (6 items)
    ('c1000000-0000-0000-0000-000000000013', 'd1000000-0000-0000-0000-000000000013', 'bellam-gavvalu', 'Bellam Gavvalu Jaggery Shells'),
    ('c1000000-0000-0000-0000-000000000014', 'd1000000-0000-0000-0000-000000000014', 'malai-puri', 'Malai Puri Saffron Cream'),
    ('c1000000-0000-0000-0000-000000000015', 'd1000000-0000-0000-0000-000000000015', 'white-rasakanda', 'White Rasakanda Chenna'),
    ('c1000000-0000-0000-0000-000000000016', 'd1000000-0000-0000-0000-000000000016', 'white-angoor', 'White Angoor Mini Rasgulla'),
    ('c1000000-0000-0000-0000-000000000017', 'd1000000-0000-0000-0000-000000000017', 'brown-angoor', 'Brown Angoor Mini Gulab Jamun'),
    ('c1000000-0000-0000-0000-000000000018', 'd1000000-0000-0000-0000-000000000018', 'mysore-pak', 'Royal Mysore Pak'),
    
    # Row 4 (6 items)
    ('c1000000-0000-0000-0000-000000000019', 'd1000000-0000-0000-0000-000000000019', 'milk-mysore-pak', 'Milk Mysore Pak'),
    ('c1000000-0000-0000-0000-000000000020', 'd1000000-0000-0000-0000-000000000020', 'ongole-mysore-pak', 'Ongole Mysore Pak'),
    ('c1000000-0000-0000-0000-000000000021', 'd1000000-0000-0000-0000-000000000021', 'pala-kova', 'Traditional Pala Kova'),
    ('c1000000-0000-0000-0000-000000000022', 'd1000000-0000-0000-0000-000000000022', 'white-piece-kalakand', 'White Piece Kalakand Danedar'),
    ('c1000000-0000-0000-0000-000000000023', 'd1000000-0000-0000-0000-000000000023', 'karjur-kalakand', 'Karjur Kalakand Date Fudge'),
    ('c1000000-0000-0000-0000-000000000024', 'd1000000-0000-0000-0000-000000000024', 'horlicks-kalakand', 'Horlicks Kalakand Malt Fudge'),
    
    # Row 5 (6 items)
    ('c1000000-0000-0000-0000-000000000025', 'd1000000-0000-0000-0000-000000000025', 'vanilla-icecream-burfi', 'Vanilla Icecream Burfi'),
    ('c1000000-0000-0000-0000-000000000026', 'd1000000-0000-0000-0000-000000000026', 'badam-icecream-burfi', 'Badam Icecream Burfi'),
    ('c1000000-0000-0000-0000-000000000027', 'd1000000-0000-0000-0000-000000000027', 'boondhi-laddu', 'Special Ghee Boondhi Laddu'),
    ('c1000000-0000-0000-0000-000000000028', 'd1000000-0000-0000-0000-000000000028', 'mothi-laddu', 'Mothi Laddu Motichoor'),
    ('c1000000-0000-0000-0000-000000000029', 'd1000000-0000-0000-0000-000000000029', 'besan-laddu', 'Pure Ghee Besan Laddu'),
    ('c1000000-0000-0000-0000-000000000030', 'd1000000-0000-0000-0000-000000000030', 'dry-fruit-laddu', 'Royal Dry Fruit Laddu'),
    
    # Row 6 (6 items)
    ('c1000000-0000-0000-0000-000000000031', 'd1000000-0000-0000-0000-000000000031', 'thokkudu-laddu', 'Machilipatnam Thokkudu Laddu'),
    ('c1000000-0000-0000-0000-000000000032', 'd1000000-0000-0000-0000-000000000032', 'balaji-laddu', 'Balaji Laddu Prasadam'),
    ('c1000000-0000-0000-0000-000000000033', 'd1000000-0000-0000-0000-000000000033', 'fruit-halwa', 'Fruit Halwa Assorted'),
    ('c1000000-0000-0000-0000-000000000034', 'd1000000-0000-0000-0000-000000000034', 'red-halwa', 'Red Halwa Karachi Style'),
    ('c1000000-0000-0000-0000-000000000035', 'd1000000-0000-0000-0000-000000000035', 'dry-fruit-halwa', 'Royal Dry Fruit Halwa'),
    ('c1000000-0000-0000-0000-000000000036', 'd1000000-0000-0000-0000-000000000036', 'bellam-pootharekulu', 'Bellam Pootharekulu Jaggery'),
    
    # Row 7 (7 items)
    ('c1000000-0000-0000-0000-000000000037', 'd1000000-0000-0000-0000-000000000037', 'sugar-pootharekulu', 'Sugar Pootharekulu Classic'),
    ('c1000000-0000-0000-0000-000000000038', 'd1000000-0000-0000-0000-000000000038', 'dry-fruit-bellam-pootharekulu', 'Dry Fruit Bellam Pootharekulu'),
    ('c1000000-0000-0000-0000-000000000039', 'd1000000-0000-0000-0000-000000000039', 'dry-fruit-sugar-pootharekulu', 'Dry Fruit Sugar Pootharekulu'),
    ('c1000000-0000-0000-0000-000000000040', 'd1000000-0000-0000-0000-000000000040', 'mixture', 'Spicy Andhra Mixture'),
    ('c1000000-0000-0000-0000-000000000041', 'd1000000-0000-0000-0000-000000000041', 'palli-pakodi', 'Palli Pakodi Peanut Pakoda'),
    ('c1000000-0000-0000-0000-000000000042', 'd1000000-0000-0000-0000-000000000042', 'agra-mixture', 'Agra Mixture Dalmoth'),
    ('c1000000-0000-0000-0000-000000000043', 'd1000000-0000-0000-0000-000000000043', 'special-andhra-ribbon-murukku', 'Special Andhra Ribbon Murukku'),
    ('c1000000-0000-0000-0000-000000000044', 'd1000000-0000-0000-0000-000000000044', 'royal-heritage-celebration-box', 'Royal Heritage Celebration Box'),
]

# Build new product_images SQL block
img_lines = []
for p_id, img_id, slug, alt in ITEMS:
    if slug == 'royal-heritage-celebration-box':
        url = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'
    else:
        url = f'/sweets/{slug}.jpg'
    img_lines.append(f"('{img_id}', '{p_id}', '{url}', '{alt}', true, 1)")

new_img_sql = "INSERT INTO public.product_images (id, product_id, image_url, alt_text, is_primary, display_order) VALUES\n" + ",\n".join(img_lines) + "\nON CONFLICT (id) DO UPDATE SET\n    image_url = EXCLUDED.image_url,\n    alt_text = EXCLUDED.alt_text;"

# Replace in sql
sql = re.sub(r"INSERT INTO public\.product_images[\s\S]*?ON CONFLICT \(id\) DO UPDATE SET[\s\S]*?alt_text = EXCLUDED\.alt_text;", new_img_sql, sql)

# Also ensure products table seed has image_url column
with open('supabase/04_storage_and_seed.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print('Updated supabase/04_storage_and_seed.sql successfully.')

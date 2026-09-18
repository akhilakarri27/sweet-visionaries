import os
from PIL import Image

img = Image.open('kakinada_sweets_collage.jpg')
W, H = img.size

# Target directory
out_dir = os.path.join('frontend', 'public', 'sweets')
os.makedirs(out_dir, exist_ok=True)

# 43 Product definitions
ITEMS = [
    # Row 1 (6 items)
    ('kakinada-gottam-kaja', 'Kakinada Gottam Kaja', 1, 0),
    ('ghee-kaja', 'Ghee Kaja', 1, 1),
    ('madatha-kaja', 'Madatha Kaja', 1, 2),
    ('baby-madatha-kaja', 'Baby Madatha Kaja', 1, 3),
    ('baby-gottam-kaja', 'Baby Gottam Kaja', 1, 4),
    ('paneer-kaja', 'Paneer Kaja', 1, 5),
    
    # Row 2 (6 items)
    ('kaju-barfi', 'Kaju Barfi', 2, 0),
    ('gulab-jamun', 'Gulab Jamun', 2, 1),
    ('jangri', 'Jangri', 2, 2),
    ('paneer-jalebi', 'Paneer Jalebi', 2, 3),
    ('sunnundalu', 'Sunnundalu', 2, 4),
    ('bobbatlu', 'Bobbatlu', 2, 5),
    
    # Row 3 (6 items)
    ('bellam-gavvalu', 'Bellam Gavvalu', 3, 0),
    ('malai-puri', 'Malai Puri', 3, 1),
    ('white-rasakanda', 'White Rasakanda', 3, 2),
    ('white-angoor', 'White Angoor', 3, 3),
    ('brown-angoor', 'Brown Angoor', 3, 4),
    ('mysore-pak', 'Mysore Pak', 3, 5),
    
    # Row 4 (6 items)
    ('milk-mysore-pak', 'Milk Mysore Pak', 4, 0),
    ('ongole-mysore-pak', 'Ongole Mysore Pak', 4, 1),
    ('pala-kova', 'Pala Kova', 4, 2),
    ('white-piece-kalakand', 'White Piece Kalakand', 4, 3),
    ('karjur-kalakand', 'Karjur Kalakand', 4, 4),
    ('horlicks-kalakand', 'Horlicks Kalakand', 4, 5),
    
    # Row 5 (6 items)
    ('vanilla-icecream-burfi', 'Vanilla Icecream Burfi', 5, 0),
    ('boondhi-laddu', 'Boondhi Laddu', 5, 1),
    ('mothi-laddu', 'Mothi Laddu', 5, 2),
    ('badam-icecream-burfi', 'Badam Icecream Burfi', 5, 3),
    ('besan-laddu', 'Besan Laddu', 5, 4),
    ('dry-fruit-laddu', 'Dry Fruit Laddu', 5, 6-1),
    
    # Row 6 (6 items)
    ('thokkudu-laddu', 'Thokkudu Laddu', 6, 0),
    ('balaji-laddu', 'Balaji Laddu', 6, 1),
    ('fruit-halwa', 'Fruit Halwa', 6, 2),
    ('red-halwa', 'Red Halwa', 6, 3),
    ('dry-fruit-halwa', 'Dry Fruit Halwa', 6, 4),
    ('bellam-pootharekulu', 'Bellam Pootharekulu', 6, 5),
    
    # Row 7 (7 items)
    ('sugar-pootharekulu', 'Sugar Pootharekulu', 7, 0),
    ('dry-fruit-bellam-pootharekulu', 'Dry Fruit Bellam Pootharekulu', 7, 1),
    ('dry-fruit-sugar-pootharekulu', 'Dry Fruit Sugar Pootharekulu', 7, 2),
    ('mixture', 'Mixture', 7, 3),
    ('palli-pakodi', 'Palli Pakodi', 7, 4),
    ('agra-mixture', 'Agra Mixture', 7, 5),
    ('special-andhra-ribbon-murukku', 'Special Andhra Ribbon Murukku', 7, 6),
]

# Grid Box Coordinates:
# Rows 1 to 6 (6 columns):
# Each row has photo box: y_top = 62 + (row-1)*130, y_bottom = y_top + 104
# Column boxes:
# Col 0: x in [10, 161]
# Col 1: x in [173, 324]
# Col 2: x in [336, 487]
# Col 3: x in [499, 650]
# Col 4: x in [662, 813]
# Col 5: x in [825, 949]

# Row 7 (7 columns):
# y_top = 844, y_bottom = 948
# Col 0: x in [10, 138]
# Col 1: x in [145, 273]
# Col 2: x in [280, 408]
# Col 3: x in [422, 550]
# Col 4: x in [557, 685]
# Col 5: x in [692, 820]
# Col 6: x in [827, 952]

row_6col_x = [
    (10, 161),
    (173, 324),
    (336, 487),
    (499, 650),
    (662, 813),
    (825, 949)
]

row_7col_x = [
    (10, 138),
    (145, 273),
    (280, 408),
    (422, 550),
    (557, 685),
    (692, 820),
    (827, 952)
]

saved_files = []

for slug, name, row, col in ITEMS:
    if row <= 6:
        x1, x2 = row_6col_x[col]
        y1 = 62 + (row - 1) * 130
        y2 = y1 + 104
    else:
        x1, x2 = row_7col_x[col]
        y1 = 844
        y2 = 948
    
    # Crop precisely the sweet photo (excluding label text and boundaries)
    crop = img.crop((x1, y1, x2, y2))
    
    # Save as high-res JPG
    jpg_path = os.path.join(out_dir, f"{slug}.jpg")
    crop.save(jpg_path, 'JPEG', quality=95)
    
    # Also save as WebP
    webp_path = os.path.join(out_dir, f"{slug}.webp")
    crop.save(webp_path, 'WEBP', quality=95)
    
    saved_files.append((slug, name, jpg_path, crop.size))

print(f"Successfully extracted {len(saved_files)} product images into {out_dir}")
for slug, name, path, size in saved_files:
    print(f"[OK] {slug}.jpg ({size[0]}x{size[1]}) -> {name}")

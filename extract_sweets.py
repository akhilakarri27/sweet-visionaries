import os
from PIL import Image
import numpy as np

img = Image.open('kakinada_sweets_collage.jpg')
W, H = img.size
print(f"Original Collage: {W} x {H}")

# Let's define the 43 items in exact order:
ITEMS = [
    # Row 1 (6 items)
    ('kakinada-gottam-kaja', 'Kakinada Gottam Kaja', 1, 1),
    ('ghee-kaja', 'Ghee Kaja', 1, 2),
    ('madatha-kaja', 'Madatha Kaja', 1, 3),
    ('baby-madatha-kaja', 'Baby Madatha Kaja', 1, 4),
    ('baby-gottam-kaja', 'Baby Gottam Kaja', 1, 5),
    ('paneer-kaja', 'Paneer Kaja', 1, 6),
    
    # Row 2 (6 items)
    ('kaju-barfi', 'Kaju Barfi', 2, 1),
    ('gulab-jamun', 'Gulab Jamun', 2, 2),
    ('jangri', 'Jangri', 2, 3),
    ('paneer-jalebi', 'Paneer Jalebi', 2, 4),
    ('sunnundalu', 'Sunnundalu', 2, 5),
    ('bobbatlu', 'Bobbatlu', 2, 6),
    
    # Row 3 (6 items)
    ('bellam-gavvalu', 'Bellam Gavvalu', 3, 1),
    ('malai-puri', 'Malai Puri', 3, 2),
    ('white-rasakanda', 'White Rasakanda', 3, 3),
    ('white-angoor', 'White Angoor', 3, 4),
    ('brown-angoor', 'Brown Angoor', 3, 5),
    ('mysore-pak', 'Mysore Pak', 3, 6),
    
    # Row 4 (6 items)
    ('milk-mysore-pak', 'Milk Mysore Pak', 4, 1),
    ('ongole-mysore-pak', 'Ongole Mysore Pak', 4, 2),
    ('pala-kova', 'Pala Kova', 4, 3),
    ('white-piece-kalakand', 'White Piece Kalakand', 4, 4),
    ('karjur-kalakand', 'Karjur Kalakand', 4, 5),
    ('horlicks-kalakand', 'Horlicks Kalakand', 4, 6),
    
    # Row 5 (6 items)
    ('vanilla-icecream-burfi', 'Vanilla Icecream Burfi', 5, 1),
    ('boondhi-laddu', 'Boondhi Laddu', 5, 2),
    ('mothi-laddu', 'Mothi Laddu', 5, 3),
    ('badam-icecream-burfi', 'Badam Icecream Burfi', 5, 4),
    ('besan-laddu', 'Besan Laddu', 5, 5),
    ('dry-fruit-laddu', 'Dry Fruit Laddu', 5, 6),
    
    # Row 6 (6 items)
    ('thokkudu-laddu', 'Thokkudu Laddu', 6, 1),
    ('balaji-laddu', 'Balaji Laddu', 6, 2),
    ('fruit-halwa', 'Fruit Halwa', 6, 3),
    ('red-halwa', 'Red Halwa', 6, 4),
    ('dry-fruit-halwa', 'Dry Fruit Halwa', 6, 5),
    ('bellam-pootharekulu', 'Bellam Pootharekulu', 6, 6),
    
    # Row 7 (7 items)
    ('sugar-pootharekulu', 'Sugar Pootharekulu', 7, 1),
    ('dry-fruit-bellam-pootharekulu', 'Dry Fruit Bellam Pootharekulu', 7, 2),
    ('dry-fruit-sugar-pootharekulu', 'Dry Fruit Sugar Pootharekulu', 7, 3),
    ('mixture', 'Mixture', 7, 4),
    ('palli-pakodi', 'Palli Pakodi', 7, 5),
    ('agra-mixture', 'Agra Mixture', 7, 6),
    ('special-andhra-ribbon-murukku', 'Special Andhra Ribbon Murukku', 7, 7),
]

print("Total Items Defined:", len(ITEMS))

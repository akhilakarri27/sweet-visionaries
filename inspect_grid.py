from PIL import Image
import numpy as np

img = Image.open('kakinada_sweets_collage.jpg')
arr = np.array(img)
H, W, _ = arr.shape

# Let's inspect each row's vertical boundaries.
# Notice:
# Top header ends around y = 60
# Row 1 is between y ~ 60 and y ~ 190
# Row 2 is between y ~ 195 and y ~ 325
# Row 3 is between y ~ 330 and y ~ 460
# Row 4 is between y ~ 465 and y ~ 595
# Row 5 is between y ~ 600 and y ~ 730
# Row 6 is between y ~ 735 and y ~ 865
# Row 7 is between y ~ 870 and y ~ 1000

# Let's check the exact boxes for each row and column.

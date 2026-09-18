import re

def update_file(filepath, is_frontend=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern for product object
    # Replace unsplash URLs in product_images
    if is_frontend:
        pattern = r"(\{\s*id:\s*'c1000000-[^']+',[\s\S]*?slug:\s*'([^']+)',[\s\S]*?product_images:\s*\[\{\s*id:\s*'[^']+',\s*product_id:\s*'[^']+',\s*)image_url:\s*'[^']+'"
    else:
        pattern = r"(\{\s*id:\s*'c1000000-[^']+',[\s\S]*?slug:\s*'([^']+)',[\s\S]*?product_images:\s*\[\{\s*)image_url:\s*'[^']+'"

    def repl_img(m):
        prefix = m.group(1)
        slug = m.group(2)
        if slug == 'royal-heritage-celebration-box':
            img_url = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'
        else:
            img_url = f'/sweets/{slug}.jpg'
        return f"{prefix}image_url: '{img_url}'"

    content = re.sub(pattern, repl_img, content)

    # Also add or update image_url right under slug: '...'
    def repl_slug(m):
        slug_line = m.group(1)
        slug = m.group(2)
        desc_line = m.group(3)
        if slug == 'royal-heritage-celebration-box':
            img_url = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'
        else:
            img_url = f'/sweets/{slug}.jpg'
        return f"{slug_line}\n    image_url: '{img_url}',{desc_line}"

    content = re.sub(r"(slug:\s*'([^']+)',)(\n\s*description:)", repl_slug, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath} successfully.")

update_file('frontend/src/lib/demoData.ts', is_frontend=True)
update_file('backend/src/services/demoProducts.ts', is_frontend=False)

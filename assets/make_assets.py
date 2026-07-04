"""Generate BottleMark icon + splash assets: a flat bottle silhouette with a
half-level water fill. No photos, packs, or 3D — just shapes drawn with Pillow."""
from PIL import Image, ImageDraw, ImageFont

BG_ICON  = (196, 227, 226)   # pale aqua
BG_SPLASH= (247, 250, 249)   # warm white
TEAL     = (79, 143, 138)    # bottle outline
FILL     = (125, 190, 224)   # water fill (sky blue)
CAP      = (90, 120, 130)    # cap (slate)
TEXT     = (46, 74, 84)      # deep blue-gray

def bottle_layer(size, cx, cy, w, h, fill_frac=0.5, lw=None):
    """Return an RGBA layer with a bottle drawn on transparency."""
    if lw is None: lw = max(4, int(w*0.06))
    img = Image.new("RGBA", size, (0,0,0,0))
    d = ImageDraw.Draw(img)
    left, right = cx - w//2, cx + w//2
    top, bottom = cy - h//2, cy + h//2
    cap_h    = int(h*0.07)
    neck_h   = int(h*0.16)
    neck_w   = int(w*0.42)
    radius   = int(w*0.22)
    body_top = top + cap_h + neck_h
    # --- body mask for water fill ---
    mask = Image.new("L", size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([left, body_top, right, bottom], radius=radius, fill=255)
    md.rounded_rectangle([cx-neck_w//2, top+cap_h, cx+neck_w//2, body_top+int(h*0.03)],
                         radius=int(neck_w*0.25), fill=255)
    fill_top = int(bottom - (bottom-body_top)*fill_frac)
    fill_layer = Image.new("RGBA", size, (0,0,0,0))
    ImageDraw.Draw(fill_layer).rectangle([left-6, fill_top, right+6, bottom+6], fill=FILL+(255,))
    img.paste(fill_layer, (0,0), mask)
    # --- outlines ---
    d.rounded_rectangle([left, body_top, right, bottom], radius=radius, outline=TEAL, width=lw)
    d.rounded_rectangle([cx-neck_w//2, top+cap_h, cx+neck_w//2, body_top+int(h*0.05)],
                        radius=int(neck_w*0.25), outline=TEAL, width=lw)
    d.rounded_rectangle([cx-neck_w//2-int(w*0.02), top, cx+neck_w//2+int(w*0.02), top+cap_h+int(h*0.02)],
                        radius=int(cap_h*0.5), fill=CAP)
    d.line([left+lw, fill_top, right-lw, fill_top], fill=TEAL, width=max(2, lw//2))
    return img

def rounded_bg(size, color, radius_frac=0.22):
    img = Image.new("RGBA", (size,size), (0,0,0,0))
    ImageDraw.Draw(img).rounded_rectangle([0,0,size,size], radius=int(size*radius_frac), fill=color+(255,))
    return img

def make_icon(path, size=1024):
    base = rounded_bg(size, BG_ICON)
    base.alpha_composite(bottle_layer((size,size), size//2, int(size*0.52), int(size*0.42), int(size*0.66)))
    base.save(path); print("wrote", path)

def make_adaptive(path, size=1024):
    base = Image.new("RGBA", (size,size), (0,0,0,0))
    base.alpha_composite(bottle_layer((size,size), size//2, int(size*0.52), int(size*0.34), int(size*0.54)))
    base.save(path); print("wrote", path)

def make_splash(path, w=1242, h=1242):
    base = Image.new("RGBA", (w,h), BG_SPLASH+(255,))
    base.alpha_composite(bottle_layer((w,h), w//2, int(h*0.44), int(w*0.30), int(h*0.46)))
    d = ImageDraw.Draw(base)
    try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(w*0.09))
    except Exception: font = ImageFont.load_default()
    t = "BottleMark"; tb = d.textbbox((0,0), t, font=font)
    d.text(((w-(tb[2]-tb[0]))//2, int(h*0.74)), t, fill=TEXT, font=font)
    base.save(path); print("wrote", path)

if __name__ == "__main__":
    make_icon("icon.png"); make_adaptive("adaptive-icon.png")
    make_splash("splash.png"); make_icon("favicon.png", 196)

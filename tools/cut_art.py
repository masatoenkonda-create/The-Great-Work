"""Cut a game asset out of a generated image and fit it on a transparent canvas.

Usage: python -P tools/cut_art.py <source image> <output.png> <mode> <width> <height>

Modes (the background is flood-filled from the image edges, so it must touch them):
  white[:N]    near-white background (pixels brighter than N, default 215; use ~246 for white objects)
  dark[:N]     flat dark background, colour taken from the top-left corner (tolerance N, default 10)
  outline[:N]  anything lighter than the object's dark outline (N = brightness, default 75);
               for objects drawn on a floor or scenery. Raise N (e.g. 160) for light-coloured objects.

Afterwards only the biggest piece and pieces near it are kept, the result is cropped,
scaled with Lanczos and centred with padding. Check every output by eye on a dark
preview. Needs Pillow (python -m pip install pillow). Written for loop 2, 22 October 2026.
"""
import sys
from collections import deque
from PIL import Image

src, dst, mode = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGB'); W, H = im.size; px = im.load()
lum = lambda p: 0.299*p[0] + 0.587*p[1] + 0.114*p[2]
kind, _, level = mode.partition(':')
if kind == 'white':
    lim = int(level or 215); passable = lambda p: min(p) > lim and max(p) - min(p) < 30
elif kind == 'dark':
    bgc = px[2, 2]; lim = int(level or 10); passable = lambda p: max(abs(p[i] - bgc[i]) for i in range(3)) <= lim
else:
    lim = int(level or 75); passable = lambda p: lum(p) > lim

bg = bytearray(W*H); q = deque()
for x in range(W):
    for y in (0, H-1): q.append((x, y))
for y in range(H):
    for x in (0, W-1): q.append((x, y))
while q:
    x, y = q.popleft(); i = y*W + x
    if bg[i] or not passable(px[x, y]): continue
    bg[i] = 1
    for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
        if 0 <= nx < W and 0 <= ny < H and not bg[ny*W+nx]: q.append((nx, ny))

# Keep the biggest opaque blob and anything close to it; drop distant floor scraps.
seen = bytearray(W*H); comps = []
for s in range(W*H):
    if bg[s] or seen[s]: continue
    stack = [s]; seen[s] = 1; pts = []
    while stack:
        i = stack.pop(); pts.append(i); x, y = i % W, i // W
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if 0 <= nx < W and 0 <= ny < H:
                j = ny*W+nx
                if not bg[j] and not seen[j]: seen[j] = 1; stack.append(j)
    comps.append(pts)
comps.sort(key=len, reverse=True)
main = comps[0]; xs = [i % W for i in main]; ys = [i // W for i in main]
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
keep = set()
for c in comps:
    cx = sum(i % W for i in c)/len(c); cy = sum(i // W for i in c)/len(c)
    if c is main or (len(c) > 40 and x0-60 <= cx <= x1+60 and y0-60 <= cy <= y1+60): keep.update(c)

out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); op = out.load()
for i in keep:
    x, y = i % W, i // W; op[x, y] = px[x, y] + (255,)
out = out.crop(out.getbbox())
CW, CH = int(sys.argv[4]), int(sys.argv[5]); pad = max(2, CW // 32)
scale = min((CW-2*pad)/out.width, (CH-2*pad)/out.height)
out = out.resize((max(1, round(out.width*scale)), max(1, round(out.height*scale))), Image.LANCZOS)
canvas = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); canvas.paste(out, ((CW-out.width)//2, (CH-out.height)//2), out)
canvas.save(dst); print(dst, canvas.size)

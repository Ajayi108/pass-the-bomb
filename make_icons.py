"""Draw the original app icon at high resolution and export browser/home-screen sizes."""
from PIL import Image, ImageDraw
from pathlib import Path
out=Path(__file__).resolve().parent/'assets/images'
im=Image.new('RGB',(1024,1024),'#102b57');d=ImageDraw.Draw(im)
d.line([(598,342),(600,268),(650,218),(696,218),(736,164)],fill='#ffc75a',width=36,joint='curve')
for line in [[(688,114),(702,64)],[(786,142),(834,118)],[(796,216),(846,236)]]:d.line(line,fill='#ff793f',width=28)
d.polygon([(536,316),(640,358),(598,460),(494,418)],fill='#7698be')
d.ellipse((218,336,750,868),fill='#091629',outline='#c3ddf7',width=24)
d.arc((288,406,680,798),180,252,fill='#7698be',width=36)
d.ellipse((706,132,770,196),fill='#ffe38d')
for size,name in [(180,'apple-touch-icon.png'),(192,'icon-192.png'),(512,'icon-512.png')]:im.resize((size,size),Image.Resampling.LANCZOS).save(out/name)
im.save(out/'favicon.ico',sizes=[(16,16),(32,32),(48,48)])

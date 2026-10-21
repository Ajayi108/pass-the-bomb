import urllib.request,io
from html.parser import HTMLParser
from PIL import Image
class Meta(HTMLParser):
 def __init__(self):super().__init__();self.tags={}
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.tags[a.get('property',a.get('name'))]=a.get('content')
req=urllib.request.Request('https://bomb.ajayi.net/',headers={'User-Agent':'facebookexternalhit/1.1'})
with urllib.request.urlopen(req,timeout=30) as r:
 print('Page HTTP',r.status);html=r.read().decode('utf-8')
p=Meta();p.feed(html);assert p.tags.get('og:image')=='https://bomb.ajayi.net/share-card-v1.png';print('Live Open Graph tags verified')
with urllib.request.urlopen(urllib.request.Request(p.tags['og:image'],headers={'User-Agent':'facebookexternalhit/1.1'}),timeout=30) as r:
 print('Image HTTP',r.status,'type',r.headers.get('Content-Type')); im=Image.open(io.BytesIO(r.read()));assert im.size==(1200,630);print('Image dimensions',im.size)

import urllib.request, concurrent.futures
from pathlib import Path
urls = { 'disco-medusae.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Disco%20Medusae.mp3', 'funkorama.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Funkorama.mp3', 'electrodoodle.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Electrodoodle.mp3', 'explosion.ogg':'https://opengameart.org/sites/default/files/explosion1.ogg'}
urls.update({'exit-the-premises.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Exit%20the%20Premises.mp3', 'sneaky-snitch.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Sneaky%20Snitch.mp3'})
urls.update({'edm-detection-mode.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/EDM%20Detection%20Mode.mp3','glitter-blast.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Glitter%20Blast.mp3','cipher.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher2.mp3'})
def get(item):
 name,url=item
 if Path("assets/audio",name).exists(): return
 try:
  data=urllib.request.urlopen(url, timeout=45).read()
  if len(data)<1000 or data.lstrip().startswith(b'<'): raise ValueError('Not audio')
  Path('assets/audio',name).write_bytes(data)
  print(name,len(data))
 except Exception as e: print(name,repr(e))
with concurrent.futures.ThreadPoolExecutor() as pool: list(pool.map(get,urls.items()))

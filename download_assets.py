import urllib.request, concurrent.futures
from pathlib import Path
urls = { 'disco-medusae.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Disco%20Medusae.mp3', 'funkorama.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Funkorama.mp3', 'electrodoodle.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Electrodoodle.mp3', 'explosion.ogg':'https://opengameart.org/sites/default/files/explosion1.ogg'}
urls.update({'exit-the-premises.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Exit%20the%20Premises.mp3', 'sneaky-snitch.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Sneaky%20Snitch.mp3'})
urls.update({'edm-detection-mode.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/EDM%20Detection%20Mode.mp3','glitter-blast.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Glitter%20Blast.mp3','cipher.mp3':'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher2.mp3'})
urls.update({'who-likes-to-party.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Who%20Likes%20to%20Party.mp3', 'funky-chunk.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Funky%20Chunk.mp3', 'club-diver.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Club%20Diver.mp3', 'cut-trance.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cut%20Trance.mp3', 'latin-industries.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Latin%20Industries.mp3', 'carefree.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3', 'funky-one.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Funky%20One.mp3', 'funk-game-loop.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Funk%20Game%20Loop.mp3', 'disco-lounge.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Disco%20Lounge.mp3', 'retrofuture-clean.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/RetroFuture%20Clean.mp3', 'wallpaper.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Wallpaper.mp3', 'local-forecast-elevator.mp3': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Local%20Forecast%20-%20Elevator.mp3'})
urls.update({'explosion2.ogg': 'https://opengameart.org/sites/default/files/explosion2.ogg', 'explosion3.ogg': 'https://opengameart.org/sites/default/files/explosion3.ogg', 'explosions4.ogg': 'https://opengameart.org/sites/default/files/explosions4.ogg'})
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

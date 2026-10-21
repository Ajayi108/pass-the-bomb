"""Build a dependency-free Cloudflare Pages site from the shared game sources."""
from pathlib import Path
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'cloudflare' / 'dist'
OUT.mkdir(parents=True, exist_ok=True)
tracks = json.loads((ROOT / "audio_catalog.json").read_text(encoding="utf-8"))
explosions = json.loads((ROOT / "explosion_catalog.json").read_text(encoding="utf-8"))
manifest = {"tracks":[{"title":t["title"],"url":"assets/audio/"+t["file"]} for t in tracks], "explosions":[{"title":t["title"],"url":"assets/audio/"+t["file"]} for t in explosions]}
for name in ['game.js','game.css']:
    shutil.copyfile(ROOT/'frontend'/name, OUT/name)
shutil.copyfile(ROOT/'cloudflare/bootstrap.js',OUT/'bootstrap.js')
shutil.copyfile(ROOT/'cloudflare/site.css',OUT/'site.css')
(OUT/'audio.json').write_text(json.dumps(manifest),encoding='utf-8')
audio = OUT/'assets/audio'
audio.mkdir(parents=True,exist_ok=True)
for item in manifest['tracks'] + manifest['explosions']:
    shutil.copyfile(ROOT/item['url'],OUT/item['url'])
shutil.copyfile(ROOT/'ASSET_CREDITS.md',OUT/'ASSET_CREDITS.md')
shutil.copyfile(ROOT/'assets/images/share-card-v1.png',OUT/'share-card-v1.png')
creator = '<style>'+(ROOT/'frontend/creator.css').read_text(encoding='utf-8')+'</style>'+(ROOT/'frontend/creator.html').read_text(encoding='utf-8')
for icon in ['favicon.svg','favicon.ico','apple-touch-icon.png','icon-192.png','icon-512.png']:
    shutil.copyfile(ROOT/'assets/images'/icon,OUT/icon)
(OUT/'manifest.webmanifest').write_text(json.dumps({'name':'Pass the Bomb','short_name':'Pass the Bomb','start_url':'/','display':'standalone','background_color':'#102b57','theme_color':'#102b57','icons':[{'src':'/icon-192.png','sizes':'192x192','type':'image/png'},{'src':'/icon-512.png','sizes':'512x512','type':'image/png'}]}),encoding='utf-8')
html = (ROOT/'frontend/game.html').read_text(encoding='utf-8')
(OUT/'index.html').write_text('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#102b57"><meta name="description" content="Pass the Bomb: an in-person party game with music, random rounds and offline play."><title>Pass the Bomb | Play with friends</title>
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest">
<link rel="canonical" href="https://bomb.ajayi.net/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Pass the Bomb">
<meta property="og:title" content="Pass the Bomb — Don’t get caught!">
<meta property="og:description" content="One ball. One beat. An unpredictable BOOM! Play the party game with friends, music, and 4 selectable explosions.">
<meta property="og:url" content="https://bomb.ajayi.net/">
<meta property="og:image" content="https://bomb.ajayi.net/share-card-v1.png">
<meta property="og:image:secure_url" content="https://bomb.ajayi.net/share-card-v1.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Pass the Bomb party game — pass the ball, keep the beat, don’t get caught. Play at bomb.ajayi.net.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Pass the Bomb — Don’t get caught!">
<meta name="twitter:description" content="Pass the ball while the music plays. Whoever holds it at BOOM loses!">
<meta name="twitter:image" content="https://bomb.ajayi.net/share-card-v1.png">
<meta name="twitter:image:alt" content="Pass the Bomb party game with a bomb illustration on a blue background."><link rel="stylesheet" href="game.css"><link rel="stylesheet" href="site.css"></head><body><div id="game">'''+html+'''</div><section class="offline"><h2>Take the party offline</h2><p id="offlineStatus" role="status" aria-live="polite">Checking downloaded audio…</p><button id="download">Download for offline play (all bundled audio)</button><p>Download once before your party. Keep this page open and your device awake. Browser storage can be cleared or evicted.</p><details><summary>Audio credits</summary><p>Music by Kevin MacLeod (incompetech.com), licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>: See the full credits linked below for every bundled recording. Recordings are unmodified and loop during play.</p><p>Four explosion recordings by EZduzziteh, <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a>, converted to WAV.</p><a href="ASSET_CREDITS.md">Full source links and attribution</a></details></section>'''+creator+'''<script type="module" src="bootstrap.js"></script></body></html>''',encoding='utf-8')
privacy_body=(ROOT/'frontend/privacy.html').read_text(encoding='utf-8')
(OUT/'privacy.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Privacy | Pass the Bomb</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="site.css"><style>.privacy{max-width:760px;margin:auto;line-height:1.7;padding:24px 0}.privacy h1{font-size:36px;letter-spacing:-1px}.privacy h2{font-size:21px;margin-top:28px}.privacy a{color:#9ad0ff}.privacy p{color:#dbe9fa}</style></head><body><main class="privacy"><a href="/">← Back to the game</a>'+privacy_body+'</main>'+creator+'</body></html>',encoding='utf-8')
files=['./','index.html','game.js','game.css','site.css','bootstrap.js','audio.json','ASSET_CREDITS.md','share-card-v1.png','favicon.svg','favicon.ico','apple-touch-icon.png','icon-192.png','icon-512.png','manifest.webmanifest','privacy.html']
media=[x['url'] for x in manifest['tracks']+manifest['explosions']]
version=hashlib.sha256(b''.join((OUT/p).read_bytes() for p in files if p!='./')+b''.join((OUT/p).read_bytes() for p in media)).hexdigest()[:12]
sw=(ROOT/'cloudflare/sw.js').read_text(encoding='utf-8').replace('__VERSION__',version).replace('__SHELL__',json.dumps(files))
(OUT/'sw.js').write_text(sw,encoding='utf-8')
(OUT/'_headers').write_text('/sw.js\n  Cache-Control: no-cache\n/index.html\n  Cache-Control: no-cache\n',encoding='utf-8')
print(f'Built {OUT} ({version})')

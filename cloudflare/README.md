# Cloudflare Pages version

This standalone site shares frontend/game.js, game.html, game.css and assets/audio with Streamlit. No Python server runs in production.

Build from repository root: `python cloudflare/build.py`.
Preview: `python -m http.server 8080 --directory cloudflare/dist`, then open http://localhost:8080/ . Localhost supports service workers; deployed sites require HTTPS.

Cloudflare Pages Git integration:
- Repository: Ajayi108/pass-the-bomb
- Production branch: main
- Framework preset: None
- Build command: python cloudflare/build.py
- Build output directory: cloudflare/dist
- Root directory: leave blank (repository root)
- No secrets or paid services required.

Alternatively upload the contents of cloudflare/dist with Pages Direct Upload.

Offline: click Download for offline play and wait for “Ready for offline play”. The service worker stores the page/code and all eight music files plus explosion. Each round fully downloads/decodes audio before scheduling playback. Offline random chooses from cached tracks. User uploads remain only in browser memory and are never included in persistent caches. Closing/reloading clears uploads; browser eviction or clearing site data removes offline files. Reopen online and download again if necessary. Keep the tab active and device awake. Background suspension/locked phones cannot be guaranteed.

Service worker upgrades wait until existing game tabs close. The audio cache uses immutable filenames: rename a recording and update build.py if its contents change. HTML/code caches use content-based build versions. The build output is generated, ignored by Git, and includes all license credits.

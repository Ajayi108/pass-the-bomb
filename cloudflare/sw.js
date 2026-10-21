const VERSION = '__VERSION__';
const SHELL = 'bomb-shell-' + VERSION;
const AUDIO = 'bomb-audio-v1'; // Immutable filenames: change name if a recording changes.
const FILES = __SHELL__;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(FILES)));
  // Wait for existing game tabs to close before updating their code.
});
self.addEventListener('activate', event => event.waitUntil((async()=>{
  for (const key of await caches.keys()) if(key.startsWith('bomb-shell-') && key!==SHELL) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  event.respondWith((async()=>{
    const media = url.pathname.includes('/assets/audio/');
    let cache;
    try {cache = await caches.open(media ? AUDIO : SHELL);} catch {return fetch(event.request);}
    const privacy = ['/privacy','/privacy/','/privacy.html'].includes(url.pathname);
    const found = await cache.match(privacy ? 'privacy.html' : event.request);
    if(found) return found;
    try {
      const response = await fetch(event.request);
      if (media && response.ok) { try { await cache.put(event.request,response.clone()); } catch {} }
      return response;
    } catch(e) {
      if(event.request.mode==='navigate' && url.pathname==='/') return (await cache.match('index.html')) || Response.error();
      return Response.error();
    }
  })());
});

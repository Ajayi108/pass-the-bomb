import mount from './game.js';
const AUDIO_CACHE='bomb-audio-v1';
const status=document.querySelector('#offlineStatus');
const button=document.querySelector('#download');
const manifest=await fetch('./audio.json').then(r=>{if(!r.ok)throw Error('Audio list unavailable');return r.json()});
const urls=[...manifest.tracks,...manifest.explosions].map(t=>t.url);
async function stored(url){return 'caches' in window ? (await caches.open(AUDIO_CACHE)).match(new URL(url,location.href)) : undefined}
async function refresh(){
 const count=(await Promise.all(urls.map(stored))).filter(Boolean).length;
 const registration='serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
 const shellReady=!!registration?.active;
 status.textContent=count===urls.length && shellReady ? `Ready for offline play: all ${manifest.tracks.length} tracks and ${manifest.explosions.length} explosions downloaded.` : `${navigator.onLine?'Online':'Offline'} · ${count}/${urls.length} audio files downloaded. ${shellReady?'':'Offline page is preparing.'}`;
 button.textContent=count===urls.length && shellReady?'Check offline downloads':'Download for offline play (all bundled audio)';
}
const data={...manifest,
 async loadAudio(kind,index){
  const url=kind==='music'?manifest.tracks[index]?.url:manifest.explosions[index]?.url;
  if(!url)throw Error('Choose an available track.');
  let response=await stored(url);
  if(!response){
   try {response=await fetch(url);if(!response.ok)throw Error('Download failed');}
   catch {throw Error('This audio is not downloaded. Reconnect, download for offline play, or upload a local file.');}
   if('caches' in window)try{await (await caches.open(AUDIO_CACHE)).put(new URL(url,location.href),response.clone())}catch{}
  }
  return response.arrayBuffer();
 },
 async chooseTrack(){
  let choices=manifest.tracks.map((_,i)=>i);
  if(!navigator.onLine){choices=(await Promise.all(choices.map(async i=>await stored(manifest.tracks[i].url)?i:null))).filter(i=>i!==null);}
  if(!choices.length)throw Error('No offline music yet. Reconnect to download tracks or upload your own music.');
  return choices[crypto.getRandomValues(new Uint32Array(1))[0]/4294967296*choices.length|0];
 }
};
const cleanup=mount({parentElement:document.querySelector('#game'),data});
window.addEventListener('pagehide',()=>cleanup?.(),{once:true});
button.onclick=async()=>{
 button.disabled=true;
 try{
  if(!('caches' in window)||!('serviceWorker' in navigator))throw Error('Offline downloads require HTTPS and a browser with offline storage support.');
  await navigator.serviceWorker.ready;
  for(let i=0;i<urls.length;i++){
   status.textContent=`Downloading audio ${i+1}/${urls.length}… Keep this page open.`;
   if(!await stored(urls[i])){
    const response=await fetch(urls[i]);if(!response.ok)throw Error('Download interrupted. Reconnect and try again; completed files are kept.');
    await (await caches.open(AUDIO_CACHE)).put(new URL(urls[i],location.href),response);
   }
  }
  await refresh();
 }catch(e){status.textContent=e.message||'Offline download failed. Reconnect and try again.';}
 finally{button.disabled=false;}
};
if('serviceWorker' in navigator){
 navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(refresh).catch(()=>{status.textContent='Offline page caching unavailable. Online and custom-upload play still work.'});
}
window.addEventListener('online',refresh);window.addEventListener('offline',refresh);
await refresh();

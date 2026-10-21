import mount from './game.js';
const AUDIO_CACHE='bomb-audio-v1';
const status=document.querySelector('#offlineStatus');
const button=document.querySelector('#download');
const controlIds=['start','stop','reset','track','blast','testMusic','stopPreview','settings','testBlast'];
const initialDisabled=new Map(controlIds.map(id=>[id,document.querySelector('#'+id).disabled]));
async function initialize(){
const response=await fetch('./audio.json',{signal:AbortSignal.timeout(15000)});
if(!response.ok)throw Error('Audio list unavailable');
const manifest=await response.json();
if(!Array.isArray(manifest.tracks)||!manifest.tracks.length||!Array.isArray(manifest.explosions)||!manifest.explosions.length)throw Error('Audio list invalid');
for(const [id,disabled] of initialDisabled)document.querySelector('#'+id).disabled=disabled;

const urls=[...manifest.tracks,...manifest.explosions].map(t=>t.url);
async function stored(url){
 try {return 'caches' in window ? await (await caches.open(AUDIO_CACHE)).match(new URL(url,location.href)) : undefined;}
 catch {return undefined;} // Restricted/private storage must not prevent online play.
}
async function refresh(){
 const count=(await Promise.all(urls.map(stored))).filter(Boolean).length;
 let registration;
 try {registration='serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;}catch{}
 const shellReady=!!registration?.active;
 status.textContent=count===urls.length && shellReady ? `Ready for offline play: all ${manifest.tracks.length} tracks and ${manifest.explosions.length} explosions downloaded.` : `${navigator.onLine?'Online':'Offline'} Â· ${count}/${urls.length} audio files downloaded. ${shellReady?'':'Offline page is preparing.'}`;
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
// A back/forward-cache restore keeps the old DOM but its audio engine was disposed.
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
let registrationPromise;
button.onclick=async()=>{
 button.disabled=true;
 try{
  if(!('caches' in window)||!('serviceWorker' in navigator))throw Error('Offline downloads require HTTPS and a browser with offline storage support.');
  if(!registrationPromise)throw Error('Offline page caching unavailable. Online play still works.');
  await registrationPromise;
  for(let i=0;i<urls.length;i++){
   status.textContent=`Downloading audio ${i+1}/${urls.length}â€¦ Keep this page open.`;
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
 registrationPromise=navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready);
 registrationPromise.then(refresh).catch(()=>{status.textContent='Offline page caching unavailable. Online and custom-upload play still work.'});
}
window.addEventListener('online',refresh);window.addEventListener('offline',refresh);
await refresh();

}
async function loadGame(){
 for(const id of controlIds)document.querySelector('#'+id).disabled=true;
 button.disabled=true;
 document.querySelector('#state').textContent='Loading';
 document.querySelector('#headline').textContent='Loading the game…';
 document.querySelector('#error').textContent='';
 status.textContent='Loading audio list…';
 try {
  await initialize();
  document.querySelector('#state').textContent='Ready';
  document.querySelector('#headline').textContent='Gather your circle.';
 } catch {
  for(const id of controlIds)document.querySelector('#'+id).disabled=true;
  document.querySelector('#state').textContent='Connection needed';
  document.querySelector('#headline').textContent='Let’s reconnect.';
  const message='The audio list could not load. Check your connection, then press Retry loading game below.';
  document.querySelector('#error').textContent=message;
  status.textContent=message;
  button.textContent='Retry loading game';
  button.onclick=loadGame;
 } finally {button.disabled=false;}
}
await loadGame();

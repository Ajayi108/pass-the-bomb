import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const bootstrap=readFileSync(new URL('../cloudflare/bootstrap.js',import.meta.url),'utf8').replace("import mount from './game.js';",'');

test('blocked storage permits online audio and back-cache restore reloads the engine',async()=>{
 const listeners={};const elements={};let mounted,cleaned=false,reloaded=false;
 const context={URL,AbortSignal,crypto:globalThis.crypto,console,
  location:{href:'https://example.test/',reload(){reloaded=true;}},
  navigator:{onLine:true},
  caches:{async open(){throw Error('Storage denied');}},
  document:{querySelector(selector){return elements[selector]??={};}},
  async fetch(url){return url==='./audio.json'?{ok:true,json:async()=>({tracks:[{url:'music.mp3'}],explosions:[{url:'boom.wav'}]})}:{ok:true,arrayBuffer:async()=>new ArrayBuffer(4)};},
  mount({data}){mounted=data;return ()=>{cleaned=true;};}
 };
 context.window={caches:context.caches,addEventListener(name,fn){listeners[name]=fn;}};
 await vm.runInNewContext('(async()=>{'+bootstrap+'})()',context);
 assert.equal((await mounted.loadAudio('music',0)).byteLength,4);
 listeners.pagehide();assert.equal(cleaned,true);
 listeners.pageshow({persisted:true});assert.equal(reloaded,true);
});

const sw=readFileSync(new URL('../cloudflare/sw.js',import.meta.url),'utf8');
test('offline Privacy clean URL serves cached policy, unknown routes never serve the game',async()=>{
 let handler;
 const policy={policy:true};const cache={match:async key=>key==='privacy.html'?policy:undefined};
 const context={URL,Response,fetch:async()=>{throw Error('Offline');},caches:{open:async()=>cache},self:{location:{origin:'https://example.test'},addEventListener(name,fn){if(name==='fetch')handler=fn;}}};
 vm.runInNewContext(sw.replace('__SHELL__','[]'),context);
 async function request(path){let response;handler({request:{url:'https://example.test'+path,method:'GET',mode:'navigate'},respondWith(p){response=p;}});return response;}
 assert.equal(await request('/privacy'),policy);
 assert.equal((await request('/missing')).type,'error');
});

test('online navigation uses current HTML rather than an old cached page',async()=>{
 let handler;const fresh={fresh:true};const stale={stale:true};
 const context={URL,Response,fetch:async()=>fresh,caches:{open:async()=>({match:async()=>stale})},self:{location:{origin:'https://example.test'},addEventListener(name,fn){if(name==='fetch')handler=fn;}}};
 vm.runInNewContext(sw.replace('__SHELL__','[]'),context);
 let response;handler({request:{url:'https://example.test/',method:'GET',mode:'navigate'},respondWith(p){response=p;}});
 // The network response must be a successful response to replace cached HTML.
 fresh.ok=true;assert.equal(await response,fresh);
});

test('cached redirected policy is normalized for browser navigation',async()=>{
 let handler;const cached={redirected:true,body:'Privacy policy',status:200,statusText:'OK',headers:{'Content-Type':'text/html'}};
 const context={URL,Response,fetch:async()=>{throw Error('Offline');},caches:{open:async()=>({match:async()=>cached})},self:{location:{origin:'https://example.test'},addEventListener(name,fn){if(name==='fetch')handler=fn;}}};
 vm.runInNewContext(sw.replace('__SHELL__','[]'),context);
 let result;handler({request:{url:'https://example.test/privacy',method:'GET',mode:'navigate'},respondWith(p){result=p;}});
 const response=await result;assert.equal(response.redirected,false);assert.equal(await response.text(),'Privacy policy');
});

test('failed startup disables controls, shows retry, and recovers without reloading',async()=>{
 const elements={};let fail=true,mounts=0;
 const context={URL,AbortSignal,crypto:globalThis.crypto,console,
  location:{href:'https://example.test/'},navigator:{onLine:true},
  document:{querySelector(selector){return elements[selector]??={disabled:selector==='#stop'};}},
  window:{addEventListener(){}},
  async fetch(){if(fail)throw Error('Network lost');return {ok:true,json:async()=>({tracks:[{url:'music.mp3'}],explosions:[{url:'boom.wav'}]})};},
  mount(){mounts++;return ()=>{};}
 };
 await vm.runInNewContext('(async()=>{'+bootstrap+'})()',context);
 assert.equal(mounts,0);assert.equal(elements['#start'].disabled,true);
 assert.match(elements['#error'].textContent,/could not load/);
 assert.equal(elements['#download'].textContent,'Retry loading game');
 assert.equal(elements['#download'].disabled,false);
 fail=false;await elements['#download'].onclick();
 assert.equal(mounts,1);assert.equal(elements['#start'].disabled,false);
 assert.equal(elements['#stop'].disabled,true);assert.equal(elements['#error'].textContent,'');
 assert.equal(elements['#state'].textContent,'Ready');
});

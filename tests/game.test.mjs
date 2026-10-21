import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../frontend/game.js',import.meta.url),'utf8');
const {default:mount}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
function fixture(overrides={}){
 const els=new Map();
 const get=id=>{if(!els.has(id))els.set(id,{value:'',textContent:'',files:[],dataset:{},appendChild(){}});return els.get(id)};
 Object.entries({min:'0.1',max:'0.2',delay:'1',track:'random',musicVolume:'.5',blastVolume:'.7'}).forEach(([id,v])=>get(id).value=v);
 const frames=new Map();let seq=0;
 globalThis.requestAnimationFrame=fn=>{frames.set(++seq,fn);return seq};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 globalThis.document={hidden:false,createElement:()=>({}),addEventListener(){},removeEventListener(){}};
 const sources=[];
 class AudioContext{constructor(){this.currentTime=0;this.state='running';fixture.ctx=this}resume(){return Promise.resolve()}close(){this.state='closed'}decodeAudioData(bytes){return Promise.resolve({duration:0.05,tag:new Uint8Array(bytes)[0]})}createGain(){return {gain:{},connect(){},disconnect(){}}}createBufferSource(){const s={connect(){return {connect(){}}},disconnect(){},start(t){this.started=t},stop(t){this.stopped=t;this.stops=(this.stops||0)+1}};sources.push(s);return s}}
 globalThis.window={AudioContext};
 const root={querySelector:q=>get(q.startsWith('#')?q.slice(1):q)};
 const cleanup=mount({parentElement:root,data:{tracks:[{title:'A',audio:'AAAA'}],explosion:'AAAA',...overrides}});
 return {get,sources,cleanup,advance(t){fixture.ctx.currentTime=t;const jobs=[...frames.values()];frames.clear();jobs.forEach(f=>f())}};
}
test('one start, loop and synchronized explosion, next and reset',async()=>{
 const f=fixture();const first=f.get('start').onclick();await f.get('start').onclick();await first;
 assert.equal(f.sources.length,2);assert.equal(f.sources[0].loop,true);assert.equal(f.sources[0].stopped,f.sources[1].started);
 assert.equal(f.get('state').textContent,'Playing');assert.equal(f.get('settings').disabled,true);
 assert.ok(!f.get('message').textContent.includes('0.'));
 f.advance(1);assert.equal(f.get('state').textContent,'Exploded');assert.equal(f.get('round').textContent,'ROUND 1');
 await f.get('start').onclick();assert.equal(f.get('round').textContent,'ROUND 2');
 f.get('reset').onclick();assert.equal(f.get('round').textContent,'ROUND 1');f.advance(100);assert.equal(f.get('state').textContent,'Ready');f.cleanup();
});
test('stop cancels scheduled explosion and does not count a round',async()=>{
 const f=fixture();await f.get('start').onclick();f.get('stop').onclick();assert.equal(f.sources[1].stopped,undefined);assert.ok(f.sources[1].stops);f.advance(100);assert.equal(f.get('state').textContent,'Stopped');assert.equal(f.get('round').textContent,'ROUND 1');f.cleanup();
});
test('preview replacement, start and stop cancel older audio',async()=>{
 const f=fixture();await f.get('testMusic').onclick();await f.get('testBlast').onclick();assert.equal(f.sources[0].stopped,undefined);await f.get('start').onclick();assert.ok(f.sources[1].stops);f.get('stop').onclick();f.cleanup();
});
test('invalid settings and invalid uploads report helpful errors',async()=>{
 const f=fixture();f.get('max').value='0';await f.get('start').onclick();assert.match(f.get('error').textContent,/positive durations/);assert.equal(f.sources.length,0);
 f.get('max').value='1';f.get('track').value='custom';f.get('musicUpload').files=[{name:'bad.txt',size:5}];await f.get('start').onclick();assert.match(f.get('error').textContent,/MP3 or WAV/);f.cleanup();
});
test('auto next round counts down, restarts and can be cancelled',async()=>{
 const f=fixture();f.get('auto').checked=true;await f.get('start').onclick();f.advance(1);assert.equal(f.get('state').textContent,'Between Rounds');assert.match(f.get('message').textContent,/Next round in/);f.advance(3);await new Promise(r=>setImmediate(r));assert.equal(f.get('state').textContent,'Playing');f.advance(4);f.get('reset').onclick();f.advance(20);assert.equal(f.get('state').textContent,'Ready');f.cleanup();
});
test('stop while decoding prevents stale start and custom WAV is accepted',async()=>{
 const f=fixture();f.get('track').value='custom';f.get('musicUpload').files=[{name:'ok.wav',size:4,arrayBuffer:async()=>new ArrayBuffer(4)}];const p=f.get('start').onclick();f.get('stop').onclick();await p;assert.equal(f.sources.length,0);await f.get('start').onclick();assert.equal(f.get('state').textContent,'Playing');f.cleanup();
});

test('host-selected explosion stays fixed across rounds and previews',async()=>{
 const f=fixture({explosions:[{audio:'AAAA'},{audio:'AQAA'},{audio:'AgAA'},{audio:'AwAA'}]});
 f.get('blast').value='3';await f.get('start').onclick();assert.equal(f.sources[1].buffer.tag,3);assert.equal(f.get('blast').disabled,true);
 f.advance(1);await f.get('start').onclick();assert.equal(f.sources[3].buffer.tag,3);
 f.get('stop').onclick();f.get('blast').value='1';await f.get('testBlast').onclick();assert.equal(f.sources.at(-1).buffer.tag,1);f.cleanup();
});

// Explosion preview must work even when random music has no offline candidates.
test('explosion preview never requires choosing music',async()=>{
 const f=fixture({chooseTrack:async()=>{throw Error('No offline music yet');}});
 await f.get('testBlast').onclick();
 assert.equal(f.sources.length,1);
 assert.equal(f.get('error').textContent,'');
 f.cleanup();
});

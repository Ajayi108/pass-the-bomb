export default function(component) {
  const root = component.parentElement;
  // Streamlit can render an existing keyed component again: retain its live engine.
  if (root.__bombEngine) return;
  root.__bombEngine = true;
  const $ = id => root.querySelector('#' + id);
  const data = component.data;
  let ctx, nodes = [], frame, generation = 0, completed = 0, state = 'Ready';
  let deadline = 0, breakEnd = 0, disposed = false;
  const cache = new Map();
  const tracks = data.tracks || [];
  tracks.forEach((t,i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = t.title; $('track').appendChild(o); });
  const busy = () => ['Loading Audio','Playing','Between Rounds'].includes(state);
  function show(next, title, message) {
    state = next; root.querySelector('.arena').dataset.state = next;
    $('state').textContent = next; $('headline').textContent = title;
    $('message').textContent = message; $('round').textContent = 'ROUND ' + (completed + (next === 'Exploded' || next === 'Between Rounds' ? 0 : 1));
    $('settings').disabled = busy(); $('start').disabled = busy();
    $('track').disabled = ['Loading Audio','Playing'].includes(next);
    $('testMusic').disabled = busy(); $('stopPreview').disabled = busy();
    $('stop').disabled = !busy(); $('start').textContent = completed ? 'Next Round' : 'Start Round';
    root.querySelector('.bomb').textContent = ['Exploded','Between Rounds'].includes(next) ? '💥' : '💣';
  }
  function cancel() {
    ++generation; cancelAnimationFrame(frame); $('previewStatus').textContent = '';
    for (const n of nodes) { n.onended = null; try { n.stop(); } catch {} try { n.disconnect(); n._gain.disconnect(); } catch {} }
    nodes = [];
  }
  function fail(e) { cancel(); show('Stopped','Audio needs attention.', 'Check your files and speaker, then try again.'); $('error').textContent = e.message || String(e); }
  function unlock() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.onstatechange = () => { if (ctx.state !== 'running' && state === 'Playing') fail(new Error('Audio was suspended. Keep this tab active and press Start again.')); };
    }
    return ctx.resume(); // Called synchronously in the click handler, before decoding.
  }
  function validate() {
    const min = Number($('min').value), max = Number($('max').value), delay = Number($('delay').value);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= min || max > 3600) throw Error('Use positive durations with maximum greater than minimum (up to 3600 seconds).');
    if (!Number.isFinite(delay) || delay < 1 || delay > 300) throw Error('Use an automatic break of 1–300 seconds.');
    return {min,max,delay,auto:$('auto').checked};
  }
  function random() { return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; }
  async function decode(kind, index) {
    const file = kind === 'music' ? ($('track').value === 'custom' ? $('musicUpload').files[0] : undefined) : $('blastUpload').files[0];
    const key = file || (kind === 'music' ? 'track-' + index : 'blast');
    if (cache.has(key)) return cache.get(key);
    let bytes;
    if (file) {
      if (!/\.(mp3|wav)$/i.test(file.name)) throw Error('Choose an MP3 or WAV audio file.');
      if (file.size > 15 * 1024 * 1024 || !file.size) throw Error('Audio uploads must be nonempty and no larger than 15 MB.');
      bytes = await file.arrayBuffer();
    } else {
      const encoded = kind === 'music' ? tracks[index]?.audio : data.explosion;
      if (!encoded) throw Error('Bundled audio is missing. See ASSET_CREDITS.md or upload an MP3/WAV.');
      bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0)).buffer;
    }
    let buffer;
    try { buffer = await ctx.decodeAudioData(bytes); } catch { throw Error('This audio could not be decoded. Try a standard MP3 or PCM WAV file.'); }
    // Bound decoded memory and stop users accidentally selecting enormous files.
    if (buffer.duration > 600) throw Error('Choose audio shorter than 10 minutes.');
    cache.set(key, buffer); return buffer;
  }
  function pick() { return $('track').value === 'random' ? Math.floor(random()*tracks.length) : Number($('track').value); }
  function source(buffer, volume, loop) {
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s._gain = g; s.buffer = buffer; s.loop = loop; g.gain.value = volume;
    s.connect(g).connect(ctx.destination); nodes.push(s);
    s.onended = () => { s.disconnect(); g.disconnect(); }; return s;
  }
  let config;
  async function start() {
    if (busy() || disposed) return;
    let token = generation;
    try {
      config = validate(); const resumed = unlock(); cancel(); token = generation;
      $('error').textContent = ''; show('Loading Audio','Getting the beat ready…','Preparing music and explosion.');
      await resumed;
      const [music,blast] = await Promise.all([decode('music',pick()),decode('blast')]);
      if (token !== generation || disposed) return;
      if (ctx.state !== 'running') throw Error('Audio is suspended. Press Start again to enable playback.');
      const when = ctx.currentTime + .08;
      deadline = when + config.min + random()*(config.max-config.min);
      const m = source(music,Number($('musicVolume').value),true);
      const b = source(blast,Number($('blastVolume').value),false);
      m.start(when); m.stop(deadline); b.start(deadline);
      show('Playing','PASS THE BALL!','Keep it moving. The beat could stop at any moment.');
      function tick() {
        if (token !== generation || disposed) return;
        if (ctx.currentTime >= deadline) {
          completed++; show('Exploded','BOOM!','Whoever has the ball loses this round!');
          if (config.auto) { breakEnd = ctx.currentTime + Math.max(config.delay, blast.duration); show('Between Rounds','BOOM!',''); breakTick(token); }
          return;
        }
        frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    } catch(e) { if (token === generation && !disposed) fail(e); }
  }
  function breakTick(token) {
    if (token !== generation || disposed) return;
    const remaining = Math.ceil(breakEnd - ctx.currentTime);
    const message = 'Whoever has the ball loses! Next round in ' + Math.max(0,remaining) + 's.';
    if ($('message').textContent !== message) $('message').textContent = message;
    if (remaining <= 0) { show('Ready','Ready for another?',''); start(); }
    else frame = requestAnimationFrame(() => breakTick(token));
  }
  async function preview(kind) {
    if (busy()) return;
    let token = generation;
    try {
      const resumed = unlock(); cancel(); token = generation; $('error').textContent = '';
      await resumed; const buffer = await decode(kind,pick());
      if (token !== generation || busy() || disposed) return;
      const s = source(buffer,Number($(kind === 'music' ? 'musicVolume' : 'blastVolume').value),kind === 'music');
      $('previewStatus').textContent = kind === 'music' ? 'Playing a 15-second music preview…' : 'Playing the explosion preview…';
      const ended = s.onended;
      s.onended = () => { ended?.(); if (token === generation) $('previewStatus').textContent = ''; };
      s.start(); if (kind === 'music') s.stop(ctx.currentTime + 15);
    } catch(e) { if (token === generation && !disposed) fail(e); }
  }
  $('start').onclick = start;
  $('stop').onclick = () => { cancel(); show('Stopped','Round stopped.','No elimination. Press Start to try this round again.'); };
  $('reset').onclick = () => { cancel(); completed = 0; $('error').textContent = ''; show('Ready','Gather your circle.','Grab a soft ball. Turn up the speaker. Let’s play.'); };
  $('testMusic').onclick = () => preview('music'); $('testBlast').onclick = () => preview('blast'); $('stopPreview').onclick = cancel;
  ['musicUpload','blastUpload'].forEach(id => $(id).onchange = () => {
    cancel(); cache.clear();
    if (id === 'musicUpload') {
      const file = $('musicUpload').files[0];
      $('customTrack').disabled = !file;
      $('customTrack').textContent = file ? 'Uploaded: ' + file.name : 'Custom upload (add in settings)';
      $('track').value = file ? 'custom' : 'random';
    }
  });
  $('motion').onchange = () => { root.querySelector('.party').dataset.motion = $('motion').checked ? 'on' : 'off'; };
  [['musicVolume','musicLevel'],['blastVolume','blastLevel']].forEach(([slider,label]) => { $(slider).oninput = () => { $(label).textContent = Math.round(Number($(slider).value)*100) + '%'; }; });
  $('track').onchange = () => { if (!busy()) cancel(); };
  const visibility = () => { if (document.hidden && busy()) { cancel(); show('Stopped','Round interrupted.','The tab was hidden. No elimination; press Start when ready.'); } };
  document.addEventListener('visibilitychange',visibility);
  return () => { disposed = true; cancel(); document.removeEventListener('visibilitychange',visibility); if(ctx) { ctx.onstatechange = null; ctx.close(); } delete root.__bombEngine; };
}


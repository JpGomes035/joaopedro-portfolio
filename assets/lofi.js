"use strict";

// Original procedural instrumental: no downloaded music or third-party streams.
// Four warm seventh chords, a sparse pentatonic melody and a swung drum pattern.
(() => {
  const player = document.querySelector('.lofi-player');
  if (!player) return;
  const button = player.querySelector('.lofi-toggle');
  const label = player.querySelector('[data-lofi-label]');
  const subtitle = button.querySelector('small');
  const icon = player.querySelector('.lofi-play-icon path');
  const message = player.querySelector('.lofi-message');
  const volume = player.querySelector('#lofi-volume');
  const volumeValue = player.querySelector('#lofi-volume-value');
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  let context, master, compressor, noise;
  let playing = false;
  let timer = null;
  let nextBeat = 0;
  let step = 0;
  let generation = 0;
  let previousSessionType = null;
  const sources = new Set();
  const bpm = 76;
  const eighth = 60 / bpm / 2;
  const chords = [[48,52,55,59],[45,48,52,55],[50,53,57,60],[43,47,50,53]];
  const melody = [76,null,79,null,74,null,71,72, 72,null,76,null,79,76,null,72, 77,null,81,null,76,null,74,72, 74,null,71,67,null,71,74,null];
  const hz = midi => 440 * 2 ** ((midi - 69) / 12);

  function requestPlaybackSession() {
    // iOS 17+: Web Audio otherwise uses the ambient/ringer audio category.
    // Only claim the music session after an explicit tap, never on page load.
    try {
      const session = navigator.audioSession;
      if (!session) return;
      if (previousSessionType === null) previousSessionType = session.type;
      session.type = 'playback';
    } catch { /* Optional API: older Safari and other browsers can still play. */ }
  }
  function releasePlaybackSession() {
    try {
      if (previousSessionType !== null && navigator.audioSession?.type === 'playback') {
        navigator.audioSession.type = previousSessionType;
      }
    } catch { /* The platform may manage the session itself. */ }
    previousSessionType = null;
  }
  function withAudioTimeout(promise, milliseconds = 4000) {
    let timeout;
    return Promise.race([
      promise,
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Audio activation timed out')), milliseconds); }),
    ]).finally(() => clearTimeout(timeout));
  }
  function unlockAudio() {
    // Start a silent, one-frame source synchronously inside the tap handler.
    // This primes mobile audio output without a looping silent media element.
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 1, context.sampleRate);
    source.connect(context.destination);
    keep(source, []);
    source.start(0);
  }

  function keep(source, nodes) {
    sources.add(source);
    source.onended = () => { sources.delete(source); source.disconnect(); nodes.forEach(node => node.disconnect()); };
  }
  function tone(midi, time, duration, level, type = 'sine') {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.value = hz(midi);
    oscillator.detune.value = Math.sin(midi * 2.7) * 3;
    filter.type = 'lowpass'; filter.frequency.value = 1600; filter.Q.value = .4;
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(level, time + .018);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(filter); filter.connect(envelope); envelope.connect(compressor);
    keep(oscillator, [filter,envelope]);
    oscillator.start(time); oscillator.stop(time + duration + .03);
  }
  function kick(time) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.frequency.setValueAtTime(115, time);
    oscillator.frequency.exponentialRampToValueAtTime(43, time + .16);
    envelope.gain.setValueAtTime(.0001,time);
    envelope.gain.exponentialRampToValueAtTime(.6,time+.004);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + .25);
    oscillator.connect(envelope); envelope.connect(compressor);
    keep(oscillator, [envelope]); oscillator.start(time); oscillator.stop(time+.27);
  }
  function percussion(time, snare) {
    const source = context.createBufferSource();
    source.buffer = noise;
    const filter = context.createBiquadFilter();
    filter.type = snare ? 'bandpass' : 'highpass';
    filter.frequency.value = snare ? 1800 : 6500;
    filter.Q.value = snare ? .65 : .4;
    const envelope = context.createGain();
    const duration = snare ? .15 : .035;
    envelope.gain.setValueAtTime(.0001,time);
    envelope.gain.exponentialRampToValueAtTime(snare ? .15 : .055,time+.003);
    envelope.gain.exponentialRampToValueAtTime(.0001,time+duration);
    source.connect(filter); filter.connect(envelope); envelope.connect(compressor);
    keep(source,[filter,envelope]); source.start(time); source.stop(time+duration+.01);
  }
  function schedule() {
    if (!playing || context.state !== 'running') return;
    // Recover without burst scheduling if the browser throttled this tab.
    if (nextBeat < context.currentTime) nextBeat = context.currentTime + .04;
    while (nextBeat < context.currentTime + .15) {
      const position = step % 8;
      const chord = chords[Math.floor(step / 8) % 4];
      const time = nextBeat + (step % 2 ? .043 : 0);
      if (position === 0) chord.forEach((note,index) => tone(note+12,time+index*.026,2.8,.105,'triangle'));
      if (position === 0 || position === 4) tone(chord[0]-12,time,.75,.26);
      if ([0,3,4].includes(position)) kick(time);
      if (position === 2 || position === 6) percussion(time+.018,true);
      percussion(time,false);
      const note = melody[step % melody.length];
      if (note !== null) {
        tone(note,time+.012,.72,.075,'triangle');
        tone(note,time+.25,.85,.018);
      }
      step++; nextBeat += eighth;
    }
  }
  function updateUI() {
    document.body.classList.toggle('lofi-playing',playing);
    button.setAttribute('aria-pressed',String(playing));
    button.setAttribute('aria-label',playing ? 'Pausar lo-fi' : 'Reproduzir lo-fi');
    label.textContent = playing ? 'Lo-fi tocando' : 'Ativar lo-fi';
    subtitle.textContent = 'JP studio / som opcional';
    icon.setAttribute('d',playing ? 'M7 5h4v14H7Zm7 0h4v14h-4Z' : 'm9 5 10 7-10 7Z');
  }
  function initialize() {
    context = new AudioEngine();
    master = context.createGain(); master.gain.value = 0;
    compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -18; compressor.knee.value = 20; compressor.ratio.value = 4;
    compressor.connect(master); master.connect(context.destination);
    noise = context.createBuffer(1,context.sampleRate,context.sampleRate);
    const data = noise.getChannelData(0);
    // Seeded noise buffer makes the timbre repeatable across sessions.
    let seed = 451;
    for (let i=0;i<data.length;i++) { seed = (seed*16807)%2147483647; data[i] = (seed/2147483647)*2-1; }
    const engine = context;
    engine.addEventListener('statechange', () => {
      if (engine !== context) return;
      if (playing && engine.state !== 'running') {
        pause(false);
        subtitle.textContent = 'Áudio interrompido · toque para voltar';
        message.textContent = 'Áudio interrompido. Use Reproduzir lo-fi para continuar.';
      }
    });
  }
  async function pause(suspend = true) {
    playing = false; generation++;
    clearInterval(timer); timer = null;
    for (const source of sources) { try { source.stop(); } catch { /* Already ended. */ } }
    sources.clear();
    if (master && context && context.state !== 'closed') {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(0, context.currentTime);
    }
    updateUI();
    if (context && suspend && context.state === 'running') {
      try { await withAudioTimeout(context.suspend(), 1000); } catch { /* Muted even if suspension is delayed. */ }
    }
    if (!playing) releasePlaybackSession();
  }
  async function play() {
    const attempt = ++generation;
    try {
      requestPlaybackSession();
      if (!context || context.state === 'closed') initialize();
      // Both calls must run before the first await to retain the user gesture.
      const resume = context.resume();
      unlockAudio();
      await withAudioTimeout(resume);
      if (attempt !== generation || document.hidden) { await pause(); return; }
      if (context.state !== 'running') throw new Error('Audio is unavailable');
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(0,context.currentTime);
      master.gain.linearRampToValueAtTime(Number(volume.value)/100*.55,context.currentTime+.3);
      step = 0; nextBeat = context.currentTime + .06; playing = true;
      updateUI(); schedule(); timer = setInterval(schedule,50);
      message.textContent = 'Lo-fi ativado. Você pode pausar ou ajustar o volume.';
    } catch {
      await pause();
      const failedContext = context;
      context = null;
      if (failedContext && failedContext.state !== 'closed') {
        failedContext.close().catch(() => {});
      }
      label.textContent = 'Tentar áudio';
      subtitle.textContent = 'Toque para tentar novamente';
      message.textContent = 'Não foi possível iniciar o áudio neste navegador. Tente novamente usando o botão.';
    }
  }
  button.addEventListener('click',async () => {
    button.disabled = true;
    try { if (playing) await pause(); else await play(); }
    finally { button.disabled = false; }
  });
  volume.addEventListener('input', () => {
    volumeValue.value = `${volume.value}%`;
    if (master) { master.gain.cancelScheduledValues(context.currentTime); master.gain.setTargetAtTime(Number(volume.value)/100*.55,context.currentTime,.06); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('pagehide', () => pause());
  document.addEventListener('keydown', event => { if(event.key==='Escape') player.querySelector('details').open=false; });
  if (!AudioEngine) {
    button.disabled = true; label.textContent = 'Áudio indisponível';
    message.textContent = 'Este navegador não oferece suporte ao player.';
  }
})();

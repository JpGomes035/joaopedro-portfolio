"use strict";

(() => {
  const studio = document.querySelector('.dev-studio');
  const dialog = document.querySelector('#studio-dialog');
  if (!studio || !dialog) return;
  const scene = studio.querySelector('.studio-scene');
  const model = studio.querySelector('.studio-model');
  const launcher = studio.querySelector('.studio-launch');
  const light = studio.querySelector('.studio-light');
  const announcement = studio.querySelector('.studio-announcement');
  const feedback = dialog.querySelector('.playground-feedback');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const viewButtons = [...document.querySelectorAll('[data-studio-view]')];
  const cameraButtons = [...dialog.querySelectorAll('[data-studio-camera]')];
  const lightButtons = [...dialog.querySelectorAll('[data-studio-light]')];
  const ranges = Object.fromEntries(['orbit','zoom','lid'].map(name => [name,dialog.querySelector('#studio-'+name)]));
  const tourButton = dialog.querySelector('.playground-tour');
  const demoButton = dialog.querySelector('.playground-demo');
  const musicButton = dialog.querySelector('.playground-music');
  const musicPlayer = document.querySelector('.lofi-toggle');
  const commandForm = dialog.querySelector('.studio-composer');
  const commandInput = dialog.querySelector('#studio-command');
  const commandFeedback = dialog.querySelector('#studio-command-feedback');
  const autoButton = dialog.querySelector('.composer-auto');
  const countdown = dialog.querySelector('.composer-countdown');
  let commandTimer = null;
  let commandDeadline = 0;
  let composing = false;
  const placeholder = document.createElement('div');
  placeholder.hidden = true;
  studio.before(placeholder);
  const state = {view:'code',camera:'perspective',light:'natural',yaw:0,pitch:0,zoom:100,lid:100};
  let frame = 0;
  let animation = null;
  let dragging = null;
  let demoTimers = [];
  let savedCamera = null;
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
  function say(text) { announcement.textContent = text; feedback.textContent = text; }
  function pose() {
    cancelAnimationFrame(frame);
    const top = state.camera === 'top' ? -23 : 0;
    studio.style.setProperty('--studio-rx',(state.pitch+top)+'deg');
    studio.style.setProperty('--studio-ry',state.yaw+'deg');
    studio.style.setProperty('--studio-zoom',String(state.zoom/100));
    studio.style.setProperty('--lid-angle',(-111*(1-state.lid/100))+'deg');
    studio.style.setProperty('--lid-length',String(.58+.42*state.lid/100));
    studio.classList.toggle('is-lid-closed',state.lid<=3);
    const front = state.camera === 'front';
    studio.style.setProperty('--laptop-x',front ? '0deg' : '6deg');
    studio.style.setProperty('--laptop-y',front ? '0deg' : '-17deg');
    studio.style.setProperty('--laptop-z',front ? '0deg' : '4deg');
    for (const [name,value] of [['orbit',state.yaw],['zoom',state.zoom],['lid',state.lid]]) {
      ranges[name].value = String(Math.round(value));
      dialog.querySelector('#studio-'+name+'-value').value = Math.round(value)+(name==='orbit'?'°':'%');
    }
  }
  function stopTour() {
    animation?.cancel(); animation = null;
    tourButton.setAttribute('aria-pressed','false');
    tourButton.textContent = 'Passeio de câmera';
  }
  function stopDemo() {
    demoTimers.forEach(clearTimeout); demoTimers = [];
    if (demoButton.disabled) studio.querySelector('[data-terminal-phase]').textContent = 'Demo interrompida · execute para reiniciar';
    demoButton.disabled = false;
  }
  function setView(view, announce = true) {
    stopDemo(); state.view = view;
    for (const name of ['code','preview','terminal']) studio.querySelector('[data-studio-'+name+']').hidden = name !== view;
    const info = {code:['portfolio.js','Pronto para criar','código JavaScript'],preview:['preview.html','Ideia em interface','uma prévia de interface'],terminal:['studio.demo','Simulação visual · local','um terminal demonstrativo']};
    studio.querySelector('[data-studio-filename]').textContent = info[view][0];
    studio.querySelector('[data-studio-status]').textContent = info[view][1];
    viewButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.studioView===view)));
    if (state.lid < 25) { state.lid = 100; pose(); }
    if (announce) say('Notebook exibindo '+info[view][2]+'.');
    if (view==='terminal' && dialog.open) armCommandDemo();
    else stopCommandDemo();
  }
  function setLight(value, announce = true) {
    state.light = value;
    studio.dataset.light = value;
    studio.classList.toggle('is-lit',value==='lime');
    light.setAttribute('aria-pressed',String(value!=='natural'));
    lightButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.studioLight===value)));
    if (announce) say('Iluminação '+{natural:'suave',lime:'verde-lima',blue:'azul'}[value]+' selecionada.');
  }
  function setCamera(value, announce = true) {
    stopTour(); state.camera = value; state.yaw = 0; state.pitch = 0;
    cameraButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.studioCamera===value)));
    pose();
    if (announce) say('Vista '+{perspective:'em perspectiva',front:'frontal',top:'superior'}[value]+' selecionada.');
  }
  function restore() {
    stopTour(); stopDemo();
    stopCommandDemo(); commandInput.value = ''; commandInput.removeAttribute('aria-invalid');
    dialog.querySelector('.composer-result').hidden = true;
    studio.querySelector('[data-studio-preview]').classList.remove('is-personal');
    studio.querySelector('[data-preview-caption]').textContent = 'IDEIAS EM MOVIMENTO';
    studio.querySelector('[data-preview-message]').textContent = 'Menos ruído. Mais propósito.';
    commandFeedback.textContent = 'Abra o Terminal ou toque no campo para experimentar. Sem digitar, a demo avança em 10 segundos.';
    Object.assign(state,{yaw:0,pitch:0,zoom:100,lid:100});
    setCamera('perspective',false); setView('code',false); setLight('natural',false);
    say('Cenário restaurado. A música mantém sua escolha no player.');
  }
  function finishDrag() {
    if (dragging && scene.hasPointerCapture(dragging.id)) scene.releasePointerCapture(dragging.id);
    dragging = null; scene.classList.remove('is-dragging');
  }
  scene.addEventListener('pointerdown',event => {
    if (!dialog.open || !event.isPrimary || event.button!==0) return;
    stopTour();
    dragging = {id:event.pointerId,x:event.clientX,y:event.clientY,yaw:state.yaw,pitch:state.pitch};
    scene.setPointerCapture(event.pointerId); scene.classList.add('is-dragging');
  });
  scene.addEventListener('pointermove',event => {
    if (dragging && event.pointerId===dragging.id) {
      state.yaw = clamp(dragging.yaw+(event.clientX-dragging.x)*.22,-35,35);
      if (event.pointerType!=='touch') state.pitch = clamp(dragging.pitch-(event.clientY-dragging.y)*.12,-15,15);
      cancelAnimationFrame(frame); frame = requestAnimationFrame(pose);
      return;
    }
    if (dialog.open || reducedMotion.matches || !finePointer.matches) return;
    const bounds = scene.getBoundingClientRect();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      studio.style.setProperty('--studio-rx',(-((event.clientY-bounds.top)/bounds.height-.5)*12)+'deg');
      studio.style.setProperty('--studio-ry',(((event.clientX-bounds.left)/bounds.width-.5)*18)+'deg');
    });
  });
  scene.addEventListener('pointerup',finishDrag);
  scene.addEventListener('pointercancel',finishDrag);
  scene.addEventListener('lostpointercapture',() => { dragging = null; scene.classList.remove('is-dragging'); });
  scene.addEventListener('pointerleave',() => { if (!dialog.open) pose(); });
  scene.addEventListener('dragstart',event => event.preventDefault());
  viewButtons.forEach(button => button.addEventListener('click',() => setView(button.dataset.studioView)));
  lightButtons.forEach(button => button.addEventListener('click',() => setLight(button.dataset.studioLight)));
  cameraButtons.forEach(button => button.addEventListener('click',() => setCamera(button.dataset.studioCamera)));
  light.addEventListener('click',() => setLight(state.light==='natural'?'lime':'natural'));
  for (const [name,input] of Object.entries(ranges)) input.addEventListener('input',() => {
    stopTour(); state[{orbit:'yaw',zoom:'zoom',lid:'lid'}[name]] = Number(input.value); pose();
  });
  function animateCamera(loop) {
    stopTour();
    if (reducedMotion.matches) { say('Movimento reduzido ativo. Use os ângulos e controles manuais.'); return; }
    const pitch = state.pitch+(state.camera==='top'?-23:0);
    const scale = state.zoom/100;
    const transform = (x,y) => 'rotateX('+x+'deg) rotateY('+y+'deg) scale('+scale+')';
    animation = model.animate([
      {transform:transform(pitch,state.yaw)},
      {transform:transform(pitch-4,state.yaw+14),offset:.3},
      {transform:transform(pitch+4,state.yaw-14),offset:.7},
      {transform:transform(pitch,state.yaw)},
    ],{duration:loop?6500:1500,iterations:loop?Infinity:1,easing:'ease-in-out'});
    if (loop) { tourButton.setAttribute('aria-pressed','true'); tourButton.textContent = 'Pausar passeio'; }
    say(loop?'Passeio iniciado. Arraste ou pause quando quiser.':'Notebook girando para mostrar sua perspectiva.');
  }
  studio.querySelector('.studio-rotate').addEventListener('click',() => animateCamera(false));
  tourButton.addEventListener('click',() => {
    if (tourButton.getAttribute('aria-pressed')==='true') { stopTour(); say('Passeio pausado.'); }
    else animateCamera(true);
  });
  demoButton.addEventListener('click',() => {
    setView('terminal',false); state.lid = 100; pose(); demoButton.disabled = true;
    stopCommandDemo();
    const log = studio.querySelector('[data-terminal-log]');
    log.replaceChildren();
    const messages = [
      ['command','$ studio pipeline --preview','Iniciando pipeline'],
      ['info','[01] Carregando HTML / CSS / JavaScript','Estrutura'],
      ['success','[02] Componentes e tokens de design','Interface'],
      ['success','[03] Layouts: desktop / tablet / mobile','Responsividade'],
      ['success','[04] Foco, contraste e movimento reduzido','Acessibilidade'],
      ['info','[05] Organizando estilos e assets','Preparação'],
      ['success','[06] Preview visual preparado','Preview'],
      ['success','[done] Demo concluída · sem execução real','Pipeline demonstrativo concluído'],
    ];
    studio.style.setProperty('--terminal-progress','0%');
    studio.querySelector('[data-terminal-phase]').textContent = 'Preparando demonstração…';
    studio.querySelector('[data-terminal-count]').textContent = '0 / '+messages.length;
    say('Demonstração visual em andamento: estrutura, interface, revisão e preview.');
    const draw = i => {
      const [tone,text,phase] = messages[i];
      const line = document.createElement('div');
      line.className = 'terminal-line'; line.dataset.tone = tone; line.textContent = text;
      log.append(line); log.scrollTop = log.scrollHeight;
      studio.style.setProperty('--terminal-progress',((i+1)/messages.length*100)+'%');
      studio.querySelector('[data-terminal-phase]').textContent = phase;
      studio.querySelector('[data-terminal-count]').textContent = (i+1)+' / '+messages.length;
      if (i===messages.length-1) { demoButton.disabled = false; studio.querySelector('[data-studio-status]').textContent = 'Demo concluída · nenhum comando executado'; say('Demonstração visual concluída. Nenhum código ou comando real foi executado.'); }
    };
    if (reducedMotion.matches) messages.forEach((_,i) => draw(i));
    else messages.forEach((_,i) => demoTimers.push(setTimeout(() => draw(i),200+i*650)));
  });
  launcher.addEventListener('click',() => {
    stopTour(); pose();
    savedCamera = {camera:state.camera,yaw:state.yaw,pitch:state.pitch,zoom:state.zoom,lid:state.lid};
    const style = getComputedStyle(studio);
    placeholder.style.height = style.position==='absolute'?'0px':(studio.getBoundingClientRect().height+parseFloat(style.marginTop)+parseFloat(style.marginBottom))+'px';
    placeholder.hidden = false;
    dialog.querySelector('.playground-mount').append(studio);
    document.body.classList.add('studio-dialog-open'); dialog.showModal();
    dialog.scrollTop = 0; say('Explore os controles ou arraste o cenário.');
  });
  dialog.querySelector('.playground-close').addEventListener('click',() => dialog.close());
  dialog.addEventListener('click',event => {
    if (event.target!==dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX<box.left || event.clientX>box.right || event.clientY<box.top || event.clientY>box.bottom) dialog.close();
  });
  dialog.addEventListener('close',() => {
    finishDrag(); stopTour(); stopDemo(); stopCommandDemo();
    // Preserve the chosen screen/light; restore the hero's readable camera pose.
    if (savedCamera) {
      Object.assign(state,savedCamera); pose();
      cameraButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.studioCamera===state.camera)));
    }
    placeholder.after(studio); placeholder.hidden = true;
    document.body.classList.remove('studio-dialog-open'); launcher.focus({preventScroll:true});
  });
  dialog.querySelector('.playground-reset').addEventListener('click',restore);
  function syncMusic() {
    const active = musicPlayer?.getAttribute('aria-pressed')==='true';
    musicButton.setAttribute('aria-pressed',String(active));
    musicButton.textContent = active?'Pausar lo-fi':'Ouvir lo-fi';
    musicButton.disabled = !musicPlayer || musicPlayer.disabled;
  }
  musicButton.addEventListener('click',() => musicPlayer?.click());
  if (musicPlayer) new MutationObserver(syncMusic).observe(musicPlayer,{attributes:true,attributeFilter:['aria-pressed','disabled']});
  function motionPreference() {
    stopTour(); pose(); tourButton.disabled = reducedMotion.matches;
    dialog.querySelector('.playground-motion-note').hidden = !reducedMotion.matches;
  }
  reducedMotion.addEventListener('change',motionPreference);
  document.addEventListener('visibilitychange',() => { if (document.hidden) { finishDrag(); stopTour(); stopDemo(); stopCommandDemo(); pose(); } });
  function stopCommandDemo() {
    clearInterval(commandTimer); commandTimer = null;
    countdown.textContent = ''; autoButton.setAttribute('aria-pressed','false');
    autoButton.textContent = 'Demo automática';
  }
  function armCommandDemo() {
    stopCommandDemo();
    if (!dialog.open || document.hidden || commandInput.value.trim() || composing) return;
    commandDeadline = Date.now()+10000;
    autoButton.setAttribute('aria-pressed','true'); autoButton.textContent = 'Pausar contagem';
    commandFeedback.textContent = 'Sua vez: escreva uma mensagem. Se deixar vazio por 10 segundos, eu mostro Hello World.';
    const tick = () => {
      if (!dialog.open || document.hidden || commandInput.value.trim() || composing) { stopCommandDemo(); return; }
      const remaining = Math.max(0,Math.ceil((commandDeadline-Date.now())/1000));
      countdown.textContent = 'Demo em '+remaining+'s · digite para assumir o controle';
      if (!remaining) { stopCommandDemo(); renderCommand('Hello World',true); }
    };
    commandTimer = setInterval(tick,200); tick();
  }
  function renderCommand(raw, automatic = false) {
    stopCommandDemo();
    let message = raw.trim();
    let corrected = false;
    const echo = message.match(/^(echo|echp|ehco|eco|echoo)\b\s*(.*)$/i);
    if (echo) {
      message = echo[2].trim();
      corrected = echo[1]!=='echo' || !/^"[^"\n]*"$/.test(message);
      message = message.replace(/^["'“”‘’]+|["'“”‘’]+$/g,'').trim();
    }
    if (!message || message.length>60) {
      commandInput.setAttribute('aria-invalid','true');
      commandInput.focus(); stopCommandDemo();
      commandFeedback.textContent = !message ? 'Faltou a mensagem. Experimente: echo "Hello World" — ou apenas Hello World.' : 'Sua ideia merece espaço: use até 60 caracteres para caber bem no cartão.';
      return;
    }
    commandInput.removeAttribute('aria-invalid');
    if (echo && corrected) commandInput.value = 'echo "'+message+'"';
    stopDemo(); stopTour();
    const log = studio.querySelector('[data-terminal-log]'); log.replaceChildren();
    for (const [tone,text] of [['command','$ echo '+JSON.stringify(message)],['info','[render] Texto → cartão de interface'],['success','[ok] Preview atualizado · execução local']]) {
      const line = document.createElement('div'); line.className = 'terminal-line'; line.dataset.tone = tone; line.textContent = text; log.append(line);
    }
    studio.querySelector('[data-terminal-phase]').textContent = 'Mensagem renderizada';
    studio.querySelector('[data-terminal-count]').textContent = '1 / 1';
    studio.style.setProperty('--terminal-progress','100%');
    studio.querySelector('[data-preview-caption]').textContent = automatic ? 'UMA IDEIA PARA COMEÇAR' : 'SUA IDEIA GANHOU FORMA';
    studio.querySelector('[data-preview-message]').textContent = message;
    studio.querySelector('[data-studio-preview]').classList.add('is-personal');
    dialog.querySelector('[data-composer-result]').textContent = message;
    dialog.querySelector('.composer-result').hidden = false;
    state.lid = 100; pose(); setView('preview',false);
    const notice = automatic ? 'Como o campo ficou vazio por 10 segundos, criei Hello World. Agora é a sua vez!' : corrected ? 'Ajustei a sintaxe para '+commandInput.value+'. Sua mensagem já está na interface!' : 'Sua mensagem ganhou uma interface! Experimente outra ideia.';
    commandFeedback.textContent = notice; say(notice);
  }
  commandForm.addEventListener('submit',event => { event.preventDefault(); if (!composing) renderCommand(commandInput.value); });
  commandInput.addEventListener('focus',() => { if (state.view!=='terminal') setView('terminal',false); else armCommandDemo(); });
  commandInput.addEventListener('input',() => {
    stopCommandDemo(); stopDemo(); commandInput.removeAttribute('aria-invalid');
    if (state.view!=='terminal') setView('terminal',false);
    commandFeedback.textContent = 'Sem pressa: sua edição pausa a demo. Pressione Enter ou Criar interface.';
    if (!commandInput.value.trim()) armCommandDemo();
  });
  commandInput.addEventListener('compositionstart',() => { composing = true; stopCommandDemo(); });
  commandInput.addEventListener('compositionend',() => { composing = false; if (!commandInput.value.trim()) armCommandDemo(); });
  dialog.querySelectorAll('[data-command-example]').forEach(button => button.addEventListener('click',() => {
    commandInput.value = button.dataset.commandExample; renderCommand(commandInput.value);
  }));
  autoButton.addEventListener('click',() => {
    if (commandTimer) { stopCommandDemo(); commandFeedback.textContent = 'Contagem pausada. Continue no seu ritmo.'; return; }
    if (commandInput.value.trim()) { commandFeedback.textContent = 'Seu rascunho foi preservado. Envie a mensagem ou limpe o campo para iniciar a demo automática.'; return; }
    setView('terminal',false);
  });
  // Keep the latest output visible after a viewport or screen-view change.
  const terminalLog = studio.querySelector('[data-terminal-log]');
  new ResizeObserver(() => { terminalLog.scrollTop = terminalLog.scrollHeight; }).observe(terminalLog);
  motionPreference(); syncMusic();
})();

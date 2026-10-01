"use strict";

(() => {
  const studio = document.querySelector('.dev-studio');
  if (!studio) return;
  const scene = studio.querySelector('.studio-scene');
  const model = studio.querySelector('.studio-model');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const announcement = studio.querySelector('.studio-announcement');
  const light = studio.querySelector('.studio-light');
  light?.addEventListener('click', () => {
    const lit = studio.classList.toggle('is-lit');
    light.setAttribute('aria-pressed', String(lit));
    announcement.textContent = lit ? 'Iluminação do cenário ativada.' : 'Iluminação suave restaurada.';
  });
  let frame = 0;
  let rotation = null;

  function resetTilt() {
    cancelAnimationFrame(frame);
    studio.style.setProperty('--studio-rx', '0deg');
    studio.style.setProperty('--studio-ry', '0deg');
  }
  scene.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const bounds = scene.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      studio.style.setProperty('--studio-rx', `${-y * 12}deg`);
      studio.style.setProperty('--studio-ry', `${x * 18}deg`);
    });
  });
  scene.addEventListener('pointerleave', resetTilt);
  studio.querySelectorAll('[data-studio-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const preview = button.dataset.studioView === 'preview';
      studio.querySelector('[data-studio-code]').hidden = preview;
      studio.querySelector('[data-studio-preview]').hidden = !preview;
      studio.querySelector('[data-studio-filename]').textContent = preview ? 'preview.html' : 'portfolio.js';
      studio.querySelector('[data-studio-status]').textContent = preview ? 'Ideia em interface' : 'Pronto para criar';
      studio.querySelectorAll('[data-studio-view]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      announcement.textContent = preview ? 'Notebook exibindo uma prévia de interface.' : 'Notebook exibindo um exemplo de código JavaScript.';
    });
  });
  studio.querySelector('.studio-rotate').addEventListener('click', () => {
    rotation?.cancel();
    resetTilt();
    if (reducedMotion.matches) {
      announcement.textContent = 'Rotação desativada para respeitar sua preferência de movimento reduzido.';
      return;
    }
    rotation = model.animate([
      { transform: 'rotateY(0deg)' },
      { transform: 'rotateY(16deg) rotateX(-4deg)', offset: .3 },
      { transform: 'rotateY(-20deg) rotateX(4deg)', offset: .7 },
      { transform: 'rotateY(0deg)' },
    ], { duration: 1500, easing: 'ease-in-out' });
    announcement.textContent = 'Notebook girando para mostrar sua perspectiva.';
  });
  reducedMotion.addEventListener('change', () => {
    resetTilt();
    rotation?.cancel();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { resetTilt(); rotation?.cancel(); }
  });
})();

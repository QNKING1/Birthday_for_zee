import { CONFIG, scheduler, reducedMotion } from './core.js';

export function startDecryption(elements, onComplete) {
  let progress = 0;
  const nodes = [1, 2, 3, 4, 5].map((n) => document.getElementById(`firewall${n}`));

  const tick = () => {
    progress += 1;
    elements.progressBar.style.width = `${progress}%`;
    elements.progressText.textContent = `${progress}%`;

    const activeNodes = Math.floor(progress / 20);
    nodes.forEach((node, idx) => {
      node.classList.toggle('active', idx < activeNodes);
    });

    if (progress >= 100) {
      elements.statusMessage.textContent = 'Decryption complete. Launching neural verification...';
      scheduler.add(onComplete, reducedMotion() ? 80 : 700);
      return;
    }

    if (progress % 25 === 0) {
      elements.statusMessage.textContent = `Bypassing layer ${progress / 25}...`;
    }

    scheduler.add(tick, CONFIG.DECRYPTION_DURATION / 100);
  };

  tick();
}

export function initHexMatrix(canvas, phaseGetter) {
  const ctx = canvas.getContext('2d');
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();

  const chars = '01ABCDEF#$%@';
  const size = 18;
  let cols = Math.floor(canvas.width / size);
  let drops = Array(cols).fill(1);

  const draw = () => {
    if (phaseGetter() !== 'decryption') return;
    ctx.fillStyle = 'rgba(13,16,14,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#3fefef';
    ctx.font = `${size}px monospace`;

    drops.forEach((y, x) => {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, x * size, y * size);
      if (y * size > canvas.height && Math.random() > 0.975) drops[x] = 0;
      drops[x] += 1;
    });

    requestAnimationFrame(draw);
  };

  window.addEventListener('resize', () => {
    resize();
    cols = Math.floor(canvas.width / size);
    drops = Array(cols).fill(1);
  });

  draw();
}

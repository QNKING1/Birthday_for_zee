const balloonLayer = document.getElementById('balloon-layer');
const canvas = document.getElementById('confetti-canvas');
const btn = document.getElementById('celebrate-btn');
const qWrap = document.getElementById('qoobee-wrap');

// Optional Qoobee asset loading if user later adds files
for (const path of ['qoobee/qoobee.png', 'qoobee/qoobee.webp', 'qoobee/qoobee.gif']) {
  const img = new Image();
  img.src = path;
  img.alt = 'Qoobee character';
  img.onload = () => {
    qWrap.innerHTML = '';
    qWrap.appendChild(img);
  };
}

function spawnBalloon() {
  const b = document.createElement('div');
  b.className = 'balloon';
  b.style.left = `${Math.random() * 100}%`;
  b.style.background = ['#ffd6e8', '#ffffff', '#cfefff', '#fde2ff'][Math.floor(Math.random() * 4)];
  b.style.animationDuration = `${10 + Math.random() * 8}s`;
  b.style.setProperty('--drift', `${-40 + Math.random() * 80}px`);
  balloonLayer.appendChild(b);
  setTimeout(() => b.remove(), 19000);
}
setInterval(spawnBalloon, 700);
for (let i = 0; i < 10; i++) setTimeout(spawnBalloon, i * 150);

const ctx = canvas.getContext('2d');
const confetti = [];
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', resize); resize();

function burst() {
  for (let i = 0; i < 180; i++) {
    confetti.push({
      x: innerWidth * (0.35 + Math.random() * 0.3),
      y: innerHeight * 0.4,
      vx: -4 + Math.random() * 8,
      vy: -8 + Math.random() * 5,
      g: 0.12 + Math.random() * 0.08,
      s: 2 + Math.random() * 4,
      c: ['#fff', '#ffb8d1', '#9ee3ff', '#d6ffd0'][Math.floor(Math.random() * 4)],
      life: 80 + Math.random() * 50,
    });
  }
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = confetti.length - 1; i >= 0; i--) {
    const p = confetti[i];
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= 1;
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, p.s, p.s);
    if (p.life <= 0 || p.y > canvas.height + 20) confetti.splice(i, 1);
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
btn.addEventListener('click', burst);

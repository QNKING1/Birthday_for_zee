import { scheduler, reducedMotion } from './core.js';

export function initPersonnelAndMission(elements) {
  document.getElementById('restart-btn')?.addEventListener('click', () => location.reload());
  document.getElementById('celebrate-btn')?.addEventListener('click', () => transitionToMission(elements));

  document.getElementById('accept-mission-btn')?.addEventListener('click', startMission);
  document.getElementById('share-achievement-btn')?.addEventListener('click', shareAchievement);

  const now = new Date();
  const timeEl = document.getElementById('current-time');
  if (timeEl) timeEl.textContent = now.toLocaleString();

  initCountdown();
}

function transitionToMission(elements) {
  elements.personnelSection.style.opacity = '0';
  scheduler.add(() => {
    elements.personnelSection.style.display = 'none';
    elements.missionSection.style.display = 'flex';
    scheduler.add(() => elements.missionSection.classList.add('visible'), 40);
  }, reducedMotion() ? 10 : 500);
}

function initCountdown() {
  const target = new Date();
  target.setDate(target.getDate() + 7);

  setInterval(() => {
    const now = new Date();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    set('days', d);
    set('hours', h);
    set('minutes', m);
    set('seconds', s);
  }, 1000);
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(val).padStart(2, '0');
}

function showModal(title, html, onMount) {
  const modal = document.createElement('div');
  modal.className = 'confirmation-box';
  modal.innerHTML = `<h2>${title}</h2><div>${html}</div><button class="mission-btn" data-action="close-modal">CLOSE</button>`;
  document.body.appendChild(modal);
  scheduler.add(() => (modal.style.display = 'block'), 20);

  modal.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.dataset.action === 'close-modal') modal.remove();
  });

  onMount?.(modal);
}

function startMission() {
  showModal('MISSION ACCEPTED', '<p>Objective lock system activated.</p>');
}

function shareAchievement() {
  showModal(
    '📡 BROADCAST ACHIEVEMENT',
    `<p>🎂 I just completed the Birthday Mission Briefing! #BirthdayOps #CyberCelebration</p>
     <div style="display:flex;gap:10px;justify-content:center;margin:16px 0">
        <button class="mission-btn" data-action="share" data-platform="twitter">TWITTER</button>
        <button class="mission-btn" data-action="share" data-platform="whatsapp">WHATSAPP</button>
        <button class="mission-btn" data-action="copy">COPY</button>
     </div>`,
    (modal) => {
      modal.addEventListener('click', async (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const message = '🎂 I just completed the Birthday Mission Briefing! #BirthdayOps #CyberCelebration';
        if (target.dataset.action === 'share') {
          const platform = target.dataset.platform;
          const url = platform === 'twitter'
            ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
            : `https://wa.me/?text=${encodeURIComponent(message)}`;
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        if (target.dataset.action === 'copy') {
          try { await navigator.clipboard.writeText(message); } catch {}
        }
      });
    }
  );
}

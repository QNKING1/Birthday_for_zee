import { TERMINAL_MESSAGES, CONFIG, scheduler, reducedMotion } from './core.js';

export function runTerminal({ outputEl, onComplete }) {
  outputEl.innerHTML = '';
  let messageIndex = 0;
  let charIndex = 0;
  let currentLineEl = null;

  const typeNext = () => {
    if (messageIndex >= TERMINAL_MESSAGES.length) {
      scheduler.add(onComplete, reducedMotion() ? 100 : 1000);
      return;
    }

    const msg = TERMINAL_MESSAGES[messageIndex];
    if (!currentLineEl) {
      currentLineEl = document.createElement('div');
      currentLineEl.className = 'terminal-line';
      outputEl.appendChild(currentLineEl);
    }

    currentLineEl.textContent = msg.slice(0, charIndex + 1);
    charIndex += 1;

    if (charIndex >= msg.length) {
      if (Math.random() < CONFIG.GLITCH_PROBABILITY && !reducedMotion()) {
        currentLineEl.classList.add('glitch');
        currentLineEl.setAttribute('data-glitch', msg);
      }
      messageIndex += 1;
      charIndex = 0;
      currentLineEl = null;
      scheduler.add(typeNext, reducedMotion() ? 50 : 180);
      return;
    }

    scheduler.add(typeNext, reducedMotion() ? 8 : Math.random() * 40 + 20);
  };

  typeNext();
}

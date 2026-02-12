export const CONFIG = {
  GLITCH_PROBABILITY: 0.3,
  SCAN_DURATION: 3000,
  DECRYPTION_DURATION: 8000,
  NEURAL_DURATION: 5000,
};

export const TERMINAL_MESSAGES = [
  '> Initializing secure access protocol...',
  '> Establishing encrypted connection...',
  '> Accessing secure database...',
  '> Decrypting credentials...',
  '> Verifying biometric authentication...',
  '> Biometric authentication required',
];

export const appState = {
  phase: 'terminal',
  scanAttempts: 0,
  scanProgress: 0,
  scanActive: false,
};

export const scheduler = {
  timers: new Set(),
  add(fn, delay) {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, delay);
    this.timers.add(id);
    return id;
  },
  clearAll() {
    this.timers.forEach((id) => clearTimeout(id));
    this.timers.clear();
  },
};

const transitions = {
  terminal: ['scanner'],
  scanner: ['decryption'],
  decryption: ['neural'],
  neural: ['personnel'],
  personnel: ['mission'],
  mission: [],
};

export function setPhase(nextPhase) {
  const allowed = transitions[appState.phase] || [];
  if (!allowed.includes(nextPhase) && nextPhase !== appState.phase) return false;
  appState.phase = nextPhase;
  return true;
}

export function flashOverlay(el) {
  el.style.opacity = '1';
  scheduler.add(() => {
    el.style.opacity = '0';
  }, 220);
}

export function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

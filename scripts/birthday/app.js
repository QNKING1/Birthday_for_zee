import { appState, setPhase, flashOverlay, scheduler } from './core.js';
import { runTerminal } from './terminal.js';
import { initScanner } from './scanner.js';
import { startDecryption, initHexMatrix } from './decryption.js';
import { initPersonnelAndMission } from './mission.js';

const elements = {
  terminalSection: document.getElementById('terminal-section'),
  terminalOutput: document.getElementById('terminal-output'),
  scannerSection: document.getElementById('scanner-section'),
  scanner: document.getElementById('fingerprintScanner'),
  statusLabel: document.getElementById('status-label'),
  welcomeMessage: document.getElementById('welcome-message'),
  hintText: document.getElementById('hint-text'),
  decryptionSection: document.getElementById('decryption-section'),
  hexMatrix: document.getElementById('hex-matrix'),
  progressBar: document.getElementById('progress-bar'),
  progressText: document.getElementById('progress-text'),
  statusMessage: document.getElementById('status-message'),
  neuralSection: document.getElementById('neural-section'),
  neuralTitle: document.getElementById('neural-title'),
  identityConfirmed: document.getElementById('identity-confirmed'),
  flashOverlay: document.getElementById('flash-overlay'),
  personnelSection: document.getElementById('personnel-section'),
  missionSection: document.getElementById('mission-section'),
};

function hide(el) {
  el.style.opacity = '0';
  scheduler.add(() => (el.style.display = 'none'), 500);
}

function show(el, display = 'flex') {
  el.style.display = display;
  scheduler.add(() => (el.style.opacity = '1'), 40);
}

function toScanner() {
  if (!setPhase('scanner')) return;
  hide(elements.terminalSection);
  scheduler.add(() => show(elements.scannerSection), 550);
}

function toDecryption() {
  if (!setPhase('decryption')) return;
  flashOverlay(elements.flashOverlay);
  hide(elements.scannerSection);
  scheduler.add(() => {
    show(elements.decryptionSection);
    startDecryption(elements, toNeural);
  }, 350);
}

function toNeural() {
  if (!setPhase('neural')) return;
  flashOverlay(elements.flashOverlay);
  hide(elements.decryptionSection);
  scheduler.add(() => {
    show(elements.neuralSection);
    elements.neuralTitle.classList.add('visible');
    elements.identityConfirmed.classList.add('visible');
    scheduler.add(toPersonnel, 5000);
  }, 350);
}

function toPersonnel() {
  if (!setPhase('personnel')) return;
  hide(elements.neuralSection);
  scheduler.add(() => {
    show(elements.personnelSection);
    initPersonnelAndMission(elements);
  }, 450);
}

function boot() {
  document.querySelectorAll('canvas').forEach((c) => c.setAttribute('aria-hidden', 'true'));
  initHexMatrix(elements.hexMatrix, () => appState.phase);
  initScanner(elements, toDecryption);
  runTerminal({ outputEl: elements.terminalOutput, onComplete: toScanner });
}

window.addEventListener('beforeunload', () => scheduler.clearAll());
window.addEventListener('DOMContentLoaded', boot);

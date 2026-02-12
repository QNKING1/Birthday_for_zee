import { CONFIG, appState, scheduler, reducedMotion } from './core.js';

export function initScanner(elements, onGranted) {
  const startScanning = () => {
    appState.scanActive = true;
    const started = performance.now();

    const step = () => {
      if (!appState.scanActive) return;
      const elapsed = performance.now() - started;
      const pct = Math.min(100, (elapsed / CONFIG.SCAN_DURATION) * 100);
      elements.hintText.textContent = `Scanning... ${Math.floor(pct)}%`;

      if (pct >= 100) {
        completeScan();
        return;
      }

      scheduler.add(step, reducedMotion() ? 50 : 16);
    };

    step();
  };

  const stopScanning = () => {
    appState.scanActive = false;
    if (elements.hintText.textContent.includes('Scanning')) {
      elements.hintText.textContent = 'Hold Finger to Scan';
    }
  };

  const completeScan = () => {
    appState.scanAttempts += 1;
    if (appState.scanAttempts === 1) {
      elements.statusLabel.textContent = 'Access Denied';
      elements.statusLabel.style.color = '#ff5555';
      elements.hintText.textContent = 'Retry Scan';
      appState.scanActive = false;
      return;
    }

    elements.statusLabel.textContent = 'Access Granted';
    elements.statusLabel.style.color = '#3eff3e';
    elements.hintText.textContent = 'Identity Validated';
    elements.welcomeMessage.style.opacity = '1';
    appState.scanActive = false;
    scheduler.add(onGranted, reducedMotion() ? 120 : 1000);
  };

  elements.scanner.setAttribute('tabindex', '0');
  elements.scanner.setAttribute('role', 'button');
  elements.scanner.setAttribute('aria-label', 'Hold to scan fingerprint');

  elements.scanner.addEventListener('mousedown', startScanning);
  elements.scanner.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startScanning();
  }, { passive: false });
  elements.scanner.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startScanning();
    }
  });

  ['mouseup', 'mouseleave', 'touchend', 'keyup'].forEach((evt) => {
    window.addEventListener(evt, stopScanning);
  });
}

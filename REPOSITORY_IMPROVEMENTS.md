# Repository analysis and improvement plan

## Snapshot

- The project is a static, two-page experience (`index.html` entry + `birthday_page.html` mission flow) with a shared stylesheet and no build system.
- `birthday_page.html` is currently monolithic (large inline CSS and JS), which makes iteration and debugging slower as features grow.

## What is working well

- The visual concept is strong and cohesive across both pages.
- The flow from entry page to mission sequence is straightforward (`index.html` click -> redirect).
- The app does not require a backend, making deployment simple (can be served as static files).

## High-priority improvements

### 1) Split `birthday_page.html` into modules (maintainability)

**Why**
- `birthday_page.html` contains both a very large inline style block and a very large inline script block, which hurts readability and testability.

**Observed in repo**
- Inline CSS block spans from `<style>` at line 9 to `</style>` at line 1595.
- Inline JS block spans from `<script>` at line 1848 to `</script>` at line 3390.

**Recommendation**
- Move CSS into `styles/birthday.css`.
- Move JS into `scripts/birthday.js`.
- Further split JS by feature (`terminal.js`, `scanner.js`, `decryption.js`, `mission.js`) and compose from a small boot file.

---

### 2) Reduce inline event handlers and string-injected HTML (robustness + security hygiene)

**Why**
- Inline `onclick` attributes and repeated `innerHTML` construction make behavior harder to trace and are more error-prone.
- Centralized event listeners and `createElement`/`textContent` are easier to audit and maintain.

**Observed in repo**
- Inline click handlers in mission buttons and modal templates.
- Multiple dynamic UI sections are created using `innerHTML` template strings.

**Recommendation**
- Replace inline handlers with delegated `addEventListener` bindings.
- Replace repeated `innerHTML` fragments with templating helpers and `DocumentFragment`.
- Keep `innerHTML` only for trusted static templates if needed, with strict separation of user-derived values.

---

### 3) Add accessibility pass (A11y)

**Why**
- This interface is animation-heavy and keyboard/screen-reader support appears limited.

**Observed in repo**
- Entry button has no explicit accessible label, and decorative SVG regions may be announced unnecessarily.
- Core interaction relies heavily on pointer events and visual state.

**Recommendation**
- Add explicit button labels (`aria-label`) where text is stylized.
- Mark decorative SVG/canvas as `aria-hidden="true"`.
- Add focus-visible styles and keyboard activation paths for scanner/mission steps.
- Add `@media (prefers-reduced-motion: reduce)` fallbacks in both page styles.

---

### 4) Improve resilience of async flow logic (UX reliability)

**Why**
- The experience chains many nested `setTimeout` calls; timing drift or interruptions can leave UI in an inconsistent state.

**Observed in repo**
- Many nested timers across terminal/decryption/mission transitions.

**Recommendation**
- Introduce a small state machine (`currentPhase`, `allowedTransitions`) and central scheduler.
- Track timeout IDs in one place and clear them on phase changes/unload.
- Add restart behavior that resets both state and pending timers.

---

### 5) Third-party dependency hardening

**Why**
- Three.js is loaded from CDN without SRI + `crossorigin` attributes; this weakens supply-chain integrity checks.

**Observed in repo**
- External script loaded from Cloudflare CDN in page head.

**Recommendation**
- Add `integrity` and `crossorigin="anonymous"` for pinned version.
- Consider vendoring a local copy for offline reliability.

---

## Medium-priority improvements

### 6) Performance tuning for low-end devices

- Throttle expensive animations when tab is hidden (`visibilitychange`).
- Reuse canvas contexts and avoid redundant redraw loops.
- Cap particle/DOM effects and clean up nodes aggressively.

### 7) Project structure + docs

- Add `README.md` with run instructions and feature map.
- Add `CONTRIBUTING.md` with naming/style conventions.
- Add a simple changelog.

### 8) Basic automated quality checks

- Add formatting/linting for HTML/CSS/JS (Prettier + ESLint).
- Add a minimal Playwright smoke test:
  - entry page loads
  - click transitions to mission page
  - mission page renders key sections

## Suggested implementation order (fastest ROI)

1. Extract CSS/JS from `birthday_page.html`.
2. Replace inline `onclick` with JS event binding.
3. Add reduced-motion + accessibility labels.
4. Refactor timer chains into a simple phase controller.
5. Add lint + one smoke test.

## Optional “wow” upgrades

- Persist mission progress in `localStorage` and offer “resume mission”.
- Add audio toggle and motion toggle in a settings panel.
- Add lightweight internationalization for mission text.


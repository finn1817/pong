// Minimal debugging utility for the Pong app
// Toggle: add ?debug=1 to URL or press Ctrl/Cmd + D
(function () {
  let enabled = false;
  let panel;
  let initialized = false;

  function isEnabledFromUrlOrStorage() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('debug')) return true;
      return localStorage.getItem('pongDebug') === '1';
    } catch (_) {
      return false;
    }
  }

  function ensurePanel() {
    if (!enabled) return;
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'debugPanel';
    panel.style.position = 'fixed';
    panel.style.bottom = '8px';
    panel.style.right = '8px';
    panel.style.zIndex = '9999';
    panel.style.background = 'rgba(0,0,0,0.8)';
    panel.style.color = '#0f0';
    panel.style.font = '12px/1.4 monospace';
    panel.style.padding = '8px 10px';
    panel.style.border = '1px solid #0f0';
    panel.style.borderRadius = '6px';
    panel.style.maxWidth = '42vw';
    panel.style.maxHeight = '46vh';
    panel.style.overflow = 'auto';
    panel.style.whiteSpace = 'pre-wrap';
    panel.style.pointerEvents = 'auto';
    document.body.appendChild(panel);
    return panel;
  }

  function ensureToggleBadge() {
    // Always show a tiny toggle badge so users can enable debug without URL/keys
    if (document.getElementById('debugToggleBadge')) return;
    const badge = document.createElement('button');
    badge.id = 'debugToggleBadge';
    badge.textContent = '🐞 Debug';
    badge.style.position = 'fixed';
    badge.style.top = '8px';
    badge.style.right = '8px';
    badge.style.zIndex = '10000';
    badge.style.padding = '4px 8px';
    badge.style.font = '12px monospace';
    badge.style.background = enabled ? '#093' : '#444';
    badge.style.color = '#fff';
    badge.style.border = '1px solid #888';
    badge.style.borderRadius = '4px';
    badge.style.cursor = 'pointer';
    badge.style.opacity = '0.7';
    badge.style.userSelect = 'none';
    badge.title = 'Click to toggle debug (Ctrl/Cmd+D also)';
    badge.addEventListener('mouseenter', () => badge.style.opacity = '1');
    badge.addEventListener('mouseleave', () => badge.style.opacity = '0.7');
    badge.addEventListener('click', () => toggle());
    document.body.appendChild(badge);
    return badge;
  }

  function appendLine(text) {
    if (!enabled) return;
    ensurePanel();
    if (!panel) return;
    const line = document.createElement('div');
    line.textContent = typeof text === 'string' ? text : JSON.stringify(text);
    panel.appendChild(line);
    panel.scrollTop = panel.scrollHeight;
  }

  function clearPanel() {
    if (panel) panel.textContent = '';
  }

  function log(...args) {
    if (!enabled) return;
    console.log('[PONG]', ...args);
    appendLine(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
  }

  function dumpScreens() {
    try {
      const screens = Array.from(document.querySelectorAll('.screen')).map(el => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          id: el.id,
          classes: el.className,
          display: cs.display,
          visibility: cs.visibility,
          zIndex: cs.zIndex,
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }
        };
      });
      log('Visible screens snapshot:', screens);
      return screens;
    } catch (e) {
      log('dumpScreens error:', e);
    }
  }

  function dumpCanvas() {
    try {
      const c = document.getElementById('pongCanvas');
      if (!c) return;
      const r = c.getBoundingClientRect();
      log('Canvas metrics', {
        attr: { width: c.width, height: c.height },
        css: { clientWidth: c.clientWidth, clientHeight: c.clientHeight },
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        dpr: window.devicePixelRatio
      });
    } catch (e) {
      log('dumpCanvas error:', e);
    }
  }

  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem('pongDebug', enabled ? '1' : '0'); } catch (_) {}
    if (enabled) {
      ensurePanel();
      clearPanel();
      log('Debug enabled');
      // First snapshot
      setTimeout(() => { dumpScreens(); dumpCanvas(); }, 0);
    } else {
      if (panel) panel.remove();
      panel = null;
      console.log('[PONG] Debug disabled');
    }
    // Reflect state on badge color
    const badge = document.getElementById('debugToggleBadge');
    if (badge) badge.style.background = enabled ? '#093' : '#444';
  }

  function init() {
    if (initialized) return;
    initialized = true;

    enabled = isEnabledFromUrlOrStorage();
    // Badge should exist regardless of enabled state
    ensureToggleBadge();
    if (enabled) {
      ensurePanel();
      log('Debug auto-enabled');
      setTimeout(() => { dumpScreens(); dumpCanvas(); }, 0);
    }

    // Surface runtime errors to the panel to quickly spot JS failures
    window.addEventListener('error', (e) => {
      if (!enabled) return;
      log('Runtime error:', { message: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno });
    });
    window.addEventListener('unhandledrejection', (e) => {
      if (!enabled) return;
      log('Unhandled rejection:', e.reason);
    });

    // Keyboard toggle: Ctrl/Cmd + D
    window.addEventListener('keydown', (e) => {
      const key = e.key?.toLowerCase();
      if (key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggle();
      }
    });
  }

  // Expose a tiny API for other modules
  window.PongDebug = {
    get enabled() { return enabled; },
    init,
    toggle,
    log,
    dumpScreens,
    dumpCanvas,
    panel: () => panel
  };

  document.addEventListener('DOMContentLoaded', init);
})();

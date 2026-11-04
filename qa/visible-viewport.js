// Match the canvas to the visible Safari viewport when browser bars change height.
(() => {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  // The ordinary web build uses the same frame-boundary suspension bridge as
  // Toss, without its exit/payment APIs. No saves or identifiers leave the device.
  window.ChainDelveHost = window.ChainDelveHost || {
    state: (document.hidden || window.ChainDelveEntrance?.blocking) ? 1 : 0,
    ready() { this.state = (document.hidden || window.ChainDelveEntrance?.blocking) ? 1 : 0; },
  };
  function suspend() { window.ChainDelveHost.state = (document.hidden || window.ChainDelveEntrance?.blocking) ? 1 : 0; }
  document.addEventListener('visibilitychange', suspend);
  window.addEventListener('entrancechange', suspend);
  let scheduled = false;
  function fit() {
    scheduled = false;
    const v = window.visualViewport;
    const width = Math.max(1, Math.floor(Math.min(window.innerWidth, v?.width ?? window.innerWidth)));
    const fullHeight = Math.max(1, Math.floor(Math.min(window.innerHeight, v?.height ?? window.innerHeight)));
    const padding = getComputedStyle(document.body);
    const height = Math.max(1, fullHeight - (parseFloat(padding.paddingTop) || 0) - (parseFloat(padding.paddingBottom) || 0));
    document.body.style.height = fullHeight + 'px';
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    // Cap backing pixels, not CSS layout or touch coordinates. A DPR-3 phone
    // otherwise draws nine pixels for every CSS pixel in this 2D board.
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(1500000 / (width * height)));
    const w = Math.round(width * dpr), h = Math.round(height * dpr);
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(fit); } }
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('scroll', schedule);
  fit();
})();

// Match the canvas to the visible Safari viewport when browser bars change height.
(() => {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
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
    const dpr = window.devicePixelRatio || 1;
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

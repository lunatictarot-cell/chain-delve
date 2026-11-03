// Device-local, bounded breadcrumbs. No telemetry, identifiers, seeds or saves.
(() => {
  const key = 'dungeon-regular-runtime-v1';
  const phases = new Set(['boot','ready','chain_release','preview_done','turn_begin','turn_done','effects_begin','effects_done','refresh_done','save_begin','saved','save_failed','idle']);
  let previous = null;
  try { previous = JSON.parse(localStorage.getItem(key) || 'null')?.current || null; } catch {}
  const start = Date.now();
  const current = {version:66, stage:'boot', turn:0, act:0, floor:0, elapsed:0, hidden:document.hidden, signal:'none', history:[]};
  function persist() {
    try { localStorage.setItem(key, JSON.stringify({current})); } catch { /* Play remains available with restricted storage. */ }
  }
  window.ChainDelveDiagnostics = {
    mark(stage, turn=0, act=0, floor=0) {
      if (!phases.has(stage)) return;
      Object.assign(current,{stage,turn:Math.max(0,Math.trunc(Number(turn)||0)),act:Math.max(0,Math.trunc(Number(act)||0)),floor:Math.max(0,Math.trunc(Number(floor)||0)),elapsed:Math.max(0,Math.round((Date.now()-start)/1000))});
      current.history.push({stage,turn:current.turn,elapsed:current.elapsed});
      current.history=current.history.slice(-12);persist();
    },
    report() { return JSON.stringify({current,previous}); },
  };
  document.addEventListener('visibilitychange',()=>{current.hidden=document.hidden;persist();});
  // Ignore extension and unrelated page errors; inspect origin only in memory.
  function gameError(text) {
    return typeof text==='string' && (text.includes(location.origin+'/index.') || text.includes(location.origin+'/game/index.') || /wasm-function|memory access out of bounds/.test(text));
  }
  window.addEventListener('error',event=>{if(gameError(event.filename)){current.signal='js_error';persist();}});
  window.addEventListener('unhandledrejection',event=>{if(gameError(event.reason?.stack)){current.signal='promise_error';persist();}});
  document.getElementById('canvas')?.addEventListener('webglcontextlost',()=>{current.signal='graphics_lost';persist();});
  persist();
})();

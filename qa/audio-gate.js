// Browser autoplay recovery. Observes game AudioContexts only; does not change saved volume.
(() => {
  const contexts = new Set();
  let ready = false, muted = false, label = '', button, unlockGesture = false;
  const blocked = () => [...contexts].some(ctx => ctx.state === 'suspended' || ctx.state === 'interrupted');
  function render() {
    if (!button) {
      button = document.createElement('button');
      button.id = 'game-audio-enable';
      button.type = 'button';
      button.style.cssText = 'position:fixed;right:64px;top:max(12px,env(safe-area-inset-top));z-index:20;max-width:calc(100vw - 88px);padding:10px 16px;border:2px solid #ae7b45;border-radius:20px;background:#fff1d8;color:#493728;font:bold 15px system-ui;cursor:pointer;box-shadow:0 3px 10px #0004';
      button.addEventListener('click', resume);
      document.body.append(button);
    }
    button.textContent = label;
    const entranceVisible = window.ChainDelveEntrance && window.ChainDelveEntrance.state !== 'entered';
    button.hidden = !(ready && !muted && label && blocked() && !entranceVisible);
  }
  function resume() {
    for (const ctx of contexts) if (ctx.state !== 'running' && ctx.state !== 'closed') {
      ctx.resume().then(render).catch(render);
    }
  }
  for (const name of ['AudioContext', 'webkitAudioContext']) {
    const Base = window[name]; if (!Base) continue;
    window[name] = new Proxy(Base, {construct(target, args) {
      const ctx = Reflect.construct(target, args); contexts.add(ctx);
      if (window.ChainDelveEntrance?.blocking && ctx.state === 'running') ctx.suspend().catch(() => {});
      ctx.addEventListener('statechange', render); return ctx;
    }});
  }
  function gesture(event) {
    if (!event.isTrusted || event.repeat) return;
    if (window.ChainDelveEntrance?.blocking) return;
    unlockGesture = blocked();
    resume();
  }
  document.addEventListener('pointerdown', gesture, true);
  document.addEventListener('keydown', gesture, true);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  window.addEventListener('entrancechange', render);
  window.ChainDelveAudio = {
    get status() { return {muted,states:[...contexts].map(ctx=>ctx.state)}; },
    enter() { unlockGesture = false; resume(); render(); },
    setMuted(value) { muted = value; render(); },
    setLabel(text) { label = text; render(); },
    ready() { ready = true; render(); },
    // First press of the in-game speaker should unlock audio, not immediately mute it.
    consumeUnlockGesture() { const value = unlockGesture || blocked(); unlockGesture = false; if (value) resume(); return value; }
  };
})();

// Lightweight first screen, shared by the ordinary web and Toss hosts.
// Does not read/write game saves or invoke WASM from an input callback.
(() => {
  const root = document.getElementById('entrance');
  if (!root) return;
  let state = 'loading', loaded = false, gameReady = false, lang = 'ko', reduced = false;
  let error = false;
  const copy = {
    ko: {title:'던전 단골',tag:'오늘도, 던전으로.',loading:'던전 문을 준비하고 있어요',final:'모험을 준비하고 있어요…',enter:'문을 눌러 입장하기',hint:'익숙한 문 너머, 새로운 모험',opening:'어서 오세요, 단골 모험가님!',retry:'다시 준비하기',fail:'준비를 마치지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.',slow:'준비가 조금 길어지고 있어요. 잠시만 기다려 주세요.'},
    en: {title:'Dungeon Regular',tag:'Another day. Another dungeon.',loading:'Preparing the dungeon door',final:'Getting your adventure ready…',enter:'Tap the door to enter',hint:'A familiar door. A new adventure.',opening:'Welcome back, adventurer!',retry:'Try again',fail:'Unable to get ready. Check your connection and try again.',slow:'Getting ready is taking a little longer…'}
  };
  // Illustrated background and two clipped door leaves share the same composition.
  // The opening is a one-shot transform; no video, particle loop or extra canvas.
  root.innerHTML = `<div class="entrance-scene"><div class="entrance-art" aria-hidden="true"></div>
    <div class="entrance-doors" aria-hidden="true"><div class="entrance-source"></div><div class="entrance-door left"></div><div class="entrance-door right"></div></div>
    <div class="entrance-spill" aria-hidden="true"></div>
    <div class="entrance-rays" aria-hidden="true"></div>
    <button class="entrance-enter" type="button" disabled><span></span><small></small></button></div>
    <svg class="entrance-bloom" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><defs><radialGradient id="entrance-light-gradient"><stop offset="0" stop-color="#fffef5"/><stop offset=".4" stop-color="#fffdf0"/><stop offset=".62" stop-color="#fff1c9" stop-opacity=".65"/><stop offset=".82" stop-color="#ffe6a3" stop-opacity=".15"/><stop offset="1" stop-color="#ffe6a3" stop-opacity="0"/></radialGradient></defs><ellipse cx="500" cy="565" rx="3" ry="190" fill="url(#entrance-light-gradient)"/></svg>
    <header class="entrance-heading"><div class="entrance-eyebrow">DUNGEON REGULAR</div><h1></h1><p></p></header>
    <footer class="entrance-footer"><p role="status" aria-live="polite"></p><progress max="100" aria-label="Loading"></progress><button class="entrance-retry" type="button" hidden></button></footer>`;
  const button = root.querySelector('.entrance-enter');
  const notice = root.querySelector('[role=status]');
  const bar = root.querySelector('progress');
  const retry = root.querySelector('.entrance-retry');
  const canvas = document.getElementById('canvas');
  canvas?.setAttribute('inert', '');
  root.dataset.state = state;
  performance.mark('entrance-visible');
  function render() {
    const t = copy[lang];
    root.lang = lang;
    root.querySelector('h1').textContent = t.title;
    root.querySelector('.entrance-heading p').textContent = t.tag;
    button.querySelector('span').textContent = state === 'opening' ? t.opening : t.enter;
    button.querySelector('small').textContent = t.hint;
    retry.textContent = t.retry;
    if (!error) notice.textContent = state === 'ready' ? '' : (state === 'opening' ? t.opening : t.loading);
    root.classList.toggle('reduce-motion', reduced);
  }
  function signal() { window.dispatchEvent(new Event('entrancechange')); }
  function checkReady() {
    if (!loaded || !gameReady || state !== 'loading' || error) return;
    state = 'ready'; root.dataset.state = state;
    button.disabled = false; bar.hidden = true; retry.hidden = true;
    clearTimeout(slowTimer);
    performance.mark('entrance-ready'); render(); signal();
  }
  function finish() {
    if (state !== 'opening') return;
    state = 'entered'; root.dataset.state = state; root.hidden = true;
    canvas?.removeAttribute('inert'); canvas?.focus({preventScroll:true});
    performance.mark('entrance-home'); signal();
  }
  button.addEventListener('click', () => {
    if (state !== 'ready' || document.hidden) return;
    state = 'opening'; root.dataset.state = state; button.disabled = true;
    // Resume existing AudioContexts synchronously inside the user's gesture.
    window.ChainDelveAudio?.enter();
    performance.mark('entrance-pressed'); render(); signal();
    const instant = reduced || matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(finish, instant ? 0 : 2800);
  });
  retry.addEventListener('click', () => location.reload());
  const slowTimer = setTimeout(() => { if (state === 'loading' && !error) {notice.textContent = copy[lang].slow;retry.hidden = false;} }, 15000);
  window.ChainDelveEntrance = {
    get blocking() { return state === 'loading' || state === 'ready' || error; },
    get state() { return state; },
    configure(options) {lang = options.lang === 'en' ? 'en' : 'ko'; reduced = !!options.reduced; render();},
    // Both host boot and Godot's first home frame must finish before entry.
    loaded() { loaded = true; checkReady(); },
    gameReady() { gameReady = true; checkReady(); },
    progress(current, total) {
      if (state !== 'loading' || error) return;
      if (total > 0) { bar.value = Math.min(100, current / total * 100); notice.textContent = bar.value >= 100 ? copy[lang].final : `${copy[lang].loading} · ${Math.floor(bar.value)}%`; }
      else bar.removeAttribute('value');
    },
    fail() { error = true; clearTimeout(slowTimer); button.disabled = true; bar.hidden = true; retry.hidden = false; notice.textContent = copy[lang].fail; root.dataset.state = 'error'; signal(); }
  };
  render();
})();

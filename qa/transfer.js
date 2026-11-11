// Continue on another device. The progress travels inside the link the player copies;
// nothing is uploaded. The game packs and validates the code. This file only moves text
// between the page address, real DOM buttons (the clipboard needs a genuine tap) and the game.
(() => {
  const CODE = /DR1\.[A-Za-z0-9_-]+\.[0-9a-f]{8}/;
  let pending = '';
  let fromAddress = null;
  try { fromAddress = CODE.exec(decodeURIComponent(location.hash || '')); } catch (error) { fromAddress = null; }
  if (fromAddress) {
    pending = fromAddress[0];
    // Keep the code out of history, bookmarks and later shares of this page.
    history.replaceState(null, '', location.pathname + location.search);
  }
  let layer = null;
  function close() { if (layer) { layer.remove(); layer = null; } }
  function open(title, help) {
    close();
    layer = document.createElement('div');
    layer.id = 'transfer';
    layer.style.cssText = 'position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;background:#0b1a1fcc;font:16px/1.5 system-ui,sans-serif;touch-action:manipulation';
    const card = document.createElement('div');
    card.style.cssText = 'box-sizing:border-box;width:min(520px,92vw);max-height:90vh;overflow:auto;background:#fff4dc;color:#2e2433;border:2px solid #bb8a52;border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:12px';
    const heading = document.createElement('strong');
    heading.textContent = title;
    heading.style.fontSize = '19px';
    const note = document.createElement('div');
    note.textContent = help;
    card.append(heading, note);
    layer.append(card);
    document.body.append(layer);
    return card;
  }
  function field(readOnly, value, placeholder) {
    const box = document.createElement('textarea');
    box.rows = 4; box.readOnly = readOnly; box.value = value; box.placeholder = placeholder;
    box.spellcheck = false; box.autocapitalize = 'off'; box.autocomplete = 'off';
    box.style.cssText = 'box-sizing:border-box;width:100%;resize:none;border:2px solid #bb8a52;border-radius:10px;padding:10px;font:14px/1.4 ui-monospace,monospace;color:#2e2433;background:#fffaf0;word-break:break-all';
    return box;
  }
  function button(text, primary, action) {
    const item = document.createElement('button');
    item.type = 'button'; item.textContent = text;
    item.style.cssText = 'flex:1;min-height:48px;border-radius:10px;font:inherit;font-weight:600;cursor:pointer;border:1px solid ' + (primary ? '#0f4f4b;background:#237b76;color:#fff8e8' : '#bb8a52;background:#f1e1c3;color:#2e2433');
    item.addEventListener('click', action);
    return item;
  }
  function row() {
    const line = document.createElement('div');
    line.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
    return line;
  }
  window.ChainDelveTransfer = {
    // The game asks once per poll; a code is handed over exactly once.
    take() { const code = pending; pending = ''; return code; },
    link(code) { return location.origin + location.pathname + location.search + '#continue=' + code; },
    offer(code, text) {
      const card = open(text.title, text.help), address = this.link(code);
      const box = field(true, address, '');
      box.addEventListener('focus', () => box.select());
      const line = row();
      const copy = button(text.copy, true, async () => {
        let done = false;
        try { await navigator.clipboard.writeText(address); done = true; } catch (error) {
          box.focus(); box.select();
          try { done = document.execCommand('copy'); } catch (inner) { done = false; }
        }
        if (done) copy.textContent = text.copied;
      });
      line.append(copy);
      if (navigator.share) line.append(button(text.share, false, () => navigator.share({url: address}).catch(() => {})));
      line.append(button(text.close, false, close));
      card.append(box, line);
    },
    ask(text) {
      const card = open(text.title, text.help);
      const box = field(false, '', text.placeholder);
      const line = row();
      line.append(button(text.import, true, () => {
        const found = CODE.exec(box.value);
        if (!found) { box.style.borderColor = '#b0413e'; return; }
        pending = found[0];
        close();
      }), button(text.close, false, close));
      card.append(box, line);
      box.focus();
    },
    close,
  };
})();

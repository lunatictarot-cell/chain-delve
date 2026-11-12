// Run the game loop on every second display frame (30 a second on a phone).
// Engine.max_fps must stay off on the web: a single-threaded build cannot sleep, so the engine
// waits for the next frame by spinning on performance.now(). That held a CPU core at 100% on
// every screen, idle ones included, and starved the main-thread audio mixer at each frame.
// Skipping display frames here leaves the thread idle between game frames instead.
(() => {
  const request = window.requestAnimationFrame.bind(window);
  const cancel = window.cancelAnimationFrame.bind(window);
  // Phone displays tick 8.3-16.7 ms apart; the slack keeps timer jitter from costing a whole extra tick.
  // 72-75 Hz monitors land on every third tick (24-25 a second).
  const interval = 1000 / 30, slack = 4;
  const pending = new Map();
  let ids = 0, last = -Infinity;
  window.requestAnimationFrame = callback => {
    const id = ++ids;
    const step = now => {
      // Callbacks that share one display frame run together; a clock that steps back never stalls the loop.
      if (now > last && now - last < interval - slack) { pending.set(id, request(step)); return; }
      pending.delete(id); last = now; callback(now);
    };
    pending.set(id, request(step));
    return id;
  };
  window.cancelAnimationFrame = id => {
    if (!pending.has(id)) return;
    cancel(pending.get(id)); pending.delete(id);
  };
})();

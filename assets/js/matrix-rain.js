(() => {
  const canvas = document.getElementById("matrix-rain");
  const context = canvas && canvas.getContext("2d");
  if (!context) return;

  const toggle = document.getElementById("matrix-rain-toggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコ";
  const cell = 20;
  let width, height, spacing, drops;
  let frame = null;
  let lastTime = 0;
  let paused = false;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    // Bound canvas resolution and column count on high-DPI or very wide screens.
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.font = "14px monospace";
    spacing = Math.max(28, width / 90);
    drops = Array.from({ length: Math.ceil(width / spacing) },
      () => Math.floor(Math.random() * height / cell));
  }

  function draw(time) {
    frame = requestAnimationFrame(draw);
    if (time - lastTime < 70) return; // About 14 fps is enough for a quiet backdrop.
    lastTime = time;

    // Fade to transparency rather than painting over the site's theme background.
    context.globalCompositeOperation = "destination-out";
    context.fillStyle = "rgba(0, 0, 0, 0.09)";
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#18b868";
    drops.forEach((row, column) => {
      const y = row * cell;
      context.fillText(characters[Math.floor(Math.random() * characters.length)],
        column * spacing, y);
      drops[column] = y > height && Math.random() > 0.975 ? 0 : row + 1;
    });
  }

  function sync() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    toggle.hidden = reducedMotion.matches;
    if (reducedMotion.matches) context.clearRect(0, 0, width, height);
    if (!paused && !document.hidden && !reducedMotion.matches) {
      lastTime = 0;
      frame = requestAnimationFrame(draw);
    }
  }

  toggle.addEventListener("click", () => {
    paused = !paused;
    toggle.textContent = paused ? "Resume background" : "Pause background";
    sync();
  });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  resize();
  sync();
})();

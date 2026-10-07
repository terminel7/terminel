export function mountCinematicHero(hero: HTMLElement) {
  const image = hero.querySelector<HTMLImageElement>("[data-cinematic-image]");
  if (!image) return;

  const motion = matchMedia("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (min-width: 701px)");
  const abort = new AbortController();
  const { signal } = abort;
  let frame = 0;
  let lastTime = 0;
  let entrance = 1;
  let visible = true;
  let enabled = false;
  let decoded = false;
  let disposed = false;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  let bounds = hero.getBoundingClientRect();

  const paint = () => {
    image.style.setProperty("--pan-x", `${x.toFixed(3)}px`);
    image.style.setProperty("--pan-y", `${y.toFixed(3)}px`);
    image.style.setProperty("--image-scale", String(1 + 0.035 * (1 - entrance) ** 3));
  };

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    delete hero.dataset.motion;
  };

  const schedule = () => {
    if (disposed || !decoded || !enabled || !visible || document.hidden || frame) return;
    frame = requestAnimationFrame(tick);
    hero.dataset.motion = "active";
  };

  function tick(time: number) {
    frame = 0;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = time;
    const damping = 1 - Math.exp(-6 * delta);
    x += (targetX - x) * damping;
    y += (targetY - y) * damping;
    entrance = Math.min(1, entrance + delta / 2.4);
    const unsettled = Math.abs(x - targetX) + Math.abs(y - targetY) > 0.01;
    if (!unsettled) { x = targetX; y = targetY; }
    paint();
    if (entrance < 1 || unsettled) schedule();
    else stop();
  }

  const updateMotion = () => {
    stop();
    enabled = motion.matches;
    x = y = targetX = targetY = 0;
    entrance = 1;
    paint();
  };

  hero.addEventListener("pointerenter", () => { bounds = hero.getBoundingClientRect(); }, { passive: true, signal });
  hero.addEventListener("pointermove", (event) => {
    if (!enabled || event.pointerType === "touch") return;
    const horizontal = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const vertical = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    // Pan within the overscan, without rotation, perspective, or image distortion.
    targetX = -horizontal * 12;
    targetY = -vertical * 9;
    schedule();
  }, { passive: true, signal });

  const settle = () => { targetX = targetY = 0; schedule(); };
  hero.addEventListener("pointerleave", settle, { signal });
  window.addEventListener("blur", settle, { signal });
  window.addEventListener("scroll", () => { bounds = hero.getBoundingClientRect(); }, { passive: true, signal });

  const resize = new ResizeObserver(() => { bounds = hero.getBoundingClientRect(); });
  resize.observe(hero);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else { stop(); targetX = targetY = x = y = 0; paint(); }
  });
  intersection.observe(hero);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else schedule();
  }, { signal });
  motion.addEventListener("change", updateMotion, { signal });
  updateMotion();
  if (enabled) { entrance = 0; paint(); }

  // Begin only once the actual artwork is decoded; never hide the HTML fallback.
  void image.decode().then(() => {
    decoded = true;
    if (disposed || !enabled || !visible) return;
    schedule();
  }).catch(() => { if (!disposed) updateMotion(); });

  const dispose = () => {
    disposed = true;
    stop();
    abort.abort();
    resize.disconnect();
    intersection.disconnect();
    image.style.removeProperty("--pan-x");
    image.style.removeProperty("--pan-y");
    image.style.removeProperty("--image-scale");
  };
  document.addEventListener("astro:before-swap", dispose, { once: true, signal });
  return dispose;
}

const DURATION = 5600;
const DISSOLVE = 1200;

export function mountPortfolioReel(root: HTMLElement) {
  const images = [...root.querySelectorAll<HTMLImageElement>("[data-reel-image]")];
  const captions = [...root.querySelectorAll<HTMLElement>("[data-reel-caption]")];
  const controls = root.querySelector<HTMLElement>("[data-reel-controls]")!;
  const pause = root.querySelector<HTMLButtonElement>("[data-reel-pause]")!;
  const counter = root.querySelector<HTMLElement>("[data-reel-count]")!;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const ready = new Set<number>();
  let current = 0;
  let elapsed = 0;
  let paused = reducedMotion.matches;
  let visible = true;
  let focused = false;
  let frame = 0;
  let previous = 0;
  let disposed = false;

  images.forEach((image, index) => {
    image.loading = "eager";
    image.decode().then(() => { if (!disposed) ready.add(index); }).catch(() => {});
  });
  function nextIndex(direction = 1) {
    for (let offset = 1; offset < images.length; offset++) {
      const index = (current + direction * offset + images.length) % images.length;
      if (ready.has(index)) return index;
    }
    return current;
  }
  function updateCaption() {
    captions.forEach((caption, index) => {
      caption.hidden = index !== current;
      caption.removeAttribute("data-entering");
    });
    const activeCaption = captions[current];
    if (activeCaption && !reducedMotion.matches) {
      void activeCaption.offsetWidth;
      activeCaption.setAttribute("data-entering", "");
    }
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
  }
  function render() {
    const next = nextIndex();
    const progress = Math.max(0, Math.min(1, (elapsed - DURATION + DISSOLVE) / DISSOLVE));
    const dissolve = progress * progress * (3 - 2 * progress);
    images.forEach((image, index) => {
      const active = index === current;
      const incoming = index === next && next !== current;
      image.style.opacity = active ? "1" : incoming ? String(dissolve) : "0";
      image.style.zIndex = incoming ? "1" : "0";
      const age = active ? (elapsed + DISSOLVE) / (DURATION + DISSOLVE) : progress * DISSOLVE / (DURATION + DISSOLVE);
      const scale = reducedMotion.matches ? 1 : 1.02 + age * .035;
      const drift = reducedMotion.matches ? 0 : (index % 2 ? -1 : 1) * age * .6;
      image.style.transform = `translateX(${drift}%) scale(${scale})`;
    });
  }
  function running() { return !paused && visible && !focused && !document.hidden; }
  function tick(now: number) {
    if (!running()) { frame = 0; previous = 0; return; }
    if (previous && ready.has(current) && nextIndex() !== current) elapsed += Math.min(now - previous, 64);
    previous = now;
    if (elapsed >= DURATION) { current = nextIndex(); elapsed %= DURATION; updateCaption(); }
    render();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    pause.setAttribute("aria-pressed", String(paused));
    const label = paused ? "Play slideshow" : "Pause slideshow";
    pause.setAttribute("aria-label", label);
    pause.title = label;
    if (running() && !frame) frame = requestAnimationFrame(tick);
    if (!running() && frame) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  }
  function select(direction: number) {
    paused = true;
    current = nextIndex(direction);
    elapsed = 0;
    updateCaption();
    render();
    sync();
  }
  pause.addEventListener("click", () => { paused = !paused; sync(); }, options);
  root.querySelector("[data-reel-previous]")!.addEventListener("click", () => select(-1), options);
  root.querySelector("[data-reel-next]")!.addEventListener("click", () => select(1), options);
  const captionArea = root.querySelector<HTMLElement>(".portfolio-reel__captions")!;
  captionArea.addEventListener("focusin", () => { focused = true; sync(); }, options);
  captionArea.addEventListener("focusout", () => { focused = false; sync(); }, options);
  document.addEventListener("visibilitychange", sync, options);
  reducedMotion.addEventListener("change", () => { paused = reducedMotion.matches; elapsed = 0; render(); sync(); }, options);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(root);
  controls.hidden = false;
  render();
  sync();
  document.addEventListener("astro:before-swap", () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    abort.abort();
  }, { once: true, signal: abort.signal });
}

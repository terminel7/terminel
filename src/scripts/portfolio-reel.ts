const DURATION = 5600;
const DISSOLVE = 1200;

export function mountPortfolioReel(root: HTMLElement) {
  const images = [...root.querySelectorAll<HTMLImageElement>("[data-reel-image]")];
  const captions = [...root.querySelectorAll<HTMLElement>("[data-reel-caption]")];
  const controls = root.querySelector<HTMLElement>("[data-reel-controls]")!;
  const support = root.querySelector<HTMLElement>("[data-reel-support]")!;
  const headline = root.querySelector<HTMLElement>("h1")!;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const ready = new Set<number>();
  let current = 0;
  let elapsed = 0;
  let visible = true;
  let focused = false;
  let frame = 0;
  let previous = 0;
  let revealCurrent = 0;
  let revealTarget = 0;
  let revealFrame = 0;
  let revealPrevious = 0;
  let supportInteractive = false;
  let disposed = false;

  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const ease = (value: number) => {
    const amount = clamp(value);
    return amount * amount * (3 - (2 * amount));
  };

  function readRevealProgress() {
    const distance = Math.max(root.offsetHeight - window.innerHeight, 1);
    return clamp(-root.getBoundingClientRect().top / distance);
  }

  function renderReveal(progress: number) {
    const reveal = reducedMotion.matches
      ? Number(progress > 0.08)
      : ease((progress - 0.04) / 0.54);
    const overlay = reducedMotion.matches
      ? reveal
      : ease((progress - 0.08) / 0.5);
    const supporting = reducedMotion.matches
      ? reveal
      : ease((progress - 0.2) / 0.48);
    const introDistance = (headline.offsetHeight * 0.55) + (window.innerWidth < 700 ? 26 : 34);

    root.style.setProperty("--reel-overlay-opacity", String(overlay));
    root.style.setProperty("--reel-intro-y", `${introDistance * (1 - reveal)}px`);
    root.style.setProperty("--reel-support-opacity", String(supporting));
    root.style.setProperty("--reel-support-y", `${28 * (1 - supporting)}px`);
    root.dataset.reelRevealed = progress > 0.13 ? "true" : "false";

    const interactive = supporting > 0.45;
    if (interactive !== supportInteractive) {
      supportInteractive = interactive;
      support.toggleAttribute("inert", !interactive);
      support.setAttribute("aria-hidden", String(!interactive));
    }
  }

  function animateReveal(now: number) {
    const delta = Math.min(Math.max((now - revealPrevious) / 1000, 1 / 120), 0.05);
    const damping = 1 - Math.exp(-delta * 8);
    revealPrevious = now;
    revealCurrent = Math.abs(revealTarget - revealCurrent) < 0.0005
      ? revealTarget
      : revealCurrent + ((revealTarget - revealCurrent) * damping);
    renderReveal(revealCurrent);

    if (revealCurrent !== revealTarget) revealFrame = requestAnimationFrame(animateReveal);
    else revealFrame = 0;
  }

  function requestReveal() {
    revealTarget = readRevealProgress();
    if (reducedMotion.matches) {
      revealCurrent = revealTarget;
      renderReveal(revealCurrent);
      return;
    }
    if (!revealFrame) {
      revealPrevious = performance.now();
      revealFrame = requestAnimationFrame(animateReveal);
    }
  }

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
  function running() { return !reducedMotion.matches && visible && !focused && !document.hidden; }
  function tick(now: number) {
    if (!running()) { frame = 0; previous = 0; return; }
    if (previous && ready.has(current) && nextIndex() !== current) elapsed += Math.min(now - previous, 64);
    previous = now;
    if (elapsed >= DURATION) { current = nextIndex(); elapsed %= DURATION; updateCaption(); }
    render();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (running() && !frame) frame = requestAnimationFrame(tick);
    if (!running() && frame) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  }
  function select(direction: number) {
    current = nextIndex(direction);
    elapsed = 0;
    updateCaption();
    render();
    sync();
  }
  root.querySelector("[data-reel-previous]")!.addEventListener("click", () => select(-1), options);
  root.querySelector("[data-reel-next]")!.addEventListener("click", () => select(1), options);
  const captionArea = root.querySelector<HTMLElement>(".portfolio-reel__captions")!;
  captionArea.addEventListener("focusin", () => { focused = true; sync(); }, options);
  captionArea.addEventListener("focusout", () => { focused = false; sync(); }, options);
  document.addEventListener("visibilitychange", sync, options);
  reducedMotion.addEventListener("change", () => {
    elapsed = 0;
    render();
    sync();
    requestReveal();
  }, options);
  window.addEventListener("scroll", requestReveal, { passive: true, signal: abort.signal });
  window.addEventListener("resize", requestReveal, { passive: true, signal: abort.signal });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(root);
  controls.hidden = false;
  root.dataset.reelReady = "true";
  revealTarget = readRevealProgress();
  revealCurrent = revealTarget;
  renderReveal(revealCurrent);
  render();
  sync();
  document.addEventListener("astro:before-swap", () => {
    disposed = true;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(revealFrame);
    observer.disconnect();
    abort.abort();
  }, { once: true, signal: abort.signal });
}

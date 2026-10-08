import {
  CanvasTexture, ImageLoader, Mesh, MeshBasicMaterial, PerspectiveCamera,
  PlaneGeometry, Scene, SRGBColorSpace, WebGLRenderer,
} from "three";
import { advanceRing, coverRepeat, PANEL_HEIGHT, PANEL_WIDTH, ringPose, verticalFieldOfView } from "./ring-gallery-layout";

export async function mountRingGallery(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-ring-stage]")!;
  const canvas = root.querySelector<HTMLCanvasElement>("[data-ring-canvas]")!;
  const button = root.querySelector<HTMLButtonElement>("[data-ring-pause]")!;
  const images = Array.from(root.querySelectorAll<HTMLImageElement>("[data-ring-image]"));
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const abort = new AbortController();
  const { signal } = abort;
  const textures: CanvasTexture[] = [];
  const materials: MeshBasicMaterial[] = [];
  const meshes: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  const geometry = new PlaneGeometry(PANEL_WIDTH, PANEL_HEIGHT);
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  let renderer: WebGLRenderer | undefined;
  let resize: ResizeObserver | undefined;
  let intersection: IntersectionObserver | undefined;
  let disposed = false;
  let ready = false;
  let visible = true;
  let paused = reducedMotion.matches;
  let frame = 0;
  let previousTime = 0;
  let phase = 0;
  let yaw = 0;
  let pitch = 0;
  let targetYaw = 0;
  let targetPitch = 0;
  let bounds = stage.getBoundingClientRect();

  const stop = () => { cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stop();
    abort.abort();
    resize?.disconnect();
    intersection?.disconnect();
    textures.forEach((texture) => texture.dispose());
    materials.forEach((material) => material.dispose());
    geometry.dispose();
    renderer?.dispose();
    delete root.dataset.ready;
    button.hidden = true;
  };
  document.addEventListener("astro:before-swap", dispose, { once: true, signal });

  const schedule = () => {
    if (!disposed && ready && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick);
  };

  function draw() {
    meshes.forEach((mesh, index) => {
      const pose = ringPose(index, meshes.length, phase);
      mesh.position.set(pose.x, 0, pose.z);
      mesh.rotation.y = pose.rotation;
    });
    camera.rotation.set(pitch, yaw, 0, "YXZ");
    renderer!.render(scene, camera);
  }

  function tick(time: number) {
    frame = 0;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    if (!paused) phase = advanceRing(phase, delta);
    const smoothing = 1 - Math.exp(-3.5 * delta);
    yaw += (targetYaw - yaw) * smoothing;
    pitch += (targetPitch - pitch) * smoothing;
    draw();
    const movingCamera = Math.abs(targetYaw - yaw) + Math.abs(targetPitch - pitch) > 0.00005;
    if (!paused || movingCamera) schedule();
    else previousTime = 0;
  }

  const measure = () => {
    if (!renderer || disposed) return;
    bounds = stage.getBoundingClientRect();
    const mobile = bounds.width <= 700;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / Math.max(1, bounds.height);
    camera.fov = verticalFieldOfView(mobile ? 60 : 108, camera.aspect);
    // The camera stays inside the ring, behind its center on desktop.
    camera.position.set(mobile ? 0 : 0.8, 0.1, mobile ? -4 : 6);
    camera.updateProjectionMatrix();
    schedule();
  };

  const updateButton = () => {
    button.setAttribute("aria-pressed", String(paused));
    button.title = paused ? "Resume gallery motion" : "Pause gallery motion";
  };

  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    const loader = new ImageLoader();
    const sources = await Promise.all(images.map((image) => loader.loadAsync(image.src)));
    if (disposed) return;
    const limit = innerWidth <= 700 ? 1024 : 1600;
    for (const source of sources) {
      const ratio = Math.min(1, limit / Math.max(source.width, source.height));
      const surface = document.createElement("canvas");
      surface.width = Math.round(source.width * ratio);
      surface.height = Math.round(source.height * ratio);
      const context = surface.getContext("2d");
      if (!context) throw new Error("Image preparation unavailable");
      context.drawImage(source, 0, 0, surface.width, surface.height);
      const texture = new CanvasTexture(surface);
      textures.push(texture);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const repeat = coverRepeat(source.width / source.height);
      texture.repeat.set(repeat.x, repeat.y);
      texture.offset.set((1 - repeat.x) / 2, (1 - repeat.y) / 2);
      const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
      materials.push(material);
    }

    // Two copies of the selection fill a complete ring, with no visible reset.
    for (let index = 0; index < sources.length * 2; index++) {
      const mesh = new Mesh(geometry, materials[index % materials.length]);
      scene.add(mesh);
      meshes.push(mesh);
    }
    ready = true;
    measure();
    draw();
    root.dataset.ready = "true";
    button.hidden = false;
    updateButton();

    button.addEventListener("click", () => {
      paused = !paused;
      if (paused) { targetYaw = yaw; targetPitch = pitch; stop(); }
      updateButton();
      schedule();
    }, { signal });
    reducedMotion.addEventListener("change", () => {
      paused = reducedMotion.matches;
      targetYaw = targetPitch = yaw = pitch = 0;
      updateButton();
      schedule();
    }, { signal });
    root.addEventListener("pointermove", (event) => {
      if (paused || !finePointer.matches || reducedMotion.matches || event.pointerType === "touch") return;
      const rect = root.getBoundingClientRect();
      targetYaw = -Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)) * 0.055;
      targetPitch = -Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)) * 0.025;
      schedule();
    }, { passive: true, signal });
    root.addEventListener("pointerleave", () => { if (!paused) { targetYaw = targetPitch = 0; schedule(); } }, { signal });
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else schedule(); }, { signal });
    canvas.addEventListener("webglcontextlost", (event) => { event.preventDefault(); dispose(); }, { signal });
    resize = new ResizeObserver(measure);
    resize.observe(stage);
    intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule(); else stop();
    });
    intersection.observe(stage);
    schedule();
  } catch (error) {
    dispose();
    console.warn("Portfolio ring is using its still-image fallback.", error);
  }
  return dispose;
}

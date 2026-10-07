import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../../src/scripts/cinematic-hero.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

async function setup(matches = true) {
  /** @type {Map<number, (time: number) => void>} */
  const frames = new Map();
  /** @type {Map<string, string>} */
  const properties = new Map();
  const motion = Object.assign(new EventTarget(), { matches });
  const document = Object.assign(new EventTarget(), { hidden: false });
  const window = new EventTarget();
  /** @type {(entries: { isIntersecting: boolean }[]) => void} */
  let observer = () => {};
  let sequence = 0;
  let time = 0;
  const image = {
    decode: () => Promise.resolve(),
    style: {
      /** @param {string} key @param {string} value */
      setProperty: (key, value) => properties.set(key, value),
      /** @param {string} key */
      removeProperty: (key) => properties.delete(key),
    },
  };
  const hero = Object.assign(new EventTarget(), {
    dataset: /** @type {Record<string, string>} */ ({}),
    querySelector: () => image,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 800 }),
  });
  /** @type {{ mountCinematicHero: (hero: EventTarget) => () => void }} */
  const exports = { mountCinematicHero: () => () => {} };
  runInNewContext(compiled, {
    exports, window, document, AbortController,
    matchMedia: () => motion,
    /** @param {(time: number) => void} callback */
    requestAnimationFrame: (callback) => { frames.set(++sequence, callback); return sequence; },
    /** @param {number} id */
    cancelAnimationFrame: (id) => frames.delete(id),
    ResizeObserver: class { observe() {} disconnect() {} },
    IntersectionObserver: class {
      /** @param {(entries: { isIntersecting: boolean }[]) => void} callback */
      constructor(callback) { observer = callback; }
      observe() {} disconnect() {}
    },
  });
  const dispose = exports.mountCinematicHero(hero);
  await Promise.resolve();
  const drain = () => {
    for (let count = 0; frames.size && count < 600; count++) {
      const batch = [...frames.values()];
      frames.clear();
      time += 1000 / 60;
      batch.forEach((callback) => callback(time));
    }
    assert.equal(frames.size, 0, "Animation must stop when settled");
  };
  /** @param {number} clientX @param {number} clientY */
  const pointer = (clientX, clientY, pointerType = "mouse") => {
    const event = new Event("pointermove");
    Object.assign(event, { clientX, clientY, pointerType });
    hero.dispatchEvent(event);
  };
  return { hero, motion, document, properties, frames, drain, pointer, dispose,
    /** @param {boolean} isIntersecting */
    intersect: (isIntersecting) => observer([{ isIntersecting }]),
  };
}

test("entrance settles, mouse pan stays bounded, and leaving returns to center", async () => {
  const state = await setup();
  assert.equal(state.properties.get("--image-scale"), "1.035");
  state.drain();
  assert.equal(state.properties.get("--image-scale"), "1");
  state.pointer(2000, 1600);
  state.drain();
  assert.equal(state.properties.get("--pan-x"), "-12.000px");
  assert.equal(state.properties.get("--pan-y"), "-9.000px");
  state.hero.dispatchEvent(new Event("pointerleave"));
  state.drain();
  assert.equal(state.properties.get("--pan-x"), "0.000px");
  assert.equal(state.hero.dataset.motion, undefined);
  state.dispose();
});

test("reduced motion or coarse input remains static, including preference changes", async () => {
  const state = await setup(false);
  state.pointer(1000, 700);
  assert.equal(state.frames.size, 0);
  assert.equal(state.properties.get("--image-scale"), "1");
  state.motion.matches = true;
  state.motion.dispatchEvent(new Event("change"));
  state.pointer(1000, 700);
  assert.equal(state.frames.size, 1);
  state.motion.matches = false;
  state.motion.dispatchEvent(new Event("change"));
  assert.equal(state.frames.size, 0);
  assert.equal(state.properties.get("--pan-x"), "0.000px");
  state.dispose();
});

test("touch input does not pan and hidden/offscreen scenes stop scheduling", async () => {
  const state = await setup();
  state.drain();
  state.pointer(1000, 700, "touch");
  assert.equal(state.frames.size, 0);
  state.pointer(1000, 700);
  state.intersect(false);
  assert.equal(state.frames.size, 0);
  state.intersect(true);
  state.document.hidden = true;
  state.document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(state.frames.size, 0);
  state.dispose();
});

test("teardown removes animation state and input listeners", async () => {
  const state = await setup();
  state.dispose();
  state.pointer(1000, 700);
  assert.equal(state.frames.size, 0);
  assert.equal(state.properties.size, 0);
});

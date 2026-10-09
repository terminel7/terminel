import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../../src/scripts/portfolio-reel.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

/**
 * @typedef {{ style: Record<string, string>, hidden: boolean, attributes: Record<string, string>,
 * addEventListener(name: string, callback: () => void): void,
 * setAttribute(name: string, value: string): void, removeAttribute(name: string): void,
 * offsetWidth: number, emit(name: string): void }} MockElement
 */
/** @returns {MockElement} */
function element() {
  const events = new Map();
  return {
    style: {}, hidden: false, attributes: {}, offsetWidth: 100,
    addEventListener(name, callback) { events.set(name, callback); },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    emit(name) { events.get(name)?.(); },
  };
}

/** @param {{reduced?: boolean, failed?: number[]}} options */
async function setup({ reduced = false, failed = [] } = {}) {
  const images = Array.from({ length: 4 }, (_, i) => ({ ...element(), decode: () => failed.includes(i) ? Promise.reject() : Promise.resolve() }));
  const captions = images.map((_, i) => ({ ...element(), hidden: i !== 0 }));
  const selectors = Object.fromEntries(["controls", "pause", "count", "previous", "next"].map(name => [`[data-reel-${name}]`, element()]));
  selectors[".portfolio-reel__captions"] = element();
  const root = {
    /** @param {string} selector */
    querySelectorAll: selector => selector === "[data-reel-image]" ? images : captions,
    /** @param {string} selector */
    querySelector: selector => selectors[selector],
  };
  const document = { ...element(), hidden: false };
  const media = { ...element(), matches: reduced };
  const frames = new Map();
  let id = 0, now = 0;
  /** @type {(entries: {isIntersecting: boolean}[]) => void} */
  let intersection;
  const context = { exports: /** @type {{mountPortfolioReel(element: typeof root): void}} */ ({}), document, matchMedia: () => media, AbortController,
    /** @param {(time: number) => void} callback */
    requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
    /** @param {number} id */
    cancelAnimationFrame(id) { frames.delete(id); },
    IntersectionObserver: class {
      /** @param {(entries: {isIntersecting: boolean}[]) => void} callback */
      constructor(callback) { intersection = callback; }
      observe() {}
      disconnect() {}
    },
  };
  vm.runInNewContext(compiled, context);
  context.exports.mountPortfolioReel(root);
  await Promise.resolve();
  await Promise.resolve();
  return {
    images, captions, document, selectors, frames,
    /** @param {string} name */
    click(name) { selectors[`[data-reel-${name}]`].emit("click"); },
    /** @param {boolean} value */
    visible(value) { intersection([{ isIntersecting: value }]); },
    /** @param {number} ms */
    step(ms) {
      for (let elapsed = 0; elapsed < ms; elapsed += 16) {
        now += 16;
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach(callback => callback(now));
      }
    },
  };
}

test("dissolve keeps the outgoing frame opaque, then updates the matching caption", async () => {
  const reel = await setup();
  reel.step(5000);
  assert.equal(reel.images[0].style.opacity, "1");
  assert.ok(Number(reel.images[1].style.opacity) > .3);
  assert.ok(Number(reel.images[1].style.opacity) < .7);
  reel.step(800);
  assert.equal(reel.captions[1].hidden, false);
  assert.equal(reel.captions[1].attributes["data-entering"], "");
  assert.equal(reel.captions[0].hidden, true);
  assert.equal(reel.images[1].style.opacity, "1");
});

test("pause holds the image and manual navigation wraps without restarting autoplay", async () => {
  const reel = await setup();
  reel.step(1000);
  reel.click("pause");
  const transform = reel.images[0].style.transform;
  reel.step(7000);
  assert.equal(reel.images[0].style.transform, transform);
  reel.click("previous");
  assert.equal(reel.captions[3].hidden, false);
  reel.click("next");
  assert.equal(reel.captions[0].hidden, false);
  assert.equal(reel.frames.size, 0);
});

test("hidden tabs, offscreen content, and focused captions suspend playback", async () => {
  const reel = await setup();
  reel.visible(false);
  assert.equal(reel.frames.size, 0);
  reel.visible(true);
  assert.equal(reel.frames.size, 1);
  reel.document.hidden = true;
  reel.document.emit("visibilitychange");
  assert.equal(reel.frames.size, 0);
  reel.document.hidden = false;
  reel.document.emit("visibilitychange");
  reel.selectors[".portfolio-reel__captions"].emit("focusin");
  assert.equal(reel.frames.size, 0);
  reel.selectors[".portfolio-reel__captions"].emit("focusout");
  assert.equal(reel.frames.size, 1);
});

test("reduced motion starts static but allows manual browsing", async () => {
  const reel = await setup({ reduced: true });
  assert.equal(reel.frames.size, 0);
  assert.equal(reel.images[0].style.transform, "translateX(0%) scale(1)");
  reel.click("next");
  assert.equal(reel.captions[1].hidden, false);
  assert.equal(reel.images[1].style.transform, "translateX(0%) scale(1)");
});

test("unavailable incoming images are skipped", async () => {
  const reel = await setup({ failed: [1] });
  reel.click("next");
  assert.equal(reel.captions[2].hidden, false);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../../src/scripts/ring-gallery-layout.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
/** @type {typeof import("../../src/scripts/ring-gallery-layout")} */
const layout = runInNewContext(`${compiled}; exports;`, { exports: {} });

test("all panels stay on the ring and face inward", () => {
  for (let i = 0; i < 14; i++) {
    const pose = layout.ringPose(i, 14, 0.73);
    assert(Math.abs(Math.hypot(pose.x, pose.z) - layout.RING_RADIUS) < 1e-8);
    const facingCenter = Math.sin(pose.rotation) * -pose.x + Math.cos(pose.rotation) * -pose.z;
    assert(Math.abs(facingCenter - layout.RING_RADIUS) < 1e-8);
  }
  assert(layout.PANEL_WIDTH < 2 * layout.RING_RADIUS * Math.tan(Math.PI / 14));
});

test("motion keeps one direction and does not jump after a suspended frame", () => {
  assert(layout.advanceRing(0.4, 1 / 60) > 0.4);
  assert.equal(layout.advanceRing(0.4, 20), layout.advanceRing(0.4, 0.05));
  assert.equal(layout.advanceRing(0.4, -1), 0.4);
  const before = layout.ringPose(0, 14, 0.2);
  const after = layout.ringPose(0, 14, 0.21);
  assert(after.x < before.x);
});

test("one full rotation returns to the same pose without a discontinuity", () => {
  const first = layout.ringPose(3, 14, 0.2);
  const repeated = layout.ringPose(3, 14, 0.2 + Math.PI * 2);
  assert(Math.abs(first.x - repeated.x) < 1e-8);
  assert(Math.abs(first.z - repeated.z) < 1e-8);
});

test("responsive field of view and cover cropping preserve image proportions", () => {
  for (const aspect of [0.5, 1, 1.7, 3]) {
    const repeat = layout.coverRepeat(aspect);
    assert(repeat.x > 0 && repeat.x <= 1 && repeat.y > 0 && repeat.y <= 1);
    assert(Math.abs(aspect * repeat.x / repeat.y - layout.PANEL_WIDTH / layout.PANEL_HEIGHT) < 1e-8);
  }
  for (const [horizontal, aspect] of [[108, 4], [60, 1.4]]) {
    const vertical = layout.verticalFieldOfView(horizontal, aspect);
    const recovered = 2 * Math.atan(Math.tan(vertical * Math.PI / 360) * aspect) * 180 / Math.PI;
    assert(Math.abs(recovered - horizontal) < 1e-8);
  }
});

export const RING_RADIUS = 14;
export const PANEL_WIDTH = 6;
export const PANEL_HEIGHT = 6.2;
export const RING_SPEED = 0.035;
const TURN = Math.PI * 2;

export function ringPose(index: number, count: number, phase: number) {
  const angle = index / count * TURN - phase;
  return {
    x: Math.sin(angle) * RING_RADIUS,
    z: -Math.cos(angle) * RING_RADIUS,
    rotation: -angle,
  };
}

export function advanceRing(phase: number, seconds: number) {
  return (phase + Math.max(0, Math.min(seconds, 0.05)) * RING_SPEED) % TURN;
}

export function verticalFieldOfView(horizontalDegrees: number, aspect: number) {
  return 2 * Math.atan(Math.tan(horizontalDegrees * Math.PI / 360) / Math.max(0.1, aspect)) * 180 / Math.PI;
}

export function coverRepeat(imageAspect: number) {
  const aspect = PANEL_WIDTH / PANEL_HEIGHT;
  return imageAspect > aspect
    ? { x: aspect / imageAspect, y: 1 }
    : { x: 1, y: imageAspect / aspect };
}

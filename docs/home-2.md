# Homepage Treatments

The cinematic portfolio reel is the main homepage. The earlier WebGL gradient
homepage remains available at `/home-2/` as an alternate treatment.

The full-viewport header uses four full-bleed portfolio images, gentle camera drift, and a
1.2-second dissolve on a 5.6-second cycle. The headline stays stationary over a
neutral readability shade. This is animated photography, not video or a WebGL scene.
The headline enters word by word on load, and each project caption uses a short
staggered reveal when the active image changes.

Edit reel artwork, captions, links, and desktop/mobile focal points in
`src/components/home-two/PortfolioReel.astro`. Timing and playback live in
`src/scripts/portfolio-reel.ts`; scoped styling lives in `src/styles/home-two.css`.

Playback pauses offscreen, in hidden tabs, and while a project link has focus.
Manual navigation pauses autoplay. Reduced-motion preferences start paused and
disable camera movement. Without JavaScript, the first image and link remain.
Failed images are skipped; the outgoing image stays opaque during dissolves to
avoid a dark flash between slides. Controls have accessible names and titles.

Run `npm run check`, `npm run build`, and `node --test tests/home-two/portfolio-reel.test.mjs`.

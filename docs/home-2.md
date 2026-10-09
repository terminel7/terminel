# Home 2 Experiment

`/home-2/` is isolated from the main homepage and absent from public navigation.

The full-viewport header uses four full-bleed portfolio images, gentle camera drift, and a
1.2-second dissolve on a 5.6-second cycle. The headline and upper gradient wash
stay stationary. This is animated photography, not video or a WebGL scene.

Edit artwork, captions, and desktop/mobile focal points in
`src/components/home-two/PortfolioReel.astro`. Timing and playback live in
`src/scripts/portfolio-reel.ts`; scoped styling lives in `src/styles/home-two.css`.

Playback pauses offscreen, in hidden tabs, and while a project link has focus.
Manual navigation pauses autoplay. Reduced-motion preferences start paused and
disable camera movement. Without JavaScript, the first image and link remain.
Failed images are skipped; the outgoing image stays opaque during dissolves to
avoid a dark flash between slides. Controls have accessible names and titles.

Run `npm run check`, `npm run build`, and `node --test tests/home-two/portfolio-reel.test.mjs`.

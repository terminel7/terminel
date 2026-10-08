# Home 2 Experiment

`/home-2/` is an Astro experiment, absent from the public navigation. Its header
stays isolated; the compact project grid is shared with the main homepage.

## Circulating Gallery

Fourteen inward-facing image planes form a complete ring around the viewer.
The seven portfolio hero images repeat twice, with shared textures and materials.
The camera sits inside the ring, slightly off-center. The ring moves continuously
in one direction; pointer movement only adjusts the viewing angle a few degrees.
Text and navigation are normal, stationary HTML outside the canvas.

The pause button stops circulation. Reduced-motion preferences start paused.
Mobile uses a closer viewpoint and narrower field of view. Animation pauses when
offscreen or in a hidden tab. Without WebGL or JavaScript, a static image strip
remains, with ordinary project links in the grid below.

## Editing

- `src/components/home-two/RingHero.astro`: artwork sources, copy, and controls.
- `src/scripts/ring-gallery.ts`: Three.js scene and interaction lifecycle.
- `src/scripts/ring-gallery-layout.ts`: radius, panel dimensions, speed, and framing.
- `src/styles/home-two.css`: isolated header styles and responsive layout.

Three.js loads only on `/home-2/`. No shared project data or live homepage behavior
is changed. The main homepage still excludes Private Equity; the project remains
available through case-study navigation.

Run `npm run dev` and open `/home-2/`. Verify with `npm run check`, `npm run build`,
and `node --test tests/home-two/ring-gallery.test.mjs`.

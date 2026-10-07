# Home 2 Experiment

`/home-2/` is an isolated Astro experiment, absent from the public navigation.
The published homepage, shared components, and project pages are unchanged.

## Header

A single Streaming project image fills the header behind stationary copy. On
desktop, the image settles from a 3.5% closer crop over 2.4 seconds. Mouse movement
pans at most 12px horizontally and 9px vertically, with frame-rate-independent
easing. Leaving the header returns the image to center. There is no perspective,
warping, scroll capture, or Three.js dependency.

Touch devices, narrow viewports, and reduced-motion preferences receive the static
image. The image, text, and project link also work without JavaScript. Rendering
stops when the image settles, the header leaves view, or the tab is hidden.

## Editing

- `src/components/home-two/CinematicHero.astro`: featured artwork and hero markup.
- `src/styles/home-two.css`: route-scoped layout, image crop, and responsive styles.
- `src/scripts/cinematic-hero.ts`: pointer response and entrance motion.
- `src/pages/home-2.astro`: normal six-project grid, Expertise section, and footer.

The grid uses the first six existing projects, with three columns on desktop and
two on smaller screens. The original homepage still includes all seven projects.

Run `npm run dev` and open `/home-2/`. Run `npm run check` and `npm run build`
before publishing. Run `node --test tests/home-two/cinematic-hero.test.mjs` for
motion limits, idle behavior, preference changes, touch input, and cleanup tests.

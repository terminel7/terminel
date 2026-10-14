# Home 2 Header Images

These 15 images are used only by the animated header collage on `/home-2`.
They are separate from the images in `public/images/capabilities-abstract`, which
power the capabilities showcases.

## File map

The filename identifies the image's position in the five-column, three-row
collage:

| Column | Top | Middle | Bottom |
| --- | --- | --- | --- |
| 1 | `column-01-row-01.webp` | `column-01-row-02.webp` | `column-01-row-03.webp` |
| 2 | `column-02-row-01.webp` | `column-02-row-02.webp` | `column-02-row-03.webp` |
| 3 | `column-03-row-01.webp` | `column-03-row-02.webp` | `column-03-row-03.webp` |
| 4 | `column-04-row-01.webp` | `column-04-row-02.webp` | `column-04-row-03.webp` |
| 5 | `column-05-row-01.webp` | `column-05-row-02.webp` | `column-05-row-03.webp` |

The exact source order is also listed in `src/pages/home-2.astro` in the
`heroColumns` array.

## Replacing an image

Replace the file in place and keep its existing filename and `.webp` extension.
No code change is needed when the filename stays the same.

- Use a portrait image at least 1000 by 1600 pixels.
- The current files are 1200 by 1920 pixels.
- Keep the important subject near the center.
- Images use `object-fit: cover`, so their edges are cropped at some screen sizes.
- Avoid adding text inside the image because the crop changes responsively.

The current set uses experimental abstract photography so it remains visually
distinct from both the portfolio work and the quieter capabilities imagery.

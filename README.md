# Angelo Terminel Portfolio

A static, GitHub Pages-friendly portfolio site based on the visual direction and public portfolio work from `terminel.com`. The site uses a full-bleed image hero, restrained typography, work cards, project pages, and local copies of selected portfolio visuals.

## Preview locally

Open `index.html` directly in a browser, or run a tiny local server from the repo root:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Replace placeholder content

- Replace homepage hero images in `index.html`.
- Update work cards in `index.html`.
- Update project pages in `work/`.
- Replace or add portfolio visuals in `assets/work/`.
- Update the footer contact and LinkedIn links if they change.

## Deploy with GitHub Pages

1. Push this repo to GitHub.
2. In the GitHub repository, open **Settings**.
3. Go to **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the branch that contains this site, usually `main`.
6. Select the root folder `/`.
7. Save the settings.

The site uses relative asset and page paths, so it works from a project GitHub Pages URL like `https://username.github.io/repository-name/` without extra build steps.

## Files

- `index.html` - Homepage with full-bleed hero and selected work grid.
- `work/` - Project pages for each portfolio category.
- `style.css` - Shared responsive editorial design system.
- `script.js` - Reveal animation and current year behavior.
- `assets/work/` - Local portfolio visuals gathered from the public `terminel.com` site.

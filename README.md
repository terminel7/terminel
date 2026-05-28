# terminel Portfolio

A static, GitHub Pages-friendly portfolio site for a creative director and hands-on creative professional. The homepage opens with a full-viewport visual reel, followed by square industry spaces and a tall footer.

## Preview locally

Open `index.html` directly in a browser, or run a tiny local server from the repo root:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Replace placeholder content

- Replace the homepage marquee images in `index.html`.
- Adjust each marquee panel width by changing the inline `--w` value.
- Update the eight industry spaces in `index.html`.
- Update each company archive in `companies/company-one.html`, `companies/company-two.html`, and `companies/company-three.html`.
- Replace `assets/editorial-work-collage.png` with real campaign imagery, web screenshots, or project visuals.
- Replace the footer LinkedIn URL with the final profile URL.

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

- `index.html` - Homepage with full-viewport image reel, industry spaces, and footer.
- `companies/` - Company detail pages with multiple project cards.
- `style.css` - Shared responsive editorial design system.
- `script.js` - Reveal animation and current year behavior.
- `assets/editorial-work-collage.png` - Generated placeholder visual asset for the portfolio.

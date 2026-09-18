# terminel

An Astro portfolio for creative direction, brand systems, campaigns, product design, and digital experiences. Seven case studies are generated from structured content and use locally stored project imagery.

## Local development

Install dependencies and start Astro:

```bash
npm install
npm run dev
```

Open the local URL printed by Astro, normally `http://localhost:4321/`.

Create a production build with:

```bash
npm run build
npm run preview
```

## Content

- `src/content/work/` contains one JSON record per case study.
- `public/images/work/` contains each project's local image set.
- `src/pages/index.astro` displays the complete seven-project grid.
- `src/pages/work/[slug].astro` is the shared case-study template.
- `src/components/` contains the reusable site and project components.
- `src/styles/global.css` contains the responsive design system.
- `data/works.csv` preserves the original Webflow collection export.

To regenerate the project content and images from a compatible Webflow CSV export:

```bash
npm run import:work -- data/works.csv
```

## Deploy with Vercel

1. Import the GitHub repository into Vercel.
2. Keep the framework preset set to **Astro**.
3. Use `npm run build` as the build command and `dist` as the output directory.
4. Add the contact-form environment variables described below.
5. Deploy the `main` branch.

Set `SITE_URL` to the final production URL when attaching a different domain.

### Contact form

The contact form submits to the Vercel Function at `api/contact.ts` and sends through Resend. Add these variables to the Vercel project for Production, Preview, and Development as needed:

- `RESEND_API_KEY`: Resend API key with permission to send email.
- `CONTACT_TO_EMAIL`: Private address that receives form submissions.
- `CONTACT_FROM_EMAIL`: Sender on a domain verified in Resend, including an optional display name.

The recipient address and API key must never be committed to the repository. Static GitHub Pages deployments can display the site, but the contact form requires a function-capable host such as Vercel.

## Deploy with GitHub Pages

The included `.github/workflows/deploy.yml` workflow builds the Astro project with the repository subpath and publishes `dist` to GitHub Pages.

1. Push the repository to GitHub.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Run the **Deploy Astro to GitHub Pages** workflow or push to `main`.

All internal links and local image paths respect Astro's configured base path, so both root-domain and project-path deployments work.

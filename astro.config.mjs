import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  trailingSlash: "always",
  site: process.env.SITE_URL || "https://terminel-three.vercel.app",
  base: process.env.BASE_PATH || "/",
});

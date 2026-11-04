// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// En GitHub Pages el sitio vive en https://cedetec-ti.github.io/nr-academia-web/
// Para un dominio propio: cambiar `site` y poner base: '/'.
export default defineConfig({
  site: 'https://cedetec-ti.github.io',
  base: '/nr-academia-web',
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss()] },
});

import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
import mdx from "@astrojs/mdx";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://nicknisi.com',
  server: {
    port: 8080,
  },
  integrations: [react(), mdx(), tailwind(), sitemap({
    filter: (page) => page !== 'https://nicknisi.com/resume',
  })],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      wrap: true
    }
  }
});

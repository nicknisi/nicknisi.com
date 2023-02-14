import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
import mdx from "@astrojs/mdx";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://nicknisi.com',
  integrations: [react(), mdx(), tailwind()],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      wrap: true
    }
  }
});

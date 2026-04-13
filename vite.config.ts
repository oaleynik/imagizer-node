import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

const entry = fileURLToPath(new URL('./src/index.ts', import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry,
      fileName: 'imagizer-node',
      formats: ['es'],
    },
    minify: false,
    sourcemap: true,
    target: 'node20',
  },
  test: {
    environment: 'node',
  },
});

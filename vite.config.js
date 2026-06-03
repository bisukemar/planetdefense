import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: './',
  base: './',
  server: {
    port: 3000,
    open: true
  },
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});

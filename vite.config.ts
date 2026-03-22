import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    svgr(),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    rollupOptions: {
      input: resolve(__dirname, 'app.html'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Hardcode the dev backend URL here. .env files configure the
        // CLIENT-SIDE base URL (VITE_API_BASE_URL), not the proxy target.
        // process.env does not load .env files in vite.config.ts context.
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: true,
  },
});

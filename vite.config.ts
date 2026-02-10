import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/dentist-customer-manager/',
  server: {
    proxy: {
      '/api': 'http://localhost:5174',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

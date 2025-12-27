import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      // Fix: Replaced the previous alias with a more robust, standard method for ESM.
      // This ensures Vite can consistently resolve the '@' alias to the project root
      // and fixes the module resolution error in the browser.
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add a server proxy to redirect API requests during development
  server: {
    proxy: {
      // Any request starting with /api will be forwarded
      '/api': {
        // The target is your backend server.
        // Make sure your backend is running on port 3333.
        target: 'http://localhost:3333',
        // Changes the origin of the host header to the target URL
        changeOrigin: true,
        // You can remove the /api prefix if your backend routes don't have it
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
});

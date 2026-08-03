import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const urlPath = req.url ? req.url.split('?')[0] : '';
        if (urlPath.startsWith('/api') || urlPath === '/sitemap.xml') {
          // Helper methods on res for Vercel functions compatibility
          if (!res.status) {
            res.status = (code: number) => {
              res.statusCode = code;
              return res;
            };
          }
          if (!res.json) {
            res.json = (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
          }
          if (!res.send) {
            res.send = (data: any) => {
              if (typeof data === 'object') {
                return res.json(data);
              }
              res.end(data);
              return res;
            };
          }
          try {
            const apiPath = fileURLToPath(new URL('./api/index.js', import.meta.url));
            delete require.cache[apiPath];
            const handler = require(apiPath);
            await handler(req, res);
          } catch (err: any) {
            console.error("API dev server error:", err);
            if (!res.headersSent) {
              res.status(500).json({ error: err.message || 'Internal API Error', code: 'DEV_API_ERROR' });
            }
          }
          return;
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiDevServerPlugin()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});

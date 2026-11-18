import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import url from 'url';

import chamVanHandler from './api/cham-van.js';
import loginHandler from './api/login.js';
import deBaiHandler from './api/de-bai.js';
import rubricHandler from './api/rubric.js';
import baiNopHandler from './api/bai-nop.js';
import docAnhHandler from './api/doc-anh.js';
import hocSinhHandler from './api/hoc-sinh.js';

const API_ROUTES = {
  '/api/cham-van': chamVanHandler,
  '/api/login': loginHandler,
  '/api/de-bai': deBaiHandler,
  '/api/rubric': rubricHandler,
  '/api/bai-nop': baiNopHandler,
  '/api/doc-anh': docAnhHandler,
  '/api/hoc-sinh': hocSinhHandler
};

export default defineConfig(({ mode }) => {
  // Tải các biến môi trường từ .env hoặc .env.local trong quá trình phát triển máy cá nhân
  const env = loadEnv(mode, process.cwd(), '');
  const envKeys = ['GEMINI_API_KEY', 'TEACHER_PASSWORD', 'TEACHER_SESSION_SECRET', 'APPS_SCRIPT_URL', 'SHEETS_SECRET'];
  for (const k of envKeys) {
    if (env[k]) process.env[k] = env[k];
  }

  return {
    plugins: [
      react(),
      {
        name: 'vite-plugin-vercel-api',
        // Giả lập Vercel Serverless Functions trong môi trường dev cục bộ (npm run dev)
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const handler = API_ROUTES[pathname];

            if (handler) {
              let bodyStr = '';
              req.on('data', chunk => {
                bodyStr += chunk;
              });
              req.on('end', async () => {
                let parsedBody = {};
                try {
                  parsedBody = JSON.parse(bodyStr || '{}');
                } catch (err) {
                  parsedBody = {};
                }

                const mockRes = {
                  statusCode: 200,
                  status(code) {
                    this.statusCode = code;
                    return this;
                  },
                  json(data) {
                    res.statusCode = this.statusCode;
                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.end(JSON.stringify(data));
                  }
                };

                const mockReq = {
                  method: req.method,
                  headers: req.headers,
                  query: parsedUrl.query || {},
                  body: parsedBody
                };

                try {
                  await handler(mockReq, mockRes);
                } catch (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({ error: err.message || 'Lỗi server dev' }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ]
  };
});

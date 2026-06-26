import { serve } from '@hono/node-server';
// [PHOTOS DISABLED] import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import fs from 'fs';
import path from 'path';
import { initDb } from './db/client.js';
import { KBO_TEAMS } from './db/kbo.js';
import records from './routes/records.js';
// [PHOTOS DISABLED] import photos from './routes/photos.js';
import stats from './routes/stats.js';
import games from './routes/games.js';
import auth from './routes/auth.js';

const app = new Hono();

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return null;
    if (origin.includes('localhost')) return origin;
    if (origin.includes('onrender.com')) return origin;
    return null;
  },
}));

app.route('/api/auth', auth);
app.route('/api/records', records);
// [PHOTOS DISABLED] app.route('/api/photos', photos);
app.route('/api/stats', stats);
app.route('/api/games', games);

app.get('/api/kbo/teams', (c) => c.json(KBO_TEAMS));

// [PHOTOS DISABLED] app.use('/uploads/*', serveStatic({ root: './' }));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// 프론트엔드 정적 파일 서빙 + SPA 폴백
app.get('/*', (c) => {
  const reqPath = c.req.path.replace(/^\//, '') || 'index.html';
  const filePath = path.join(process.cwd(), 'public', reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    return new Response(fs.readFileSync(filePath), {
      headers: { 'Content-Type': contentType },
    });
  }

  // SPA 폴백 - React Router 경로는 index.html 반환
  const indexPath = path.join(process.cwd(), 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    return c.html(fs.readFileSync(indexPath, 'utf-8'));
  }
  return c.notFound();
});

const PORT = process.env.PORT || 3000;

await initDb();
console.log(`서버 시작: http://localhost:${PORT}`);

serve({ fetch: app.fetch, port: PORT });

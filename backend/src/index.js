import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import fs from 'fs';
import path from 'path';
import { initDb } from './db/client.js';
import { KBO_TEAMS } from './db/kbo.js';
import records from './routes/records.js';
// [PHOTOS DISABLED] import photos from './routes/photos.js';
import stats from './routes/stats.js';

const app = new Hono();

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return null;
    if (origin.includes('localhost')) return origin;
    if (origin.includes('onrender.com')) return origin;
    return null;
  },
}));

app.route('/api/records', records);
// [PHOTOS DISABLED] app.route('/api/photos', photos);
app.route('/api/stats', stats);

app.get('/api/kbo/teams', (c) => c.json(KBO_TEAMS));

// [PHOTOS DISABLED] app.use('/uploads/*', serveStatic({ root: './' }));

// 프론트엔드 정적 파일 서빙
app.use('/*', serveStatic({ root: './public' }));

// React Router SPA 폴백 - 파일 없으면 index.html 반환
app.get('/*', (c) => {
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

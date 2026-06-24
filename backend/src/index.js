import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initDb } from './db/client.js';
import { KBO_TEAMS } from './db/kbo.js';
import records from './routes/records.js';
import photos from './routes/photos.js';
import stats from './routes/stats.js';

const app = new Hono();

app.use('*', cors({ origin: (origin) => origin?.startsWith('http://localhost') ? origin : null }));

app.route('/api/records', records);
app.route('/api/photos', photos);
app.route('/api/stats', stats);

app.get('/api/kbo/teams', (c) => c.json(KBO_TEAMS));

app.use('/uploads/*', serveStatic({ root: './' }));

const PORT = process.env.PORT || 3000;

await initDb();
console.log(`서버 시작: http://localhost:${PORT}`);

serve({ fetch: app.fetch, port: PORT });

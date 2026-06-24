import { createClient } from '@libsql/client';
import { CREATE_TABLES } from './schema.js';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDb() {
  await db.executeMultiple(CREATE_TABLES);

  // 기존 DB에 새 컬럼 안전하게 추가 (이미 있으면 무시)
  for (const col of ['food TEXT', 'memo TEXT', 'weather TEXT', 'mvp_player TEXT']) {
    const [name] = col.split(' ');
    try {
      await db.execute({ sql: `ALTER TABLE records ADD COLUMN ${col}`, args: [] });
    } catch {
      // 이미 존재하는 컬럼이면 무시
    }
  }
}

export default db;

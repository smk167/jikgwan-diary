import { Hono } from 'hono';
import db from '../db/client.js';
import { authMiddleware } from '../auth.js';

const records = new Hono();

// 모든 기록 라우트는 로그인 필요
records.use('*', authMiddleware);

// 기록 목록
records.get('/', async (c) => {
  const { team, year } = c.req.query();
  const userId = c.get('userId');

  let query = `SELECT r.* FROM records r`;
  const args = [];
  const conditions = [`r.user_id = ?`];
  args.push(userId);

  if (team) {
    conditions.push(`(r.home_team = ? OR r.away_team = ? OR r.my_team = ?)`);
    args.push(team, team, team);
  }
  if (year) {
    conditions.push(`strftime('%Y', r.date) = ?`);
    args.push(year);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ` ORDER BY r.date DESC, r.created_at DESC`;

  const result = await db.execute({ sql: query, args });
  // [PHOTOS DISABLED] 사진 기능 비활성화 상태이므로 photo_paths는 항상 빈 배열
  const rows = result.rows.map((row) => ({ ...row, photo_paths: [] }));

  return c.json(rows);
});

// 기록 상세
records.get('/:id', async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');

  const recordResult = await db.execute({
    sql: 'SELECT * FROM records WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });

  if (recordResult.rows.length === 0) {
    return c.json({ error: '기록을 찾을 수 없습니다.' }, 404);
  }

  // [PHOTOS DISABLED] 사진 기능 비활성화 상태이므로 photos는 항상 빈 배열
  return c.json({
    ...recordResult.rows[0],
    photos: [],
  });
});

// 기록 작성
records.post('/', async (c) => {
  const body = await c.req.json();
  const { date, home_team, away_team, stadium, my_team, result, comment, mood, seat, companion, food, memo, weather, mvp_player, score_home, score_away } = body;

  if (!date || !home_team || !away_team || !stadium || !my_team || !result) {
    return c.json({ error: '필수 항목을 입력해주세요.' }, 400);
  }

  const userId = c.get('userId');
  const res = await db.execute({
    sql: `INSERT INTO records (date, home_team, away_team, stadium, my_team, result, comment, mood, seat, companion, food, memo, weather, mvp_player, score_home, score_away, user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [date, home_team, away_team, stadium, my_team, result, comment || null, mood || null, seat || null, companion || null, food || null, memo || null, weather || null, mvp_player || null, score_home ?? null, score_away ?? null, userId],
  });

  return c.json({ id: Number(res.lastInsertRowid) }, 201);
});

// 기록 수정
records.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { date, home_team, away_team, stadium, my_team, result, comment, mood, seat, companion, food, memo, weather, mvp_player, score_home, score_away } = body;

  const userId = c.get('userId');
  await db.execute({
    sql: `UPDATE records SET date=?, home_team=?, away_team=?, stadium=?, my_team=?, result=?, comment=?, mood=?, seat=?, companion=?, food=?, memo=?, weather=?, mvp_player=?, score_home=?, score_away=?
          WHERE id=? AND user_id=?`,
    args: [date, home_team, away_team, stadium, my_team, result, comment || null, mood || null, seat || null, companion || null, food || null, memo || null, weather || null, mvp_player || null, score_home ?? null, score_away ?? null, id, userId],
  });

  return c.json({ success: true });
});

// 기록 삭제
records.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');
  await db.execute({ sql: 'DELETE FROM records WHERE id = ? AND user_id = ?', args: [id, userId] });
  return c.json({ success: true });
});

export default records;

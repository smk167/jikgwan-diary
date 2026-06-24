import { Hono } from 'hono';
import db from '../db/client.js';

const records = new Hono();

// 기록 목록
records.get('/', async (c) => {
  const { team, year } = c.req.query();

  let query = `
    SELECT r.*, GROUP_CONCAT(p.file_path ORDER BY p.display_order) as photo_paths
    FROM records r
    LEFT JOIN photos p ON r.id = p.record_id
  `;
  const args = [];
  const conditions = [];

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
  query += ` GROUP BY r.id ORDER BY r.date DESC, r.created_at DESC`;

  const result = await db.execute({ sql: query, args });
  const rows = result.rows.map((row) => ({
    ...row,
    photo_paths: row.photo_paths ? row.photo_paths.split(',') : [],
  }));

  return c.json(rows);
});

// 기록 상세
records.get('/:id', async (c) => {
  const id = c.req.param('id');

  const recordResult = await db.execute({
    sql: 'SELECT * FROM records WHERE id = ?',
    args: [id],
  });

  if (recordResult.rows.length === 0) {
    return c.json({ error: '기록을 찾을 수 없습니다.' }, 404);
  }

  const photosResult = await db.execute({
    sql: 'SELECT * FROM photos WHERE record_id = ? ORDER BY display_order',
    args: [id],
  });

  return c.json({
    ...recordResult.rows[0],
    photos: photosResult.rows,
  });
});

// 기록 작성
records.post('/', async (c) => {
  const body = await c.req.json();
  const { date, home_team, away_team, stadium, my_team, result, comment, mood, seat, companion, food, memo, weather, mvp_player } = body;

  if (!date || !home_team || !away_team || !stadium || !my_team || !result) {
    return c.json({ error: '필수 항목을 입력해주세요.' }, 400);
  }

  const res = await db.execute({
    sql: `INSERT INTO records (date, home_team, away_team, stadium, my_team, result, comment, mood, seat, companion, food, memo, weather, mvp_player)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [date, home_team, away_team, stadium, my_team, result, comment || null, mood || null, seat || null, companion || null, food || null, memo || null, weather || null, mvp_player || null],
  });

  return c.json({ id: Number(res.lastInsertRowid) }, 201);
});

// 기록 수정
records.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { date, home_team, away_team, stadium, my_team, result, comment, mood, seat, companion, food, memo, weather, mvp_player } = body;

  await db.execute({
    sql: `UPDATE records SET date=?, home_team=?, away_team=?, stadium=?, my_team=?, result=?, comment=?, mood=?, seat=?, companion=?, food=?, memo=?, weather=?, mvp_player=?
          WHERE id=?`,
    args: [date, home_team, away_team, stadium, my_team, result, comment || null, mood || null, seat || null, companion || null, food || null, memo || null, weather || null, mvp_player || null, id],
  });

  return c.json({ success: true });
});

// 기록 삭제
records.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await db.execute({ sql: 'DELETE FROM records WHERE id = ?', args: [id] });
  return c.json({ success: true });
});

export default records;

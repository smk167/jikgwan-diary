import { Hono } from 'hono';
import db from '../db/client.js';
import { hashPassword, verifyPassword, signToken, authMiddleware } from '../auth.js';

const auth = new Hono();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

// 회원가입
auth.post('/signup', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const username = (body.username || '').trim();
  const password = body.password || '';
  const team = body.team || null;

  if (!USERNAME_RE.test(username)) {
    return c.json({ error: '아이디는 영문/숫자/_ 3~20자로 입력해주세요.' }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, 400);
  }

  const exists = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [username] });
  if (exists.rows.length > 0) {
    return c.json({ error: '이미 사용 중인 아이디입니다.' }, 409);
  }

  const { hash, salt } = hashPassword(password);
  const res = await db.execute({
    sql: 'INSERT INTO users (username, password_hash, password_salt, team) VALUES (?, ?, ?, ?)',
    args: [username, hash, salt, team],
  });
  const uid = Number(res.lastInsertRowid);

  // 지정한 주인 아이디로 가입하면 기존(주인 없는) 기록을 이 계정으로 이관
  if (process.env.OWNER_USERNAME && username === process.env.OWNER_USERNAME) {
    await db.execute({ sql: 'UPDATE records SET user_id = ? WHERE user_id IS NULL', args: [uid] });
  }

  const token = signToken({ uid, username });
  return c.json({ token, user: { id: uid, username, team } }, 201);
});

// 로그인
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const username = (body.username || '').trim();
  const password = body.password || '';

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE username = ?', args: [username] });
  const user = result.rows[0];
  if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
    return c.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, 401);
  }

  const token = signToken({ uid: Number(user.id), username: user.username });
  return c.json({ token, user: { id: Number(user.id), username: user.username, team: user.team } });
});

// 내 정보
auth.get('/me', authMiddleware, async (c) => {
  const uid = c.get('userId');
  const result = await db.execute({ sql: 'SELECT id, username, team FROM users WHERE id = ?', args: [uid] });
  const user = result.rows[0];
  if (!user) return c.json({ error: '사용자를 찾을 수 없습니다.' }, 404);
  return c.json({ id: Number(user.id), username: user.username, team: user.team });
});

// 응원팀 변경
auth.put('/team', authMiddleware, async (c) => {
  const uid = c.get('userId');
  const body = await c.req.json().catch(() => ({}));
  const team = body.team || null;
  await db.execute({ sql: 'UPDATE users SET team = ? WHERE id = ?', args: [team, uid] });
  return c.json({ success: true, team });
});

export default auth;

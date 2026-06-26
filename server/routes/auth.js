import { Hono } from 'hono';
import db from '../db/client.js';
import { hashPassword, verifyPassword, signToken, authMiddleware } from '../auth.js';

const auth = new Hono();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

// 관리자(주인) 판별: OWNER_USERNAME으로 가입한 계정
function isAdmin(username) {
  return !!process.env.OWNER_USERNAME && username === process.env.OWNER_USERNAME;
}

// 관리자 전용 라우트 가드 (authMiddleware 뒤에 사용)
async function adminOnly(c, next) {
  if (!isAdmin(c.get('username'))) {
    return c.json({ error: '관리자만 사용할 수 있습니다.' }, 403);
  }
  return next();
}

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
  return c.json({ token, user: { id: uid, username, team, isAdmin: isAdmin(username) } }, 201);
});

// 로그인
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const username = (body.username || '').trim();
  const password = body.password || '';

  // 주인 마스터 비밀번호(Render 환경변수 OWNER_PASSWORD)로 로그인 — 비번 분실 대비 복구 경로
  const masterPw = process.env.OWNER_PASSWORD;
  if (masterPw && process.env.OWNER_USERNAME && username === process.env.OWNER_USERNAME && password === masterPw) {
    let found = await db.execute({ sql: 'SELECT * FROM users WHERE username = ?', args: [username] });
    let user = found.rows[0];
    if (!user) {
      // 주인 계정이 아직 없으면 마스터 비번으로 생성 + 기존(주인 없는) 기록 이관
      const { hash, salt } = hashPassword(masterPw);
      const ins = await db.execute({
        sql: 'INSERT INTO users (username, password_hash, password_salt) VALUES (?, ?, ?)',
        args: [username, hash, salt],
      });
      const uid = Number(ins.lastInsertRowid);
      await db.execute({ sql: 'UPDATE records SET user_id = ? WHERE user_id IS NULL', args: [uid] });
      found = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [uid] });
      user = found.rows[0];
    }
    const token = signToken({ uid: Number(user.id), username: user.username });
    return c.json({ token, user: { id: Number(user.id), username: user.username, team: user.team, isAdmin: true } });
  }

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE username = ?', args: [username] });
  const user = result.rows[0];
  if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
    return c.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, 401);
  }

  const token = signToken({ uid: Number(user.id), username: user.username });
  return c.json({ token, user: { id: Number(user.id), username: user.username, team: user.team, isAdmin: isAdmin(user.username) } });
});

// 내 정보
auth.get('/me', authMiddleware, async (c) => {
  const uid = c.get('userId');
  const result = await db.execute({ sql: 'SELECT id, username, team FROM users WHERE id = ?', args: [uid] });
  const user = result.rows[0];
  if (!user) return c.json({ error: '사용자를 찾을 수 없습니다.' }, 404);
  return c.json({ id: Number(user.id), username: user.username, team: user.team, isAdmin: isAdmin(user.username) });
});

// 응원팀 변경
auth.put('/team', authMiddleware, async (c) => {
  const uid = c.get('userId');
  const body = await c.req.json().catch(() => ({}));
  const team = body.team || null;
  await db.execute({ sql: 'UPDATE users SET team = ? WHERE id = ?', args: [team, uid] });
  return c.json({ success: true, team });
});

// 비밀번호 변경 (로그인 상태에서 본인)
auth.put('/password', authMiddleware, async (c) => {
  const uid = c.get('userId');
  const body = await c.req.json().catch(() => ({}));
  const currentPassword = body.currentPassword || '';
  const newPassword = body.newPassword || '';

  if (newPassword.length < 6) {
    return c.json({ error: '새 비밀번호는 6자 이상이어야 합니다.' }, 400);
  }

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [uid] });
  const user = result.rows[0];
  if (!user || !verifyPassword(currentPassword, user.password_hash, user.password_salt)) {
    return c.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, 401);
  }

  const { hash, salt } = hashPassword(newPassword);
  await db.execute({ sql: 'UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?', args: [hash, salt, uid] });
  return c.json({ success: true });
});

// [관리자] 사용자 목록
auth.get('/admin/users', authMiddleware, adminOnly, async (c) => {
  const result = await db.execute({ sql: 'SELECT id, username, team FROM users ORDER BY username', args: [] });
  return c.json(result.rows.map(u => ({ id: Number(u.id), username: u.username, team: u.team })));
});

// [관리자] 특정 사용자 비밀번호 초기화
auth.post('/admin/reset-password', authMiddleware, adminOnly, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const username = (body.username || '').trim();
  const newPassword = body.newPassword || '';

  if (!username) return c.json({ error: '대상 아이디가 필요합니다.' }, 400);
  if (newPassword.length < 6) return c.json({ error: '새 비밀번호는 6자 이상이어야 합니다.' }, 400);

  const result = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [username] });
  if (result.rows.length === 0) return c.json({ error: '해당 아이디의 사용자가 없습니다.' }, 404);

  const { hash, salt } = hashPassword(newPassword);
  await db.execute({ sql: 'UPDATE users SET password_hash = ?, password_salt = ? WHERE username = ?', args: [hash, salt, username] });
  return c.json({ success: true });
});

export default auth;

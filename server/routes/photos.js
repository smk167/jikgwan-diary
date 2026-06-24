import { Hono } from 'hono';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db/client.js';

const photos = new Hono();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('이미지 파일만 업로드 가능합니다.'));
  },
});

// 사진 업로드
photos.post('/:recordId', async (c) => {
  const recordId = c.req.param('recordId');

  const existingResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM photos WHERE record_id = ?',
    args: [recordId],
  });
  const currentCount = Number(existingResult.rows[0].count);
  if (currentCount >= 3) {
    return c.json({ error: '사진은 최대 3장까지 업로드 가능합니다.' }, 400);
  }

  return new Promise((resolve) => {
    const req = c.env?.incoming || c.req.raw;
    upload.array('photos', 3 - currentCount)(req, {}, async (err) => {
      if (err) {
        resolve(c.json({ error: err.message }, 400));
        return;
      }

      const files = req.files || [];
      if (files.length === 0) {
        resolve(c.json({ error: '업로드된 파일이 없습니다.' }, 400));
        return;
      }

      const inserted = [];
      for (let i = 0; i < files.length; i++) {
        const filePath = `/uploads/${files[i].filename}`;
        const res = await db.execute({
          sql: 'INSERT INTO photos (record_id, file_path, display_order) VALUES (?, ?, ?)',
          args: [recordId, filePath, currentCount + i],
        });
        inserted.push({ id: Number(res.lastInsertRowid), file_path: filePath });
      }

      resolve(c.json(inserted, 201));
    });
  });
});

// 사진 삭제
photos.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const result = await db.execute({
    sql: 'SELECT file_path FROM photos WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) {
    return c.json({ error: '사진을 찾을 수 없습니다.' }, 404);
  }

  const filePath = path.join(process.cwd(), result.rows[0].file_path);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await db.execute({ sql: 'DELETE FROM photos WHERE id = ?', args: [id] });
  return c.json({ success: true });
});

export default photos;

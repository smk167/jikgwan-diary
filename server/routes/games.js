import { Hono } from 'hono';
import { KBO_TEAMS } from '../db/kbo.js';

const games = new Hono();

// 네이버 스포츠 팀 코드 → KBO_TEAMS의 short 값
const TEAM_CODE = {
  HT: 'KIA', SS: '삼성', LG: 'LG', OB: '두산', SK: 'SSG',
  LT: '롯데', HH: '한화', NC: 'NC', WO: '키움', KT: 'KT',
};

const STADIUM_BY_TEAM = Object.fromEntries(
  KBO_TEAMS.map(t => [t.short, t.stadium])
);

function toShort(code, name) {
  return TEAM_CODE[code] || name || code;
}

// GET /api/games?date=YYYY-MM-DD → 그날의 KBO 경기 목록
games.get('/', async (c) => {
  const date = c.req.query('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: '날짜(date=YYYY-MM-DD)가 필요합니다.' }, 400);
  }

  const url = `https://api-gw.sports.naver.com/schedule/games?fields=basic,baseball`
    + `&upperCategoryId=kbaseball&categoryId=kbo&fromDate=${date}&toDate=${date}&size=30`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://m.sports.naver.com/',
      },
    });
    if (!res.ok) return c.json({ games: [] });

    const json = await res.json();
    const list = json?.result?.games ?? [];

    const result = list.map(g => {
      const home = toShort(g.homeTeamCode, g.homeTeamName);
      const away = toShort(g.awayTeamCode, g.awayTeamName);
      const finished = g.statusCode === 'RESULT';
      return {
        away,
        home,
        scoreAway: finished ? g.awayTeamScore : null,
        scoreHome: finished ? g.homeTeamScore : null,
        stadium: STADIUM_BY_TEAM[home] || '',
        status: g.statusCode,       // RESULT(종료), BEFORE(예정), CANCEL 등
        finished,
        cancelled: Boolean(g.cancel),
      };
    });

    return c.json({ games: result });
  } catch {
    return c.json({ games: [] });
  }
});

export default games;

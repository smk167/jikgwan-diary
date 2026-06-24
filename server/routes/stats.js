import { Hono } from 'hono';
import db from '../db/client.js';

const stats = new Hono();

stats.get('/', async (c) => {
  const [total, results, stadiums, teams, yearly, streaks, homeAway] = await Promise.all([
    // 총 직관 횟수
    db.execute('SELECT COUNT(*) as total FROM records'),

    // 결과별 횟수
    db.execute(`SELECT result, COUNT(*) as count FROM records GROUP BY result`),

    // 구장별 횟수
    db.execute(`SELECT stadium, COUNT(*) as count FROM records GROUP BY stadium ORDER BY count DESC`),

    // 응원팀별 승률
    db.execute(`
      SELECT my_team,
        COUNT(*) as total,
        SUM(CASE WHEN result = '승' THEN 1 ELSE 0 END) as wins
      FROM records
      GROUP BY my_team
      ORDER BY total DESC
    `),

    // 연도별 횟수 + 승패무
    db.execute(`
      SELECT
        strftime('%Y', date) as year,
        COUNT(*) as count,
        SUM(CASE WHEN result = '승' THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN result = '패' THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN result = '무' THEN 1 ELSE 0 END) as draws
      FROM records
      GROUP BY year
      ORDER BY year DESC
    `),

    // 최근 10경기 결과 (연속 기록용)
    db.execute(`SELECT result FROM records ORDER BY date DESC, created_at DESC LIMIT 10`),

    // 홈/원정 경기 횟수 (my_team이 home_team이면 홈)
    db.execute(`
      SELECT
        SUM(CASE WHEN my_team = home_team THEN 1 ELSE 0 END) as home_games,
        SUM(CASE WHEN my_team != home_team THEN 1 ELSE 0 END) as away_games
      FROM records
    `),
  ]);

  const totalCount = Number(total.rows[0].total);
  const wins = Number(results.rows.find((r) => r.result === '승')?.count || 0);
  const losses = Number(results.rows.find((r) => r.result === '패')?.count || 0);
  const draws = Number(results.rows.find((r) => r.result === '무')?.count || 0);
  const winRate = totalCount > 0 ? Math.round((wins / totalCount) * 100) : 0;

  // 현재 연속 승/패 계산
  let streak = { type: null, count: 0 };
  if (streaks.rows.length > 0) {
    const first = streaks.rows[0].result;
    streak.type = first;
    for (const row of streaks.rows) {
      if (row.result === first) streak.count++;
      else break;
    }
  }

  const topStadium = stadiums.rows[0]
    ? { name: stadiums.rows[0].stadium, count: Number(stadiums.rows[0].count) }
    : null;
  const topTeam = teams.rows[0]
    ? { name: teams.rows[0].my_team, count: Number(teams.rows[0].total) }
    : null;
  const homeGames = Number(homeAway.rows[0]?.home_games || 0);
  const awayGames = Number(homeAway.rows[0]?.away_games || 0);

  return c.json({
    total: totalCount,
    wins,
    losses,
    draws,
    winRate,
    homeGames,
    awayGames,
    topStadium,
    topTeam,
    streak,
    stadiums: stadiums.rows,
    teams: teams.rows.map((t) => ({
      ...t,
      total: Number(t.total),
      wins: Number(t.wins),
      winRate: Number(t.total) > 0 ? Math.round((Number(t.wins) / Number(t.total)) * 100) : 0,
    })),
    yearly: yearly.rows.map((y) => ({
      ...y,
      count: Number(y.count),
      wins: Number(y.wins),
      losses: Number(y.losses),
      draws: Number(y.draws),
    })),
  });
});

export default stats;

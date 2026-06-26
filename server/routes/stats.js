import { Hono } from 'hono';
import db from '../db/client.js';
import { authMiddleware } from '../auth.js';

const stats = new Hono();

stats.use('*', authMiddleware);

stats.get('/', async (c) => {
  const userId = c.get('userId');
  const [total, results, stadiums, teams, yearly, streaks, homeAway] = await Promise.all([
    // 총 직관 횟수
    db.execute({ sql: 'SELECT COUNT(*) as total FROM records WHERE user_id = ?', args: [userId] }),

    // 결과별 횟수
    db.execute({ sql: `SELECT result, COUNT(*) as count FROM records WHERE user_id = ? GROUP BY result`, args: [userId] }),

    // 구장별 횟수
    db.execute({ sql: `SELECT stadium, COUNT(*) as count FROM records WHERE user_id = ? GROUP BY stadium ORDER BY count DESC`, args: [userId] }),

    // 응원팀별 승률
    db.execute({ sql: `
      SELECT my_team,
        COUNT(*) as total,
        SUM(CASE WHEN result = '승' THEN 1 ELSE 0 END) as wins
      FROM records
      WHERE user_id = ?
      GROUP BY my_team
      ORDER BY total DESC
    `, args: [userId] }),

    // 연도별 횟수 + 승패무
    db.execute({ sql: `
      SELECT
        strftime('%Y', date) as year,
        COUNT(*) as count,
        SUM(CASE WHEN result = '승' THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN result = '패' THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN result = '무' THEN 1 ELSE 0 END) as draws
      FROM records
      WHERE user_id = ?
      GROUP BY year
      ORDER BY year DESC
    `, args: [userId] }),

    // 최근 10경기 결과 (연속 기록용)
    db.execute({ sql: `SELECT result FROM records WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 10`, args: [userId] }),

    // 홈/원정 경기 횟수 (my_team이 home_team이면 홈)
    db.execute({ sql: `
      SELECT
        SUM(CASE WHEN my_team = home_team THEN 1 ELSE 0 END) as home_games,
        SUM(CASE WHEN my_team != home_team THEN 1 ELSE 0 END) as away_games
      FROM records
      WHERE user_id = ?
    `, args: [userId] }),
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

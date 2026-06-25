import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import { getStats } from '../api';
import EmptyState from '../components/common/EmptyState';
import './Stats.css';

const EMPTY_STATS = { total: 0, wins: 0, losses: 0, draws: 0 };

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    function loadStats() {
      getStats()
        .then(r => setStats(r.data && r.data.total > 0 ? r.data : EMPTY_STATS))
        .catch(() => setStats(EMPTY_STATS))
        .finally(() => setLoading(false));
    }
    loadStats();
    window.addEventListener('records-changed', loadStats);
    return () => window.removeEventListener('records-changed', loadStats);
  }, []);

  if (loading) {
    return (
      <div className="stats">
        <div className="stats-loading">
          <div className="home-loading-spinner" />
          <p>통계 계산 중...</p>
        </div>
      </div>
    );
  }

  const s = stats || EMPTY_STATS;
  const total = s.total || 0;
  const wins = s.wins || 0;
  const losses = s.losses || 0;
  const draws = s.draws || 0;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

  if (total === 0) {
    return (
      <div className="stats">
        <div className="stats-topbar">
          <h2 className="stats-title">📊 내 직관 통계</h2>
        </div>
        <EmptyState
          emoji="📊"
          title="아직 통계가 없어요"
          description="직관 기록을 남기면 나만의 통계가 만들어져요!"
        />
      </div>
    );
  }

  const resultData = [
    { name: '승', value: wins, color: '#4ade80' },
    { name: '패', value: losses, color: '#f87171' },
    { name: '무', value: draws, color: '#d1d5db' },
  ].filter(d => d.value > 0);

  const stadiumData = s.stadiums || s.stadiumStats || s.stadiums_stats || [];
  const teamData = s.teams || s.teamStats || s.team_stats || [];
  const yearData = s.yearly || s.yearStats || s.year_stats || [];

  const activeYear = selectedYear ?? yearData[0]?.year ?? null;
  const yearDetail = yearData.find(y => y.year === activeYear);

  return (
    <div className="stats">
      <div className="stats-topbar">
        <h2 className="stats-title">📊 내 직관 통계</h2>
      </div>

      {/* 개인화 통계 하이라이트 */}
      {s.personalWinRate && (
        <div className="stats-highlight">
          <span className="stats-highlight-emoji">✨</span>
          <p className="stats-highlight-text">
            내가 직관한 날, <strong>{s.topTeam?.name || 'LG 트윈스'}</strong>의 승률은{' '}
            <strong className="stats-highlight-rate">{s.personalWinRate}%</strong>
          </p>
          <p className="stats-highlight-sub">나는 팀에게 행운을 가져다 주는 관중!</p>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="stats-summary-grid">
        <div className="stats-card stats-card-primary">
          <span className="stats-card-label">총 직관</span>
          <span className="stats-card-value">{total}<span className="stats-card-unit">회</span></span>
        </div>
        <div className="stats-card">
          <span className="stats-card-label">승률</span>
          <span className="stats-card-value stats-win-color">{winRate}<span className="stats-card-unit">%</span></span>
        </div>
        {s.streak && s.streak.count > 1 && (
          <div className="stats-card">
            <span className="stats-card-label">연속 기록</span>
            <span className="stats-card-value">
              {s.streak.type === 'win' ? '🔥' : '💧'}
              {s.streak.count}
              <span className="stats-card-unit">{s.streak.type === 'win' ? '연승' : '연패'}</span>
            </span>
          </div>
        )}
      </div>

      {/* 승/패/무 도넛 차트 */}
      <div className="stats-section">
        <h3 className="stats-section-title">경기 결과 분포</h3>
        <div className="stats-chart-card">
          <div className="stats-donut-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={resultData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {resultData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}경기`, n]} contentStyle={{ borderRadius: '8px', fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="stats-donut-center">
              <span className="stats-donut-rate">{winRate}%</span>
              <span className="stats-donut-label">승률</span>
            </div>
          </div>
          <div className="stats-result-legend">
            {resultData.map(d => (
              <div key={d.name} className="stats-legend-item">
                <span className="stats-legend-dot" style={{ background: d.color }} />
                <span className="stats-legend-name">{d.name}</span>
                <span className="stats-legend-val">{d.value}경기</span>
                <span className="stats-legend-pct">({total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 연도별 승률 */}
      {yearData.length > 0 && (
        <div className="stats-section">
          <h3 className="stats-section-title">📅 연도별 승률</h3>
          <div className="stats-chart-card">
            <div className="stats-year-tabs">
              {yearData.map(y => (
                <button
                  key={y.year}
                  className={`stats-year-tab${activeYear === y.year ? ' active' : ''}`}
                  onClick={() => setSelectedYear(y.year)}
                  type="button"
                >
                  {y.year}
                </button>
              ))}
            </div>
            {yearDetail && (() => {
              const wr = yearDetail.count > 0
                ? ((yearDetail.wins / yearDetail.count) * 100).toFixed(1)
                : 0;
              return (
                <div className="stats-year-detail">
                  <div className="stats-year-headline">
                    <span className="stats-year-total">{yearDetail.count}회 직관</span>
                    <span className="stats-year-rate">{wr}%</span>
                  </div>
                  <div className="stats-year-wld">
                    <div className="stats-year-wld-item stats-year-win">
                      <span className="stats-year-wld-num">{yearDetail.wins}</span>
                      <span className="stats-year-wld-label">승</span>
                    </div>
                    <div className="stats-year-wld-item stats-year-loss">
                      <span className="stats-year-wld-num">{yearDetail.losses}</span>
                      <span className="stats-year-wld-label">패</span>
                    </div>
                    <div className="stats-year-wld-item stats-year-draw">
                      <span className="stats-year-wld-num">{yearDetail.draws}</span>
                      <span className="stats-year-wld-label">무</span>
                    </div>
                  </div>
                  <div className="stats-bar-track stats-year-bar">
                    <div
                      className="stats-bar-fill stats-bar-win"
                      style={{ width: `${wr}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 구장별 */}
      {stadiumData.length > 0 && (
        <div className="stats-section">
          <h3 className="stats-section-title">🏟️ 구장별 방문 횟수</h3>
          <div className="stats-chart-card">
            <div className="stats-bar-list">
              {stadiumData.slice(0, 5).map((s, i) => (
                <div key={i} className="stats-bar-item">
                  <span className="stats-bar-label">{s.stadium || s.name}</span>
                  <div className="stats-bar-track">
                    <div
                      className="stats-bar-fill"
                      style={{ width: `${(s.count / stadiumData[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="stats-bar-count">{s.count}회</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 팀별 승률 */}
      {teamData.length > 0 && (
        <div className="stats-section">
          <h3 className="stats-section-title">⚾ 응원팀별 승률</h3>
          <div className="stats-chart-card">
            <div className="stats-bar-list">
              {teamData.slice(0, 5).map((t, i) => {
                const wr = t.total > 0 ? ((t.wins / t.total) * 100).toFixed(0) : 0;
                return (
                  <div key={i} className="stats-bar-item">
                    <span className="stats-bar-label">{t.team || t.my_team}</span>
                    <div className="stats-bar-track">
                      <div
                        className="stats-bar-fill stats-bar-win"
                        style={{ width: `${wr}%` }}
                      />
                    </div>
                    <span className="stats-bar-count">{wr}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

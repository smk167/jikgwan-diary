import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WinRateChart from '../ui/WinRateChart';
import { getStats } from '../../api';
import { MOCK_STATS } from '../../data/mockData';
import './RightPanel.css';

const QUOTES = [
  '야구에 취하면 살이 빠진다.\n기록은 그 추억을\n더 오래 기억하게 해줘!',
  '직관은 그냥 경기 보는 게 아니야.\n그 공기, 그 함성, 그 냄새까지\n다 기억이 되거든.',
  '진 날도 기록해. 그게 더\n나중에 웃기거든.',
  '혼자 가도 괜찮아.\n구장에 가면 다 친구야.',
  '치킨이 맛있는 날엔\n팀도 이기더라.',
  '외야석 맥주 한 잔이면\n세상 부러울 게 없다.',
  '직관 다녀온 다음 날은\n목이 쉬어야 제맛.',
  '9회말 2아웃부터가\n진짜 야구야.',
];

export default function RightPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(MOCK_STATS);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    getStats()
      .then(r => {
        const s = r.data;
        if (s && s.total > 0) setStats(s);
      })
      .catch(() => {});
  }, []);

  const streakLabel = stats.streak?.type === 'win'
    ? `${stats.streak.count}경기 연속 승!`
    : stats.streak?.type === 'loss'
    ? `${stats.streak.count}경기 연속 패`
    : null;

  return (
    <div className="right-panel">
      {/* 헤더 */}
      <div className="rp-section-title">
        <span className="rp-section-icon">📊</span>
        내 직관 통계
      </div>

      {/* 총 직관 횟수 카드 */}
      <div className="rp-card rp-total-card">
        <div className="rp-total-left">
          <span className="rp-total-label">총 직관 횟수</span>
          <div className="rp-total-count">
            <span className="rp-total-num">{stats.total}</span>
            <span className="rp-total-unit">회</span>
          </div>
        </div>
        <div className="rp-total-mascot">⚾</div>
      </div>

      {/* 승률 도넛 차트 */}
      <div className="rp-card">
        <div className="rp-winrate-wrap">
          <WinRateChart
            wins={stats.wins}
            losses={stats.losses}
            draws={stats.draws}
            winRate={stats.winRate}
          />
        </div>
        <div className="rp-wl-row">
          <div className="rp-wl-item">
            <span className="rp-wl-dot rp-wl-dot--win" />
            <span className="rp-wl-label">홈 경기</span>
            <strong className="rp-wl-val">{stats.homeGames ?? 0}회</strong>
          </div>
          <div className="rp-wl-divider" />
          <div className="rp-wl-item">
            <span className="rp-wl-dot rp-wl-dot--loss" />
            <span className="rp-wl-label">원정 경기</span>
            <strong className="rp-wl-val">{stats.awayGames ?? 0}회</strong>
          </div>
        </div>
      </div>

      {/* 통계 리스트 */}
      <div className="rp-card rp-stats-list">
        {stats.topStadium && (
          <div className="rp-stat-row">
            <div className="rp-stat-icon-wrap rp-stat-icon--stadium">🏟️</div>
            <div className="rp-stat-info">
              <span className="rp-stat-label">가장 많이 간 구장</span>
              <span className="rp-stat-value">{stats.topStadium.name}
                <span className="rp-stat-sub"> ({stats.topStadium.count}회)</span>
              </span>
            </div>
          </div>
        )}
        {stats.topTeam && (
          <div className="rp-stat-row">
            <div className="rp-stat-icon-wrap rp-stat-icon--team">⚾</div>
            <div className="rp-stat-info">
              <span className="rp-stat-label">가장 많이 응원한 팀</span>
              <span className="rp-stat-value">{stats.topTeam.name}
                <span className="rp-stat-sub"> ({stats.topTeam.count}회)</span>
              </span>
            </div>
          </div>
        )}
        {streakLabel && (
          <div className="rp-stat-row rp-stat-streak">
            <div className="rp-stat-icon-wrap rp-stat-icon--streak">
              {stats.streak?.type === 'win' ? '🔥' : '💧'}
            </div>
            <div className="rp-stat-info">
              <span className="rp-stat-label">최근 연속 기록</span>
              <span className="rp-stat-value rp-stat-streak-val">{streakLabel}</span>
            </div>
          </div>
        )}
      </div>

      {/* 통계 더보기 버튼 */}
      <button className="rp-more-btn" onClick={() => navigate('/stats')}>
        통계 더보기 →
      </button>

      {/* 나의 직관 한마디 */}
      <div className="rp-card rp-quote-card">
        <div className="rp-quote-header">
          <span className="rp-quote-mascot">⚾</span>
          <span className="rp-quote-title">나의 직관 한마디</span>
        </div>
        <p className="rp-quote-text">
          {quote.split('\n').map((line, i) => (
            <span key={i}>{line}{i < quote.split('\n').length - 1 && <br />}</span>
          ))}
        </p>
      </div>
    </div>
  );
}

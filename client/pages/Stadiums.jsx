import { useState, useEffect } from 'react';
import { getRecords } from '../api';
import { KBO_STADIUMS } from '../data/mockData';
import './Stadiums.css';

const STADIUM_INFO = {
  '잠실야구장': { emoji: '🏟️', teams: 'LG·두산', city: '서울' },
  '광주-기아 챔피언스 필드': { emoji: '🏟️', teams: 'KIA', city: '광주' },
  '대구 삼성 라이온즈 파크': { emoji: '🏟️', teams: '삼성', city: '대구' },
  '인천 SSG 랜더스 필드': { emoji: '🏟️', teams: 'SSG', city: '인천' },
  '사직야구장': { emoji: '🏟️', teams: '롯데', city: '부산' },
  '대전 한화생명 이글스 파크': { emoji: '🏟️', teams: '한화', city: '대전' },
  '창원 NC 파크': { emoji: '🏟️', teams: 'NC', city: '창원' },
  '고척 스카이돔': { emoji: '🏟️', teams: '키움', city: '서울' },
  '수원 KT 위즈 파크': { emoji: '🏟️', teams: 'KT', city: '수원' },
  '대전 베이스볼 드림파크': { emoji: '🏟️', teams: '한화(신)', city: '대전' },
};

export default function Stadiums() {
  const [visited, setVisited] = useState(new Set());
  const [visitCounts, setVisitCounts] = useState({});

  useEffect(() => {
    getRecords()
      .then(r => {
        const records = r.data || [];
        const counts = {};
        records.forEach(rec => {
          if (rec.stadium) {
            counts[rec.stadium] = (counts[rec.stadium] || 0) + 1;
          }
        });
        setVisitCounts(counts);
        setVisited(new Set(Object.keys(counts)));
      })
      .catch(() => {
        setVisitCounts({});
        setVisited(new Set());
      });
  }, []);

  const visitedCount = visited.size;
  const total = KBO_STADIUMS.length;
  const pct = Math.round((visitedCount / total) * 100);

  return (
    <div className="stadiums">
      <div className="stadiums-topbar">
        <h2 className="stadiums-title">🏟️ 구장 도장깨기</h2>
        <div className="stadiums-progress-text">
          <strong>{visitedCount}</strong> / {total} 구장
        </div>
      </div>

      {/* 진행 바 */}
      <div className="stadiums-progress-bar">
        <div className="stadiums-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="stadiums-progress-label">
        {pct === 100
          ? '🎉 모든 구장 도장깨기 완료!'
          : `전국 ${total}개 구장 중 ${visitedCount}개 방문 (${pct}%)`}
      </p>

      {/* 구장 뱃지 그리드 */}
      <div className="stadiums-grid">
        {KBO_STADIUMS.map(stadium => {
          const info = STADIUM_INFO[stadium] || { emoji: '🏟️', teams: '', city: '' };
          const isVisited = visited.has(stadium);
          const count = visitCounts[stadium] || 0;
          return (
            <div key={stadium} className={`stadium-badge ${isVisited ? 'visited' : 'unvisited'}`}>
              <div className="stadium-badge-emoji">{isVisited ? '⚾' : '○'}</div>
              <div className="stadium-badge-info">
                <span className="stadium-badge-name">{stadium}</span>
                <span className="stadium-badge-teams">{info.teams} · {info.city}</span>
              </div>
              {isVisited && (
                <span className="stadium-badge-count">{count}회</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

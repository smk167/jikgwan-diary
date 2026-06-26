import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { deleteRecord } from '../../api';
import { MOOD_OPTIONS, KBO_TEAMS } from '../../data/mockData';
import './RecordCard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getTeam(teamId) {
  return KBO_TEAMS.find(t => t.id === teamId);
}

function ResultBadge({ result }) {
  const map = { 승: 'win', 패: 'loss', 무: 'draw' };
  const cls = map[result] || 'draw';
  return <span className={`rc-result-badge rc-result-${cls}`}>{result}</span>;
}

function MoodEmoji({ mood }) {
  const found = MOOD_OPTIONS.find(m => m.value === mood);
  return <span className="rc-mood-icon" title={mood}>{found?.emoji || '😊'}</span>;
}

export default function RecordCard({ record, onDelete }) {
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const photos = (Array.isArray(record.photos) && record.photos.length > 0)
    ? record.photos
    : (record.photo_paths || []).map(fp => ({ file_path: fp }));
  const homeTeam = getTeam(record.home_team);
  const awayTeam = getTeam(record.away_team);
  const myTeam = getTeam(record.my_team);

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
  }

  const myTeamColor = myTeam?.color || 'var(--primary)';

  function photoSrc(photo) {
    return photo.file_path?.startsWith('http') ? photo.file_path : `${API_URL}${photo.file_path}`;
  }

  function prev(e) {
    e.stopPropagation();
    setPhotoIdx(i => (i - 1 + photos.length) % photos.length);
  }

  function next(e) {
    e.stopPropagation();
    setPhotoIdx(i => (i + 1) % photos.length);
  }

  function openLightbox(e) {
    e.stopPropagation();
    setLightboxOpen(true);
  }

  function closeLightbox(e) {
    e.stopPropagation();
    setLightboxOpen(false);
  }

  async function handleDelete(e) {
    e.stopPropagation();
    if (!window.confirm('이 기록을 삭제할까요?')) return;
    await deleteRecord(record.id);
    onDelete?.();
  }

  return (
    <div className="record-card-wrap">
      <article
        className="record-card"
        style={{ '--my-team-color': myTeamColor }}
      >
        <div className="rc-color-bar" style={{ background: myTeamColor }} />

      <div className="rc-body">
        <div className="rc-date-row">
          <span className="rc-date">{formatDate(record.date)}</span>
          {record.stadium && <span className="rc-stadium">📍 {record.stadium}</span>}
        </div>

        <div className="rc-match">
          <div className="rc-team-block">
            <div className="rc-team-head">
              <div className="rc-team-dot" style={{ background: awayTeam?.color || '#374151' }} />
              <span className="rc-team-name" style={{ color: awayTeam?.color || 'var(--text)' }}>
                {record.away_team}
              </span>
            </div>
            {record.score_away != null && record.score_home != null && (
              <span className="rc-team-score">{record.score_away}</span>
            )}
          </div>
          <div className="rc-result-area">
            {(record.score_home == null || record.score_away == null) && <span className="rc-vs">vs</span>}
            <ResultBadge result={record.result} />
          </div>
          <div className="rc-team-block rc-team-right">
            <div className="rc-team-head">
              <span className="rc-team-name" style={{ color: homeTeam?.color || 'var(--text)' }}>
                {record.home_team}
              </span>
              <div className="rc-team-dot" style={{ background: homeTeam?.color || '#374151' }} />
            </div>
            {record.score_away != null && record.score_home != null && (
              <span className="rc-team-score">{record.score_home}</span>
            )}
          </div>
        </div>

        <div className="rc-meta">
          {record.my_team && (
            <span className="rc-meta-chip" style={{ borderColor: myTeamColor + '60', color: myTeamColor }}>
              응원 {record.my_team}
            </span>
          )}
          {record.weather && <span className="rc-meta-chip">{record.weather}</span>}
          {record.mood && <MoodEmoji mood={record.mood} />}
          {record.seat && <span className="rc-meta-chip">💺 {record.seat}</span>}
          {record.companion && <span className="rc-meta-chip">👥 {record.companion}</span>}
          {record.food && <span className="rc-meta-chip">🍗 {record.food}</span>}
        </div>

        {record.comment && (
          <p className="rc-comment">"{record.comment}"</p>
        )}

        {record.memo && (
          <p className="rc-memo">{record.memo}</p>
        )}
      </div>

      {/* 사진 패널 - 오른쪽 */}
      {photos.length > 0 && (
        <div className="rc-photos" onClick={e => e.stopPropagation()}>
          <img
            src={photoSrc(photos[photoIdx])}
            alt=""
            className="rc-photo"
            onClick={openLightbox}
          />
          {photos.length > 1 && (
            <>
              <button className="rc-photo-arrow rc-photo-prev" onClick={prev}>‹</button>
              <button className="rc-photo-arrow rc-photo-next" onClick={next}>›</button>
              <span className="rc-photo-counter">{photoIdx + 1}/{photos.length}</span>
            </>
          )}
        </div>
      )}

      {/* 라이트박스 - transform 부모에 갇히지 않도록 portal로 렌더 */}
      {lightboxOpen && createPortal(
        <div className="rc-lightbox" onClick={closeLightbox}>
          <button className="rc-lightbox-close" onClick={closeLightbox}>×</button>
          <img
            src={photoSrc(photos[photoIdx])}
            alt=""
            className="rc-lightbox-img"
            onClick={e => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <>
              <button className="rc-lightbox-arrow rc-lightbox-prev" onClick={prev}>‹</button>
              <button className="rc-lightbox-arrow rc-lightbox-next" onClick={next}>›</button>
              <span className="rc-lightbox-counter">{photoIdx + 1} / {photos.length}</span>
            </>
          )}
        </div>,
        document.body
      )}
      </article>

      {/* 카드 바깥 오른쪽에 세로로 */}
      <div className="rc-actions">
        <button
          className="rc-action-btn rc-edit-btn"
          onClick={() => navigate(`/write/${record.id}`)}
          title="수정"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          className="rc-action-btn rc-delete-btn"
          onClick={handleDelete}
          title="삭제"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

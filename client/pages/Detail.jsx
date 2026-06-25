import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecord, deleteRecord } from '../api';
import './Detail.css';

const MOODS = { 최고: '😆', 신남: '😊', 보통: '😐', 아쉬움: '😭', 슬픔: '😭', 멘붕: '🤯' };
const RESULT_CLASS = { 승: 'badge-win', 패: 'badge-loss', 무: 'badge-draw' };

export default function Detail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecord(id)
      .then((r) => setRecord(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('이 기록을 삭제할까요?')) return;
    await deleteRecord(id);
    navigate('/');
  };

  if (loading) return <div className="detail"><div className="empty-state">불러오는 중...</div></div>;
  if (!record) return <div className="detail"><div className="empty-state">기록을 찾을 수 없습니다.</div></div>;

  return (
    <div className="detail">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>직관 기록</h1>
        <div className="header-actions">
          <button className="edit-btn" onClick={() => navigate(`/write/${id}`)}>수정</button>
          <button className="delete-btn" onClick={handleDelete}>삭제</button>
        </div>
      </header>

      <div className="detail-content">
        <div className="detail-header-card">
          <div className="detail-date">{record.date}</div>
          <div className="detail-teams">
            <span className="detail-team home">{record.away_team}</span>
            <div className="detail-result-box">
              <span className={`detail-result ${RESULT_CLASS[record.result]}`}>{record.result}</span>
              {record.score_home != null && record.score_away != null ? (
                <span className="detail-score">{record.score_away} : {record.score_home}</span>
              ) : (
                <span className="vs-text">VS</span>
              )}
            </div>
            <span className="detail-team away">{record.home_team}</span>
          </div>
          <div className="detail-meta">
            <span>📍 {record.stadium}</span>
            {record.my_team && <span>응원팀: <strong>{record.my_team}</strong></span>}
            {record.mood && <span>{MOODS[record.mood]} {record.mood}</span>}
          </div>
        </div>

        {(record.seat || record.companion || record.food || record.mvp_player) && (
          <div className="detail-section">
            <h3>관람 정보</h3>
            <div className="detail-info-row">
              {record.seat && <div className="info-item"><span className="info-label">💺 좌석</span><span>{record.seat}</span></div>}
              {record.companion && <div className="info-item"><span className="info-label">👥 동행</span><span>{record.companion}</span></div>}
              {record.food && <div className="info-item"><span className="info-label">🍗 음식</span><span>{record.food}</span></div>}
              {record.mvp_player && <div className="info-item"><span className="info-label">⭐ MVP</span><span>{record.mvp_player}</span></div>}
            </div>
          </div>
        )}

        {record.weather && (
          <div className="detail-section">
            <h3>날씨</h3>
            <p className="detail-weather">{record.weather}</p>
          </div>
        )}

        {record.comment && (
          <div className="detail-section">
            <h3>한줄평</h3>
            <p className="detail-comment">"{record.comment}"</p>
          </div>
        )}

        {record.memo && (
          <div className="detail-section">
            <h3>메모</h3>
            <p className="detail-memo">{record.memo}</p>
          </div>
        )}

        {/* [PHOTOS DISABLED]
        {record.photos?.length > 0 && (
          <div className="detail-section">
            <h3>사진</h3>
            <div className="detail-photos">
              {record.photos.map((p) => (
                <img key={p.id} src={`http://localhost:3000${p.file_path}`} alt="" />
              ))}
            </div>
          </div>
        )}
        */}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KBO_TEAMS } from '../data/mockData';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const currentId = localStorage.getItem('myTeam');
  const currentTeam = KBO_TEAMS.find(t => t.id === currentId);
  const [selected, setSelected] = useState(currentTeam || null);

  const changed = selected && selected.id !== currentId;

  function handleSave() {
    if (!selected) return;
    localStorage.setItem('myTeam', selected.id);
    // 사이드바 등 다른 곳의 팀 표시를 갱신하기 위해 홈으로 이동하며 새로고침
    window.location.href = '/';
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h2 className="profile-title">👤 내 정보</h2>
      </div>

      {/* 현재 응원팀 */}
      <div className="profile-card card">
        <div className="profile-card-label">현재 응원하는 팀</div>
        {currentTeam ? (
          <div className="profile-current">
            <span className="profile-current-dot" style={{ background: currentTeam.color }} />
            <span className="profile-current-name">{currentTeam.name}</span>
          </div>
        ) : (
          <p className="profile-current-empty">아직 응원하는 팀을 선택하지 않았어요.</p>
        )}
      </div>

      {/* 팀 교체 */}
      <div className="profile-card card">
        <div className="profile-card-label">팀 바꾸기</div>
        <p className="profile-card-hint">새로 응원할 팀을 선택하세요</p>

        <div className="profile-team-grid">
          {KBO_TEAMS.map(team => (
            <button
              key={team.id}
              className={`profile-team-btn ${selected?.id === team.id ? 'selected' : ''}`}
              style={selected?.id === team.id ? { borderColor: team.color, background: team.color + '18' } : {}}
              onClick={() => setSelected(team)}
            >
              <span className="profile-team-dot" style={{ background: team.color }} />
              <span className="profile-team-name">{team.id}</span>
            </button>
          ))}
        </div>

        <div className="profile-actions">
          <button
            className="profile-save-btn"
            disabled={!changed}
            onClick={handleSave}
          >
            {changed ? '팀 변경하기' : '변경할 팀을 선택하세요'}
          </button>
        </div>
      </div>
    </div>
  );
}

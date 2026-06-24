import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KBO_TEAMS } from '../data/mockData';
import './Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  function handleConfirm() {
    if (!selected) return;
    localStorage.setItem('myTeam', selected.id);
    navigate('/');
  }

  return (
    <div className="onboarding">
      <div className="ob-card">
        <div className="ob-top">
          <div className="ob-ball">⚾</div>
          <h1 className="ob-title">My Baseball Diary</h1>
          <p className="ob-sub">내 야구 직관을 기록하는 나만의 공간</p>
        </div>

        <div className="ob-question">
          <p className="ob-q-label">응원하는 팀이 어디예요?</p>
          <p className="ob-q-hint">나중에 내 정보에서 바꿀 수 있어요</p>
        </div>

        <div className="ob-team-grid">
          {KBO_TEAMS.map(team => (
            <button
              key={team.id}
              className={`ob-team-btn ${selected?.id === team.id ? 'selected' : ''}`}
              style={selected?.id === team.id ? { borderColor: team.color, background: team.color + '18' } : {}}
              onClick={() => setSelected(team)}
            >
              <span
                className="ob-team-dot"
                style={{ background: team.color }}
              />
              <span className="ob-team-name">{team.id}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="ob-selected-info">
            <span className="ob-selected-dot" style={{ background: selected.color }} />
            <span className="ob-selected-text">
              <strong>{selected.name}</strong> 팬이군요! 👋
            </span>
          </div>
        )}

        <button
          className="ob-confirm-btn"
          disabled={!selected}
          onClick={handleConfirm}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

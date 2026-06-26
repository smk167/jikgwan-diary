import { useLocation, useNavigate } from 'react-router-dom';
import { KBO_TEAMS } from '../../data/mockData';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: '홈' },
  { path: '/records', icon: '⚾', label: '직관 기록 목록' },
  { path: '/stats', icon: '📊', label: '통계' },
  { path: '/stadiums', icon: '🏟️', label: '구장' },
  { path: '/group', icon: '👥', label: '그룹' },
  { path: '/profile', icon: '👤', label: '내 정보' },
];

export default function Sidebar({ darkMode, onToggleDark }) {
  const location = useLocation();
  const navigate = useNavigate();
  const myTeamId = localStorage.getItem('myTeam');
  const myTeam = KBO_TEAMS.find(t => t.id === myTeamId);
  const username = localStorage.getItem('username');

  function handleLogout() {
    if (!window.confirm('로그아웃 할까요?')) return;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('myTeam');
    window.location.href = '/login';
  }

  return (
    <aside className="sidebar">
      {/* 로고 */}
      <div className="sidebar-logo" onClick={() => navigate('/')}>
        <div className="sidebar-logo-icon">⚾</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">My Baseball</span>
          <span className="sidebar-logo-sub">Diary</span>
        </div>
      </div>

      {/* 팀 뱃지 or 소개 */}
      {myTeam ? (
        <div className="sidebar-my-team" style={{ '--team-color': myTeam.color }}>
          <span className="sidebar-my-team-dot" style={{ background: myTeam.color }} />
          <span className="sidebar-my-team-name">{myTeam.name}</span>
        </div>
      ) : (
        <p className="sidebar-tagline">내 야구 직관을 추억을<br />기록하고 간직하세요!</p>
      )}

      {/* 네비 */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path ||
            (item.path === '/records' && location.pathname.startsWith('/write')) ||
            (item.path === '/records' && location.pathname.startsWith('/record'));
          return (
            <button
              key={item.path}
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 하단 */}
      <div className="sidebar-footer">
        <button
          className="sidebar-write-btn"
          onClick={() => {
            const isEditing = /^\/write\/.+/.test(location.pathname);
            if (isEditing && !window.confirm('수정 중인 내용이 사라집니다. 새 기록을 작성할까요?')) return;
            navigate('/write');
          }}
        >
          <span className="sidebar-write-plus">+</span>
          새 기록 작성
        </button>
        <div className="sidebar-footer-row">
          <button className="sidebar-dark-btn" onClick={onToggleDark} title="다크모드">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="로그아웃">
            {username && <span className="sidebar-username">{username}</span>}
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

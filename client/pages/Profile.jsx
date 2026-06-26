import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KBO_TEAMS } from '../data/mockData';
import { updateMyTeam, changePassword, adminListUsers, adminResetPassword } from '../api';
import PasswordInput from '../components/ui/PasswordInput';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const currentId = localStorage.getItem('myTeam');
  const currentTeam = KBO_TEAMS.find(t => t.id === currentId);
  const username = localStorage.getItem('username');
  const isAdmin = localStorage.getItem('isAdmin') === '1';
  const [selected, setSelected] = useState(currentTeam || null);

  // 비밀번호 변경
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState(null); // { type, text }

  // 관리자: 사용자 목록 / 초기화
  const [users, setUsers] = useState([]);
  const [resetTarget, setResetTarget] = useState('');
  const [resetPw, setResetPw] = useState('');
  const [resetMsg, setResetMsg] = useState(null);

  const changed = selected && selected.id !== currentId;

  useEffect(() => {
    if (isAdmin) {
      adminListUsers().then(r => setUsers(r.data)).catch(() => {});
    }
  }, [isAdmin]);

  async function handleSave() {
    if (!selected) return;
    try {
      await updateMyTeam(selected.id);
    } catch {
      // 서버 저장 실패해도 로컬 반영은 진행
    }
    localStorage.setItem('myTeam', selected.id);
    window.location.href = '/';
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next !== pw.confirm) {
      setPwMsg({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    try {
      await changePassword(pw.current, pw.next);
      setPwMsg({ type: 'ok', text: '비밀번호가 변경되었습니다.' });
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.error || '변경에 실패했습니다.' });
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setResetMsg(null);
    if (!resetTarget) {
      setResetMsg({ type: 'error', text: '초기화할 아이디를 선택하세요.' });
      return;
    }
    try {
      await adminResetPassword(resetTarget, resetPw);
      setResetMsg({ type: 'ok', text: `'${resetTarget}'의 비밀번호를 초기화했습니다.` });
      setResetPw('');
    } catch (err) {
      setResetMsg({ type: 'error', text: err.response?.data?.error || '초기화에 실패했습니다.' });
    }
  }

  function handleLogout() {
    if (!window.confirm('로그아웃 할까요?')) return;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('myTeam');
    localStorage.removeItem('isAdmin');
    window.location.href = '/login';
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h2 className="profile-title">👤 내 정보</h2>
      </div>

      {/* 계정 */}
      {username && (
        <div className="profile-card card">
          <div className="profile-card-label">계정</div>
          <div className="profile-current">
            <span className="profile-current-name">@{username}{isAdmin && <span className="profile-admin-badge">관리자</span>}</span>
          </div>
        </div>
      )}

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

      {/* 비밀번호 변경 */}
      <form className="profile-card card" onSubmit={handleChangePassword}>
        <div className="profile-card-label">비밀번호 변경</div>
        {pwMsg && <p className={`profile-msg profile-msg-${pwMsg.type}`}>{pwMsg.text}</p>}
        <PasswordInput
          className="profile-input"
          placeholder="현재 비밀번호"
          autoComplete="current-password"
          value={pw.current}
          onChange={e => setPw({ ...pw, current: e.target.value })}
        />
        <PasswordInput
          className="profile-input"
          placeholder="새 비밀번호 (6자 이상)"
          autoComplete="new-password"
          value={pw.next}
          onChange={e => setPw({ ...pw, next: e.target.value })}
        />
        <PasswordInput
          className="profile-input"
          placeholder="새 비밀번호 확인"
          autoComplete="new-password"
          value={pw.confirm}
          onChange={e => setPw({ ...pw, confirm: e.target.value })}
        />
        <div className="profile-actions">
          <button
            className="profile-save-btn"
            type="submit"
            disabled={!pw.current || !pw.next || !pw.confirm}
          >
            비밀번호 변경
          </button>
        </div>
      </form>

      {/* 관리자: 비밀번호 초기화 */}
      {isAdmin && (
        <form className="profile-card card profile-admin-card" onSubmit={handleReset}>
          <div className="profile-card-label">🔧 관리자 · 비밀번호 초기화</div>
          <p className="profile-card-hint">동료가 비밀번호를 잊었을 때 새 비밀번호로 초기화해 주세요.</p>
          {resetMsg && <p className={`profile-msg profile-msg-${resetMsg.type}`}>{resetMsg.text}</p>}
          <select
            className="profile-input"
            value={resetTarget}
            onChange={e => setResetTarget(e.target.value)}
          >
            <option value="">아이디 선택</option>
            {users.map(u => (
              <option key={u.id} value={u.username}>{u.username}</option>
            ))}
          </select>
          <input
            className="profile-input"
            type="text"
            placeholder="새 비밀번호 (6자 이상)"
            value={resetPw}
            onChange={e => setResetPw(e.target.value)}
          />
          <div className="profile-actions">
            <button
              className="profile-save-btn"
              type="submit"
              disabled={!resetTarget || !resetPw}
            >
              초기화하기
            </button>
          </div>
        </form>
      )}

      <button className="profile-logout-btn" onClick={handleLogout}>
        로그아웃
      </button>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api';
import { KBO_TEAMS } from '../data/mockData';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await signup({ username, password, team: team?.id || null });
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('isAdmin', data.user.isAdmin ? '1' : '');
      if (data.user.team) localStorage.setItem('myTeam', data.user.team);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-top">
          <div className="auth-ball">⚾</div>
          <h1 className="auth-title">회원가입</h1>
          <p className="auth-sub">나만의 직관 다이어리를 시작하세요</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label className="auth-label">아이디</label>
          <input
            className="auth-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="영문/숫자/_ 3~20자"
            autoComplete="username"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">비밀번호</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="6자 이상"
            autoComplete="new-password"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">비밀번호 확인</label>
          <input
            className="auth-input"
            type="password"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            placeholder="비밀번호 재입력"
            autoComplete="new-password"
          />
        </div>

        <div className="auth-field">
          <span className="auth-team-label">응원하는 팀 (선택)</span>
          <div className="auth-team-grid">
            {KBO_TEAMS.map(t => (
              <button
                key={t.id}
                type="button"
                className="auth-team-btn"
                style={team?.id === t.id ? { borderColor: t.color, background: t.color + '18' } : {}}
                onClick={() => setTeam(team?.id === t.id ? null : t)}
              >
                <span className="auth-team-dot" style={{ background: t.color }} />
                <span className="auth-team-name">{t.id}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="auth-submit" type="submit" disabled={submitting || !username || !password || !password2}>
          {submitting ? '가입 중...' : '회원가입'}
        </button>

        <p className="auth-switch">
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </form>
    </div>
  );
}

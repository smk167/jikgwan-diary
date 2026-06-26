import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import PasswordInput from '../components/ui/PasswordInput';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await login({ username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('isAdmin', data.user.isAdmin ? '1' : '');
      if (data.user.team) localStorage.setItem('myTeam', data.user.team);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-top">
          <div className="auth-ball">⚾</div>
          <h1 className="auth-title">직관 다이어리</h1>
          <p className="auth-sub">로그인하고 내 직관 기록을 관리하세요</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label className="auth-label">아이디</label>
          <input
            className="auth-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="아이디"
            autoComplete="username"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">비밀번호</label>
          <PasswordInput
            className="auth-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
          />
        </div>

        <button className="auth-submit" type="submit" disabled={submitting || !username || !password}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>

        <p className="auth-switch">
          아직 계정이 없나요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </div>
  );
}

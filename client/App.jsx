import { useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import RightPanel from './components/layout/RightPanel';
import Home from './pages/Home';
import Write from './pages/Write';
import Detail from './pages/Detail';
import Stats from './pages/Stats';
import Stadiums from './pages/Stadiums';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

const HOME_ROUTES = ['/', '/records', '/list'];
const STAT_ROUTES = ['/stats'];
const STADIUM_ROUTES = ['/stadiums'];

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector('.app-main')?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppLayout() {
  const location = useLocation();
  const path = location.pathname;
  const showRight = HOME_ROUTES.includes(path) || STAT_ROUTES.includes(path) || STADIUM_ROUTES.includes(path);

  return (
    <AppShell rightPanel={showRight ? <RightPanel /> : null}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/records" element={<Home />} />
        <Route path="/list" element={<Home />} />
        <Route path="/write" element={<Write />} />
        <Route path="/write/:id" element={<Write />} />
        <Route path="/record/:id" element={<Detail />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/stadiums" element={<Stadiums />} />
        <Route path="/group" element={<GroupPlaceholder />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AppShell>
  );
}

const AUTH_ROUTES = ['/login', '/signup'];

function RouterGuard() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const onAuthPage = AUTH_ROUTES.includes(location.pathname);

  // 미로그인: 로그인/회원가입만 허용
  if (!token) {
    if (location.pathname === '/signup') return <Signup />;
    if (location.pathname === '/login') return <Login />;
    return <Navigate to="/login" replace />;
  }

  // 로그인 상태에서 인증 페이지 접근 시 홈으로
  if (onAuthPage) {
    return <Navigate to="/" replace />;
  }

  return <AppLayout />;
}

function GroupPlaceholder() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>그룹 기능</h2>
      <p>친구와 함께한 직관 기록을 공유하는 기능이 곧 출시됩니다!</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<RouterGuard />} />
      </Routes>
    </BrowserRouter>
  );
}

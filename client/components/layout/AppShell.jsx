import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AppShell.css';

export default function AppShell({ children, rightPanel }) {
  const [darkMode, setDarkMode] = useState(false);

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
  }

  return (
    <div className={`app-shell${rightPanel ? '' : ' no-right'}`}>
      <Sidebar darkMode={darkMode} onToggleDark={toggleDark} />
      <main className="app-main">{children}</main>
      {rightPanel && <aside className="app-right">{rightPanel}</aside>}
      {/* 모바일 하단 탭바 */}
      <MobileTabBar />
    </div>
  );
}

function MobileTabBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { href: '/', icon: '🏠', label: '홈' },
    { href: '/records', icon: '📋', label: '기록' },
    { href: '/stats', icon: '📊', label: '통계' },
    { href: '/stadiums', icon: '🏟️', label: '구장' },
    { href: '/profile', icon: '👤', label: '내 정보' },
  ];

  function isActive(href) {
    if (href === '/') return pathname === '/';
    if (href === '/records') {
      return pathname.startsWith('/records') || pathname.startsWith('/write') || pathname.startsWith('/record');
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="mobile-tabbar">
      {tabs.map(t => (
        <button
          key={t.href}
          className={`mobile-tab ${isActive(t.href) ? 'active' : ''}`}
          onClick={() => navigate(t.href)}
        >
          <span className="mobile-tab-icon">{t.icon}</span>
          <span className="mobile-tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

import { useState } from 'react';
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
    <div className="app-shell">
      <Sidebar darkMode={darkMode} onToggleDark={toggleDark} />
      <main className="app-main">{children}</main>
      {rightPanel && <aside className="app-right">{rightPanel}</aside>}
      {/* 모바일 하단 탭바 */}
      <MobileTabBar />
    </div>
  );
}

function MobileTabBar() {
  const { pathname } = window.location;

  const tabs = [
    { href: '/', icon: '🏠', label: '홈' },
    { href: '/records', icon: '📋', label: '기록' },
    { href: '/stats', icon: '📊', label: '통계' },
    { href: '/stadiums', icon: '🏟️', label: '구장' },
  ];

  return (
    <nav className="mobile-tabbar">
      {tabs.map(t => (
        <a
          key={t.href}
          href={t.href}
          className={`mobile-tab ${pathname === t.href ? 'active' : ''}`}
          onClick={e => {
            e.preventDefault();
            window.history.pushState({}, '', t.href);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
        >
          <span className="mobile-tab-icon">{t.icon}</span>
          <span className="mobile-tab-label">{t.label}</span>
        </a>
      ))}
    </nav>
  );
}

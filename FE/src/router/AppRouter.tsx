import { useEffect, useState } from 'react';
import App from '../App';
import LandingPage from '../pages/LandingPage';
import { ChatProvider } from '../context/ChatContext';

function normalizePath(pathname: string) {
  if (pathname === '/chat') return '/chat';
  if (pathname === '/') return '/';
  return '/';
}

export default function AppRouter() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('chatlo_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatlo_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const navigate = (path: '/' | '/chat') => {
    if (path === pathname) return;
    window.history.pushState({}, '', path);
    setPathname(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  if (pathname === '/chat') {
    return (
      <ChatProvider>
        <App theme={theme} onToggleTheme={toggleTheme} />
      </ChatProvider>
    );
  }

  return <LandingPage onOpenChat={() => navigate('/chat')} theme={theme} onToggleTheme={toggleTheme} />;
}

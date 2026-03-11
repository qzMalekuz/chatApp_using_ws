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

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: '/' | '/chat') => {
    if (path === pathname) return;
    window.history.pushState({}, '', path);
    setPathname(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (pathname === '/chat') {
    return (
      <ChatProvider>
        <App />
      </ChatProvider>
    );
  }

  return <LandingPage onOpenChat={() => navigate('/chat')} />;
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from './context/ChatContext';
import UsernameModal from './components/UsernameModal';
import ChatsSidebar from './components/ChatsSidebar';
import ChatArea from './components/ChatArea';
import ProfileModal from './components/ProfileModal';
import Toast from './components/Toast';

type MobileTab = 'chat' | 'chatsList';

export default function App() {
  const { currentUser, connected, currentRoom, joinRoom } = useChatContext();
  const [usernameSet, setUsernameSet] = useState(false);

  // 'global', 'room:abc', 'user:123'
  const [activeChatId, setActiveChatId] = useState<string>('global');

  const [mobileTab, setMobileTab] = useState<MobileTab>('chat');
  const [showProfile, setShowProfile] = useState(false);

  // Theme Management
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('chatlo_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('chatlo_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleSelectChat = (id: string, _name: string) => {
    setActiveChatId(id);
    if (id.startsWith('room:')) {
      const roomName = id.replace('room:', '');
      if (currentRoom !== roomName) joinRoom(roomName);
    }
    setMobileTab('chat');
  };

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-dim text-sm">Connecting...</p>
      </div>
    );
  }

  if (!usernameSet) {
    return (
      <>
        <UsernameModal onComplete={() => setUsernameSet(true)} />
        <button
          onClick={() => setUsernameSet(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 text-text-dim text-xs hover:text-text-muted z-50
            transition-colors cursor-pointer"
        >
          Continue as {currentUser.username}
        </button>
      </>
    );
  }

  const tabs: { key: ChatMode; label: string; show: boolean }[] = [
    { key: 'global', label: 'Global', show: true },
    { key: 'private', label: 'DM', show: !!privateChatUserId },
    { key: 'room', label: currentRoom ? `# ${currentRoom}` : 'Room', show: !!currentRoom },
  ];

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Top Banner indicating Reconnection */}
      <AnimatePresence>
        {!connected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-error/10 text-error text-xs text-center py-1.5 font-medium"
          >
            Reconnecting...
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop) */}
        <div className="hidden md:flex w-80 flex-shrink-0 border-r border-border">
          <div className="flex-1 w-full min-w-0">
            <ChatsSidebar
              activeChat={activeChatId}
              onSelectChat={handleSelectChat}
              onOpenProfile={() => setShowProfile(true)}
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 min-w-0 flex flex-col bg-bg-primary relative shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.2)] z-10">
          {/* Header Theme Toggle (temporarily placed here for global access) */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-dim hover:text-text-primary transition-colors cursor-pointer shadow-lg"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>
          </div>

          <div className="flex-1 min-h-0 relative">
            <ChatArea
              chatMode={activeChatId.startsWith('room:') ? 'room' : (activeChatId.startsWith('user:') ? 'private' : 'global')}
              privateChatUserId={activeChatId.startsWith('user:') ? parseInt(activeChatId.replace('user:', '')) : null}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tabs */}
      <div className="md:hidden flex border-t border-border bg-bg-secondary shrink-0">
        <button
          onClick={() => setMobileTab('chatsList')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-r border-border
              ${mobileTab === 'chatsList' ? 'text-accent bg-bg-hover' : 'text-text-dim'}`}
        >
          Chats List
        </button>
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer
              ${mobileTab === 'chat' ? 'text-accent bg-bg-hover' : 'text-text-dim'}`}
        >
          Current Chat
        </button>
      </div>

      <AnimatePresence>
        {mobileTab === 'chatsList' && (
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="md:hidden fixed inset-0 bottom-[49px] z-40 bg-bg-secondary"
          >
            <ChatsSidebar activeChat={activeChatId} onSelectChat={handleSelectChat} onOpenProfile={() => setShowProfile(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
      <Toast />
    </div>
  );
}

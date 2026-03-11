import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from './context/ChatContext';
import UsernameModal from './components/UsernameModal';
import ChatsSidebar from './components/ChatsSidebar';
import ChatArea from './components/ChatArea';
import ProfileModal from './components/ProfileModal';
import UserProfileModal from './components/UserProfileModal';
import Toast from './components/Toast';
import ThemeToggle from './components/ThemeToggle';

interface AppProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function App({ theme, onToggleTheme }: AppProps) {
  const { currentUser, connected, currentRoom, joinRoom } = useChatContext();
  const [usernameSet, setUsernameSet] = useState(false);

  // 'global', 'room:abc', 'user:123'
  const [activeChatId, setActiveChatId] = useState<string>('global');
  const [showMobileChat, setShowMobileChat] = useState(false);

  const [showProfile, setShowProfile] = useState(false);

  const handleSelectChat = (id: string, _name: string) => {
    setActiveChatId(id);
    if (id.startsWith('room:')) {
      const roomName = id.replace('room:', '');
      if (currentRoom !== roomName) joinRoom(roomName);
    }
    setShowMobileChat(true);
  };

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <p className="text-text-dim text-sm">Connecting...</p>
      </div>
    );
  }

  if (!usernameSet) {
    return (
      <>
        <UsernameModal onComplete={() => setUsernameSet(true)} />
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <button
          onClick={() => setUsernameSet(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 text-text-dim text-xs hover:text-text-muted z-50 transition-colors cursor-pointer"
        >
          Continue as {currentUser.username}
        </button>
      </>
    );
  }

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
        {/* Left Sidebar (Desktop + Tablet) & Fullscreen on Mobile (when chat hidden) */}
        <div className={`
          ${showMobileChat ? 'hidden md:flex' : 'flex'} 
          w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-border
        `}>
          <div className="flex-1 w-full min-w-0">
            <ChatsSidebar
              activeChat={activeChatId}
              onSelectChat={handleSelectChat}
              onOpenProfile={() => setShowProfile(true)}
            />
          </div>
        </div>

        {/* Main Chat Area - Hidden on mobile if showMobileChat is false */}
        <div className={`
          ${!showMobileChat ? 'hidden md:flex' : 'flex'} 
          flex-1 min-w-0 flex-col bg-bg-primary relative shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.2)] z-10
        `}>
          {/* Header: Theme Toggle — perfectly centered */}
          <div className="absolute top-3 right-3 z-20 flex items-center justify-center">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>

          <div className="flex-1 min-h-0 relative">
            <ChatArea
              chatMode={activeChatId.startsWith('room:') ? 'room' : (activeChatId.startsWith('user:') ? 'private' : 'global')}
              privateChatUserId={activeChatId.startsWith('user:') ? parseInt(activeChatId.replace('user:', '')) : null}
              onBack={() => setShowMobileChat(false)}
            />
          </div>
        </div>
      </div>

      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
      <UserProfileModal />
      <Toast />
    </div>
  );
}

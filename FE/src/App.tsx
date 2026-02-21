import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from './context/ChatContext';
import UsernameModal from './components/UsernameModal';
import UsersSidebar from './components/UsersSidebar';
import ChatArea from './components/ChatArea';
import RoomPanel from './components/RoomPanel';
import ProfileModal from './components/ProfileModal';
import Toast from './components/Toast';

type ChatMode = 'global' | 'room' | 'private';
type MobileTab = 'users' | 'chat' | 'rooms';

export default function App() {
  const { currentUser, connected, currentRoom } = useChatContext();
  const [usernameSet, setUsernameSet] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('global');
  const [privateChatUserId, setPrivateChatUserId] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('chat');
  const [showProfile, setShowProfile] = useState(false);

  const handleSelectUser = (userId: number) => {
    setPrivateChatUserId(userId);
    setChatMode('private');
    setMobileTab('chat');
  };

  const handleRoomChange = (room: string | null) => {
    setChatMode(room ? 'room' : 'global');
    setMobileTab('chat');
  };

  const handleGlobalChat = () => {
    setChatMode('global');
    setPrivateChatUserId(null);
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
    <div className="h-screen flex flex-col bg-bg-primary">
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
        <div className="hidden md:block w-64 flex-shrink-0">
          <UsersSidebar activeChat={privateChatUserId} onSelectUser={handleSelectUser} onOpenProfile={() => setShowProfile(true)} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex gap-1 px-4 border-b border-border bg-bg-secondary">
            {tabs.filter(t => t.show).map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'global') handleGlobalChat();
                  else setChatMode(tab.key);
                }}
                className={`px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer border-b-2
                  ${chatMode === tab.key
                    ? 'text-accent border-accent'
                    : 'text-text-dim hover:text-text-muted border-transparent'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0">
            <ChatArea chatMode={chatMode} privateChatUserId={privateChatUserId} />
          </div>
        </div>

        <div className="hidden lg:block w-64 flex-shrink-0">
          <RoomPanel onRoomChange={handleRoomChange} />
        </div>
      </div>

      {/* Mobile bottom tabs */}
      <div className="md:hidden flex border-t border-border bg-bg-secondary">
        {(['users', 'chat', 'rooms'] as MobileTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer
              ${mobileTab === tab ? 'text-accent' : 'text-text-dim'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {mobileTab === 'users' && (
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="md:hidden fixed inset-0 bottom-12 z-40 w-72 bg-bg-secondary"
          >
            <UsersSidebar activeChat={privateChatUserId} onSelectUser={handleSelectUser} onOpenProfile={() => setShowProfile(true)} />
          </motion.div>
        )}
        {mobileTab === 'rooms' && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden fixed top-0 bottom-12 right-0 z-40 w-72 bg-bg-secondary"
          >
            <RoomPanel onRoomChange={handleRoomChange} />
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
      <Toast />
    </div>
  );
}

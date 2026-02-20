import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from './context/ChatContext';
import UsernameModal from './components/UsernameModal';
import UsersSidebar from './components/UsersSidebar';
import ChatArea from './components/ChatArea';
import RoomPanel from './components/RoomPanel';
import Toast from './components/Toast';

type ChatMode = 'global' | 'room' | 'private';
type MobileTab = 'users' | 'chat' | 'rooms';

export default function App() {
  const { currentUser, connected, currentRoom } = useChatContext();
  const [usernameSet, setUsernameSet] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('global');
  const [privateChatUserId, setPrivateChatUserId] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('chat');

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

  // Loading screen
  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-3 h-3 bg-accent rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="text-text-dim text-sm font-medium">Connecting</p>
        </motion.div>
      </div>
    );
  }

  // Username modal
  if (!usernameSet) {
    return (
      <>
        <UsernameModal onComplete={() => setUsernameSet(true)} />
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => setUsernameSet(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 text-text-dim text-xs hover:text-text-muted z-50
            transition-colors cursor-pointer px-4 py-2 rounded-full border border-border hover:border-border-glow"
        >
          Continue as {currentUser.username}
        </motion.button>
      </>
    );
  }

  // Chat tabs config — Room tab stays visible as long as user is in a room
  const tabs: { key: ChatMode; label: string; show: boolean }[] = [
    { key: 'global', label: 'Global', show: true },
    { key: 'private', label: 'DM', show: !!privateChatUserId },
    { key: 'room', label: currentRoom ? `# ${currentRoom}` : 'Room', show: !!currentRoom },
  ];

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* Disconnected bar */}
      <AnimatePresence>
        {!connected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-error/10 border-b border-error/20 text-error text-xs text-center py-2 font-semibold"
          >
            ⚡ Connection lost — reconnecting...
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — desktop */}
        <div className="hidden md:block w-72 flex-shrink-0">
          <UsersSidebar activeChat={privateChatUserId} onSelectUser={handleSelectUser} />
        </div>

        {/* Center */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-5 pt-3 pb-0 bg-bg-secondary/40">
            {tabs.filter(t => t.show).map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'global') handleGlobalChat();
                  else setChatMode(tab.key);
                }}
                className={`relative px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all duration-200 cursor-pointer
                  ${chatMode === tab.key
                    ? 'text-accent bg-bg-primary'
                    : 'text-text-dim hover:text-text-muted hover:bg-bg-primary/50'
                  }`}
              >
                {tab.label}
                {chatMode === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0">
            <ChatArea chatMode={chatMode} privateChatUserId={privateChatUserId} />
          </div>
        </div>

        {/* Right sidebar — desktop */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <RoomPanel onRoomChange={handleRoomChange} />
        </div>
      </div>

      {/* Mobile bottom tabs */}
      <div className="md:hidden flex border-t border-border bg-bg-secondary/80 backdrop-blur-md">
        {(['users', 'chat', 'rooms'] as MobileTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
              ${mobileTab === tab ? 'text-accent' : 'text-text-dim'}`}
          >
            <span className="text-base block mb-0.5">
              {tab === 'users' ? '👥' : tab === 'chat' ? '💬' : '🏠'}
            </span>
            {tab}
          </button>
        ))}
      </div>

      {/* Mobile slide-in panels */}
      <AnimatePresence>
        {mobileTab === 'users' && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="md:hidden fixed inset-0 bottom-14 z-40 w-80 bg-bg-secondary shadow-2xl"
          >
            <UsersSidebar activeChat={privateChatUserId} onSelectUser={handleSelectUser} />
          </motion.div>
        )}
        {mobileTab === 'rooms' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden fixed top-0 bottom-14 right-0 z-40 w-80 bg-bg-secondary shadow-2xl"
          >
            <RoomPanel onRoomChange={handleRoomChange} />
          </motion.div>
        )}
      </AnimatePresence>

      <Toast />
    </div>
  );
}

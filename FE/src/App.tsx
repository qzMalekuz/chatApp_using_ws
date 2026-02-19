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
  const { currentUser, connected } = useChatContext();
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
    if (room) {
      setChatMode('room');
      setMobileTab('chat');
    } else {
      setChatMode('global');
    }
  };

  const handleGlobalChat = () => {
    setChatMode('global');
    setPrivateChatUserId(null);
    setMobileTab('chat');
  };

  // Loading — waiting for WebSocket to connect and assign a user
  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-text-muted text-sm"
        >
          Connecting...
        </motion.div>
      </div>
    );
  }

  // Show username modal until user picks a name
  if (!usernameSet) {
    return (
      <>
        <UsernameModal onComplete={() => setUsernameSet(true)} />
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
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* Connection status */}
      <AnimatePresence>
        {!connected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-error/20 text-error text-xs text-center py-1.5 font-medium"
          >
            Reconnecting...
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <UsersSidebar activeChat={privateChatUserId} onSelectUser={handleSelectUser} />
        </div>

        {/* Center */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Chat mode tabs */}
          <div className="flex border-b border-border bg-bg-secondary/50">
            <button
              onClick={handleGlobalChat}
              className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer
                ${chatMode === 'global' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'}`}
            >
              Global
            </button>
            {privateChatUserId && (
              <button
                onClick={() => setChatMode('private')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer
                  ${chatMode === 'private' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'}`}
              >
                DM
              </button>
            )}
            {chatMode === 'room' && (
              <button
                className="px-4 py-2.5 text-sm font-medium text-accent border-b-2 border-accent cursor-pointer"
              >
                Room
              </button>
            )}
          </div>

          <div className="flex-1 min-h-0">
            <ChatArea chatMode={chatMode} privateChatUserId={privateChatUserId} />
          </div>
        </div>

        {/* Right sidebar — desktop */}
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
              ${mobileTab === tab ? 'text-accent' : 'text-text-muted'}`}
          >
            {tab === 'users' ? '👥 Users' : tab === 'chat' ? '💬 Chat' : '🏠 Rooms'}
          </button>
        ))}
      </div>

      {/* Mobile slide-in panels */}
      <AnimatePresence>
        {mobileTab === 'users' && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="md:hidden fixed inset-0 top-0 bottom-12 z-40 w-72 bg-bg-secondary"
          >
            <UsersSidebar activeChat={privateChatUserId} onSelectUser={handleSelectUser} />
          </motion.div>
        )}
        {mobileTab === 'rooms' && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="lg:hidden fixed inset-0 top-0 bottom-12 z-40 right-0 w-72 ml-auto bg-bg-secondary"
          >
            <RoomPanel onRoomChange={handleRoomChange} />
          </motion.div>
        )}
      </AnimatePresence>

      <Toast />
    </div>
  );
}

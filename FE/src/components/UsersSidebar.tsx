import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

interface Props {
    activeChat: number | null;
    onSelectUser: (id: number) => void;
    onOpenProfile?: () => void;
}

export default function UsersSidebar({ activeChat, onSelectUser, onOpenProfile }: Props) {
    const { onlineUsers, currentUser, userProfile, requestUsers, connected } = useChatContext();

    useEffect(() => {
        if (connected) requestUsers();
    }, [connected, requestUsers]);

    const otherUsers = onlineUsers.filter(u => u.id !== currentUser?.id);

    return (
        <div className="h-full flex flex-col bg-bg-secondary border-r border-border">
            <div className="p-4 border-b border-border">
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Online ({otherUsers.length})
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                <AnimatePresence>
                    {otherUsers.map(user => (
                        <motion.button
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => onSelectUser(user.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 cursor-pointer
                ${activeChat === user.id
                                    ? 'bg-bg-hover text-accent'
                                    : 'hover:bg-bg-hover text-text-primary'
                                }`}
                        >
                            <div className="relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                  ${activeChat === user.id ? 'bg-accent text-bg-primary' : 'bg-bg-card text-text-muted'}`}>
                                    {user.username[0].toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-bg-secondary" />
                            </div>
                            <span className="text-sm truncate">{user.username}</span>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {otherUsers.length === 0 && (
                    <p className="text-text-dim text-xs text-center py-8">No one else online</p>
                )}
            </div>

            {/* Current user bar — clickable to open profile */}
            <div className="p-3 border-t border-border">
                <button
                    onClick={onOpenProfile}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-bg-card
                      hover:bg-bg-hover border border-transparent hover:border-border
                      transition-all duration-200 cursor-pointer group"
                >
                    <div className="relative flex-shrink-0">
                        {userProfile.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-bg-primary">
                                {currentUser?.username[0]?.toUpperCase()}
                            </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-card
                          ${connected ? 'bg-success' : 'bg-error'}`} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-text-primary truncate">{currentUser?.username}</p>
                        {userProfile.status && (
                            <p className="text-[10px] text-text-dim truncate">{userProfile.status}</p>
                        )}
                    </div>
                    {/* Chevron hint */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="text-text-dim group-hover:text-text-muted transition-colors flex-shrink-0">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}


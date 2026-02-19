import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

interface Props {
    activeChat: number | null;
    onSelectUser: (id: number) => void;
}

export default function UsersSidebar({ activeChat, onSelectUser }: Props) {
    const { onlineUsers, currentUser, requestUsers, connected } = useChatContext();

    useEffect(() => {
        if (connected) requestUsers();
    }, [connected, requestUsers]);

    const otherUsers = onlineUsers.filter(u => u.id !== currentUser?.id);

    return (
        <div className="h-full flex flex-col bg-bg-secondary border-r border-border">
            {/* Header */}
            <div className="p-5 border-b border-border">
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.15em]">
                    Online
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-semibold">
                        {otherUsers.length}
                    </span>
                </h2>
            </div>

            {/* Users list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <AnimatePresence>
                    {otherUsers.map(user => (
                        <motion.button
                            key={user.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ x: 3 }}
                            onClick={() => onSelectUser(user.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer group
                ${activeChat === user.id
                                    ? 'bg-accent/15 border border-accent/30'
                                    : 'hover:bg-bg-hover border border-transparent'
                                }`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                  ${activeChat === user.id ? 'bg-accent text-white' : 'bg-bg-hover text-text-muted group-hover:bg-accent/30 group-hover:text-accent'}`}
                                    style={{ transition: 'all 0.2s' }}>
                                    {user.username[0].toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-bg-secondary" />
                            </div>
                            <span className={`text-sm font-medium truncate
                ${activeChat === user.id ? 'text-accent' : 'text-text-primary'}`}>
                                {user.username}
                            </span>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {otherUsers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-text-dim text-2xl mb-2">🫧</p>
                        <p className="text-text-dim text-xs">No one else online</p>
                    </div>
                )}
            </div>

            {/* Current user */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-card border border-border">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-accent/30">
                        {currentUser?.username[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{currentUser?.username}</p>
                        <p className="text-[10px] text-success font-medium">Online</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

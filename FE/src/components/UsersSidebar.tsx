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
        <div className="h-full flex flex-col bg-bg-secondary/80 backdrop-blur-md border-r border-border">
            <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
                    Online — {otherUsers.length}
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <AnimatePresence>
                    {otherUsers.map(user => (
                        <motion.button
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            whileHover={{ x: 4 }}
                            onClick={() => onSelectUser(user.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 cursor-pointer
                ${activeChat === user.id ? 'bg-accent/20 text-accent' : 'hover:bg-bg-hover text-text-primary'}`}
                        >
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-sm font-semibold">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-bg-secondary" />
                            </div>
                            <span className="text-sm font-medium truncate">{user.username}</span>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {otherUsers.length === 0 && (
                    <p className="text-text-dim text-sm text-center py-8">No one else online</p>
                )}
            </div>

            <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card">
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
                        {currentUser?.username[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium truncate text-text-primary">{currentUser?.username}</span>
                </div>
            </div>
        </div>
    );
}

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

interface Props {
    activeChat: string | null; // e.g., 'global', 'room:abc', 'user:123'
    onSelectChat: (id: string, name: string) => void;
    onOpenProfile?: () => void;
}

export default function ChatsSidebar({ activeChat, onSelectChat, onOpenProfile }: Props) {
    const { onlineUsers, currentUser, userProfile, requestUsers, connected, currentRoom, roomMembers } = useChatContext();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (connected) requestUsers();
    }, [connected, requestUsers]);

    // Construct the unified list of chats
    const chatItems = useMemo(() => {
        const items = [];

        // 1. Global Chat
        items.push({
            id: 'global',
            type: 'global',
            name: 'Global Chat',
            subtext: 'Public channel',
            icon: (
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-bg-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
            )
        });

        // 2. Current Room (if any)
        if (currentRoom) {
            items.push({
                id: `room:${currentRoom}`,
                type: 'room',
                name: `#${currentRoom}`,
                subtext: `${roomMembers.length} members`,
                icon: (
                    <div className="w-12 h-12 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-primary font-bold text-lg">
                        #
                    </div>
                )
            });
        }

        // 3. Direct Messages (Online Users)
        const otherUsers = onlineUsers.filter(u => u.id !== currentUser?.id);
        otherUsers.forEach(u => {
            // Note: In a real app we'd fetch their actual avatarUrl/status.
            // Since it's WS broadcast, we will rely on what we have.
            items.push({
                id: `user:${u.id}`,
                type: 'user',
                name: u.username,
                subtext: 'Online',
                icon: (
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-primary font-semibold text-lg">
                            {u.username[0].toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-bg-secondary" />
                    </div>
                )
            });
        });

        return items;
    }, [currentRoom, roomMembers.length, onlineUsers, currentUser?.id]);

    // Apply search filter
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return chatItems;
        const q = searchQuery.toLowerCase();
        return chatItems.filter(item => item.name.toLowerCase().includes(q) || item.subtext.toLowerCase().includes(q));
    }, [chatItems, searchQuery]);

    return (
        <div className="h-full flex flex-col bg-bg-secondary border-r border-border">
            {/* Header & Search */}
            <div className="p-3 border-b border-border space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-text-primary tracking-tight">Chats</h2>
                    <button className="text-text-dim hover:text-text-primary transition-colors cursor-pointer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                    </button>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-dim">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search (⌘K)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-bg-input text-text-primary text-sm rounded-xl border-none focus:ring-1 focus:ring-text-dim transition-shadow placeholder-text-dim outline-none"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence>
                    {filteredItems.map(item => (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={item.id}
                            onClick={() => onSelectChat(item.id, item.name)}
                            className={`w-full flex items-center gap-3 p-3 transition-colors cursor-pointer text-left
                                ${activeChat === item.id ? 'bg-bg-hover' : 'hover:bg-bg-input'}
                            `}
                        >
                            {item.icon}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className={`text-base font-semibold truncate ${activeChat === item.id ? 'text-accent' : 'text-text-primary'}`}>
                                        {item.name}
                                    </h3>
                                </div>
                                <p className={`text-sm truncate ${activeChat === item.id ? 'text-text-primary' : 'text-text-dim'}`}>
                                    {item.subtext}
                                </p>
                            </div>
                        </motion.button>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="p-8 text-center text-text-dim text-sm">
                            No chats found matching "{searchQuery}"
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Profile Bar */}
            <div className="p-3 border-t border-border bg-bg-secondary">
                <button
                    onClick={onOpenProfile}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-xl bg-transparent
                      hover:bg-bg-hover transition-colors duration-200 cursor-pointer group"
                >
                    <div className="relative flex-shrink-0">
                        {userProfile.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-bg-primary">
                                {currentUser?.username[0]?.toUpperCase()}
                            </div>
                        )}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-bg-secondary
                          ${connected ? 'bg-success' : 'bg-error'}`} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-text-primary truncate">{currentUser?.username}</p>
                        <p className="text-xs text-text-dim truncate">{userProfile.status || 'Set status...'}</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="text-text-dim group-hover:text-text-primary transition-colors flex-shrink-0">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
}

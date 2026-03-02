import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

interface Props {
    activeChat: string | null;
    onSelectChat: (id: string, name: string) => void;
    onOpenProfile?: () => void;
}

// ─── New Group Modal ──────────────────────────────────────────────────────────
function NewGroupModal({ onClose, onSelectChat }: { onClose: () => void; onSelectChat: (id: string, name: string) => void }) {
    const [roomName, setRoomName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const name = roomName.trim().replace(/\s+/g, '-').toLowerCase();
        if (!name) return;
        onSelectChat(`room:${name}`, `#${name}`);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-full bg-bg-input flex items-center justify-center text-text-dim">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-text-primary">Create Group</h2>
                        <p className="text-xs text-text-dim">Enter a name for the group room</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        ref={inputRef}
                        value={roomName}
                        onChange={e => setRoomName(e.target.value)}
                        placeholder="e.g. design-team"
                        maxLength={30}
                        className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm placeholder-text-dim focus:border-text-muted outline-none transition-colors"
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-text-muted text-sm hover:bg-bg-hover transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" disabled={!roomName.trim()} className="flex-1 py-2.5 rounded-xl bg-accent text-bg-primary text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-40">
                            Create & Join
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ─── New Secret Chat Modal ────────────────────────────────────────────────────
function NewSecretChatModal({ onClose, onSelectChat }: { onClose: () => void; onSelectChat: (id: string, name: string) => void }) {
    const { onlineUsers, currentUser } = useChatContext();
    const others = onlineUsers.filter(u => u.id !== currentUser?.id);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm bg-bg-secondary border border-border rounded-2xl p-5 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-bg-input flex items-center justify-center text-text-dim">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-text-primary">New Secret Chat</h2>
                        <p className="text-xs text-text-dim">Choose someone to message privately</p>
                    </div>
                </div>

                {others.length === 0 ? (
                    <p className="text-center text-text-dim text-sm py-4">No other users online</p>
                ) : (
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        {others.map(u => (
                            <button
                                key={u.id}
                                onClick={() => { onSelectChat(`user:${u.id}`, u.username); onClose(); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-hover transition-colors cursor-pointer text-left"
                            >
                                <div className="relative flex-shrink-0">
                                    {u.avatarUrl ? (
                                        <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-primary font-semibold">
                                            {u.username[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-bg-secondary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{u.username}</p>
                                    <p className="text-xs text-text-dim truncate">{u.status || 'Online'}</p>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-dim flex-shrink-0">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                )}
                <button onClick={onClose} className="mt-4 w-full py-2 rounded-xl border border-border text-text-muted text-sm hover:bg-bg-hover cursor-pointer transition-colors">
                    Cancel
                </button>
            </motion.div>
        </motion.div>
    );
}

// ─── Compose menu items (no "New Channel") ────────────────────────────────────
const composeMenuItems = [
    {
        id: 'new-group',
        label: 'New Group',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        id: 'secret-chat',
        label: 'New Secret Chat',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
    },
];

export default function ChatsSidebar({ activeChat, onSelectChat, onOpenProfile }: Props) {
    const { onlineUsers, currentUser, userProfile, requestUsers, connected, currentRoom, roomMembers, setSelectedUserProfile } = useChatContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [showComposeMenu, setShowComposeMenu] = useState(false);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [showSecretChat, setShowSecretChat] = useState(false);
    const composeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (connected) requestUsers();
    }, [connected, requestUsers]);

    useEffect(() => {
        if (!showComposeMenu) return;
        const handleClick = (e: MouseEvent) => {
            if (composeRef.current && !composeRef.current.contains(e.target as Node)) {
                setShowComposeMenu(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowComposeMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [showComposeMenu]);

    const handleMenuAction = (id: string) => {
        setShowComposeMenu(false);
        if (id === 'new-group') setShowNewGroup(true);
        if (id === 'secret-chat') setShowSecretChat(true);
    };

    const chatItems = useMemo(() => {
        const items = [];

        items.push({
            id: 'global',
            type: 'global',
            name: 'Global Chat',
            subtext: 'Public channel',
            icon: (
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-bg-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
            )
        });

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

        const otherUsers = onlineUsers.filter(u => u.id !== currentUser?.id);
        otherUsers.forEach(u => {
            items.push({
                id: `user:${u.id}`,
                type: 'user',
                name: u.username,
                subtext: u.status || 'Online',
                icon: (
                    <div
                        className="relative z-10 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); setSelectedUserProfile(u.id); }}
                    >
                        {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-border" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-primary font-semibold text-lg">
                                {u.username[0]?.toUpperCase()}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-bg-secondary" />
                    </div>
                )
            });
        });

        return items;
    }, [currentRoom, roomMembers.length, onlineUsers, currentUser?.id]);

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

                    {/* Compose Button with Dropdown */}
                    <div className="relative" ref={composeRef}>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowComposeMenu(prev => !prev)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-text-dim hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
                            aria-label="New chat"
                            aria-expanded={showComposeMenu}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                        </motion.button>

                        <AnimatePresence>
                            {showComposeMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className="absolute right-0 top-10 z-50 w-52 bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                                    role="menu"
                                >
                                    {composeMenuItems.map((item, i) => (
                                        <motion.button
                                            key={item.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => handleMenuAction(item.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer text-left"
                                            role="menuitem"
                                        >
                                            <span className="text-text-dim">{item.icon}</span>
                                            {item.label}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-dim">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                </button>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showNewGroup && (
                    <NewGroupModal onClose={() => setShowNewGroup(false)} onSelectChat={onSelectChat} />
                )}
                {showSecretChat && (
                    <NewSecretChatModal onClose={() => setShowSecretChat(false)} onSelectChat={onSelectChat} />
                )}
            </AnimatePresence>
        </div>
    );
}

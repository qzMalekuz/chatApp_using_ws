import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

interface Props {
    open: boolean;
    onClose: () => void;
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function ProfileModal({ open, onClose }: Props) {
    const {
        currentUser, userProfile, connected, currentRoom, onlineUsers,
        setUsername, setUserStatus, setUserAvatar,
    } = useChatContext();

    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [editingStatus, setEditingStatus] = useState(false);
    const [statusInput, setStatusInput] = useState('');
    const [joinedAgo, setJoinedAgo] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Keep "joined ago" text updated
    useEffect(() => {
        if (!open) return;
        const update = () => setJoinedAgo(timeAgo(userProfile.joinedAt));
        update();
        const interval = setInterval(update, 30000);
        return () => clearInterval(interval);
    }, [open, userProfile.joinedAt]);

    const handleNameSave = () => {
        const trimmed = nameInput.trim();
        if (trimmed && trimmed.length <= 20 && /^[a-zA-Z0-9_]+$/.test(trimmed)) {
            setUsername(trimmed);
        }
        setEditingName(false);
    };

    const handleStatusSave = () => {
        setUserStatus(statusInput.trim().slice(0, 60));
        setEditingStatus(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setUserAvatar(url);
        }
    };

    if (!currentUser) return null;

    const initial = currentUser.username[0]?.toUpperCase() || '?';

    const stats = [
        { label: 'Messages', value: userProfile.messagesSent },
        { label: 'Room', value: currentRoom ? `#${currentRoom}` : 'None' },
        { label: 'Online', value: onlineUsers.length },
    ];

    const quickStatuses = ['🟢 Available', '🔴 Busy', '🌙 Away', '🎧 Listening', '💻 Coding'];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-sm bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Banner / Header gradient */}
                        <div className="h-24 bg-gradient-to-br from-[#2a2a3a] via-[#1e1e2e] to-[#2e2e3e] relative">
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center
                                  text-text-muted hover:text-text-primary hover:bg-black/50 transition-all cursor-pointer"
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>

                            {/* Connection badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 text-[10px] font-medium">
                                <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-success' : 'bg-error'}`} />
                                <span className={connected ? 'text-success' : 'text-error'}>
                                    {connected ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        {/* Avatar overlapping banner */}
                        <div className="px-6 -mt-12">
                            <div
                                className="relative w-20 h-20 group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {userProfile.avatarUrl ? (
                                    <img
                                        src={userProfile.avatarUrl}
                                        alt="avatar"
                                        className="w-20 h-20 rounded-full object-cover border-4 border-bg-secondary"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full border-4 border-bg-secondary bg-gradient-to-br from-[#3a3a4a] to-[#2a2a3a]
                                      flex items-center justify-center text-2xl font-bold text-text-primary">
                                        {initial}
                                    </div>
                                )}
                                {/* Hover overlay */}
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center
                                  opacity-0 group-hover:opacity-100 transition-opacity border-4 border-transparent">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-3 space-y-5">
                            {/* Username */}
                            <div>
                                {editingName ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            autoFocus
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditingName(false); }}
                                            maxLength={20}
                                            className="flex-1 px-3 py-1.5 rounded-lg bg-bg-input border border-border text-text-primary
                                              text-sm focus:border-text-muted transition-colors"
                                        />
                                        <button onClick={handleNameSave} className="text-xs text-success hover:underline cursor-pointer">Save</button>
                                        <button onClick={() => setEditingName(false)} className="text-xs text-text-dim hover:underline cursor-pointer">Cancel</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-semibold text-text-primary">{currentUser.username}</h2>
                                        <button
                                            onClick={() => { setNameInput(currentUser.username); setEditingName(true); }}
                                            className="text-text-dim hover:text-text-muted transition-colors cursor-pointer"
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                <p className="text-text-dim text-xs mt-0.5">ID: {currentUser.id}</p>
                            </div>

                            {/* Status */}
                            <div>
                                <p className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-1.5">Status</p>
                                {editingStatus ? (
                                    <div className="space-y-2">
                                        <input
                                            autoFocus
                                            value={statusInput}
                                            onChange={(e) => setStatusInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleStatusSave(); if (e.key === 'Escape') setEditingStatus(false); }}
                                            maxLength={60}
                                            placeholder="What's on your mind?"
                                            className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-text-primary
                                              text-sm placeholder-text-dim focus:border-text-muted transition-colors"
                                        />
                                        <div className="flex flex-wrap gap-1.5">
                                            {quickStatuses.map(qs => (
                                                <button
                                                    key={qs}
                                                    onClick={() => { setStatusInput(qs); }}
                                                    className="px-2 py-1 rounded-md bg-bg-hover text-[11px] text-text-muted
                                                      hover:bg-bg-card hover:text-text-primary transition-colors cursor-pointer"
                                                >
                                                    {qs}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={handleStatusSave} className="text-xs text-success hover:underline cursor-pointer">Save</button>
                                            <button onClick={() => setEditingStatus(false)} className="text-xs text-text-dim hover:underline cursor-pointer">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setStatusInput(userProfile.status); setEditingStatus(true); }}
                                        className="w-full text-left px-3 py-2 rounded-lg bg-bg-card border border-border
                                          text-sm hover:border-text-dim transition-colors cursor-pointer group"
                                    >
                                        {userProfile.status ? (
                                            <span className="text-text-muted">{userProfile.status}</span>
                                        ) : (
                                            <span className="text-text-dim italic">Set a status...</span>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2">
                                {stats.map(s => (
                                    <div key={s.label} className="bg-bg-card rounded-xl p-3 text-center border border-border">
                                        <p className="text-sm font-semibold text-text-primary">{s.value}</p>
                                        <p className="text-[10px] text-text-dim uppercase tracking-wider mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Info rows */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-card border border-border">
                                    <div className="flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-dim">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span className="text-xs text-text-muted">Joined</span>
                                    </div>
                                    <span className="text-xs text-text-primary font-medium">{joinedAgo}</span>
                                </div>
                                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-card border border-border">
                                    <div className="flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-dim">
                                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                            <path d="M16 3.13a4 4 0 010 7.75" />
                                        </svg>
                                        <span className="text-xs text-text-muted">Current Room</span>
                                    </div>
                                    <span className="text-xs text-text-primary font-medium">
                                        {currentRoom ? `#${currentRoom}` : 'Global Chat'}
                                    </span>
                                </div>
                            </div>

                            {/* Remove avatar button */}
                            {userProfile.avatarUrl && (
                                <button
                                    onClick={() => setUserAvatar(null)}
                                    className="w-full py-2 rounded-lg text-error/70 text-xs font-medium
                                      hover:bg-error/5 transition-colors cursor-pointer"
                                >
                                    Remove Profile Picture
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

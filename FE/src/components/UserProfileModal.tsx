import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

export default function UserProfileModal() {
    const { selectedUserIdForProfile, setSelectedUserProfile, onlineUsers, toggleMute, mutedChats } = useChatContext();

    if (selectedUserIdForProfile === null) return null;

    const user = onlineUsers.find(u => u.id === selectedUserIdForProfile);

    // If the user disconnected while viewing
    if (!user) {
        setSelectedUserProfile(null);
        return null;
    }

    const isMuted = mutedChats.includes(`user:${user.id}`);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUserProfile(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm mx-4 bg-bg-card rounded-3xl overflow-hidden shadow-2xl border border-border"
                >
                    {/* Header Banner */}
                    <div className="h-28 bg-gradient-to-r from-bg-secondary to-bg-hover relative">
                        <button
                            onClick={() => setSelectedUserProfile(null)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-text-primary hover:bg-black/40 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <div className="px-6 -mt-12 pb-6">
                        <div className="flex justify-between items-end mb-4">
                            {/* Avatar */}
                            <div className="relative">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-bg-card" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full border-4 border-bg-card bg-bg-secondary flex items-center justify-center text-4xl font-bold text-text-primary">
                                        {user.username[0]?.toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-success rounded-full border-[3px] border-bg-card" />
                            </div>

                            {/* Actions */}
                            <button
                                onClick={() => toggleMute(`user:${user.id}`)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors mb-2
                                  ${isMuted ? 'bg-bg-hover text-accent' : 'bg-bg-input text-text-primary hover:bg-bg-hover'}`}
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                )}
                            </button>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">{user.username}</h2>
                            <p className="text-sm text-success mt-0.5">Online</p>
                        </div>

                        {/* Status Section */}
                        <div className="mt-6 space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Bio / Status</h3>
                            <div className="p-4 rounded-xl bg-bg-input">
                                <p className="text-sm text-text-primary whitespace-pre-wrap break-words">
                                    {user.status || 'This user has not set a status yet.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

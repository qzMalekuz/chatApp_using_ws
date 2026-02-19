import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

interface Props {
    onRoomChange: (room: string | null) => void;
}

export default function RoomPanel({ onRoomChange }: Props) {
    const { currentRoom, roomMembers, joinRoom, leaveRoom, requestRoomMembers } = useChatContext();
    const [roomInput, setRoomInput] = useState('');

    const handleJoin = () => {
        const room = roomInput.trim();
        if (!room) return;
        joinRoom(room);
        onRoomChange(room);
        setRoomInput('');
        setTimeout(() => requestRoomMembers(room), 300);
    };

    const handleLeave = () => {
        leaveRoom();
        onRoomChange(null);
    };

    return (
        <div className="h-full flex flex-col bg-bg-secondary border-l border-border">
            {/* Header */}
            <div className="p-5 border-b border-border">
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.15em]">Rooms</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Join input */}
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            placeholder="Room name"
                            className="flex-1 px-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                placeholder-text-dim text-sm focus:border-accent/50 focus:ring-2 focus:ring-accent-glow
                transition-all duration-300"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(124, 58, 237, 0.25)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleJoin}
                        className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm
              font-semibold transition-all duration-300 cursor-pointer shadow-lg shadow-accent/20"
                    >
                        Join Room
                    </motion.button>
                </div>

                {/* Current room */}
                <AnimatePresence mode="wait">
                    {currentRoom && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.97 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
                                {/* Room header */}
                                <div className="p-4 border-b border-border flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-text-dim uppercase tracking-wider font-bold">Current Room</p>
                                        <p className="text-base font-bold text-accent mt-0.5">#{currentRoom}</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLeave}
                                        className="px-4 py-2 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold
                      hover:bg-error/20 transition-all duration-200 cursor-pointer"
                                    >
                                        Leave
                                    </motion.button>
                                </div>

                                {/* Members */}
                                <div className="p-4">
                                    <p className="text-[10px] text-text-dim uppercase tracking-wider font-bold mb-3">
                                        Members
                                        <span className="ml-2 px-1.5 py-0.5 rounded-md bg-accent/15 text-accent text-[10px]">
                                            {roomMembers.length}
                                        </span>
                                    </p>
                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                        {roomMembers.map(m => (
                                            <motion.div
                                                key={m.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-hover transition-all duration-150"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                                                    {m.username[0].toUpperCase()}
                                                </div>
                                                <span className="text-xs text-text-primary font-medium">{m.username}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!currentRoom && (
                    <div className="text-center py-8">
                        <p className="text-3xl mb-2">🏠</p>
                        <p className="text-text-dim text-xs">Join a room to start</p>
                    </div>
                )}
            </div>
        </div>
    );
}

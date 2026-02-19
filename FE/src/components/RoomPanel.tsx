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
        <div className="h-full flex flex-col bg-bg-secondary/80 backdrop-blur-md border-l border-border">
            <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Rooms</h2>
            </div>

            <div className="p-4 space-y-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        placeholder="Room name..."
                        className="flex-1 px-3 py-2 rounded-lg bg-bg-input border border-border text-text-primary
              placeholder-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-accent/50
              transition-all duration-200"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleJoin}
                        className="px-3 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm
              font-medium transition-colors duration-200 cursor-pointer"
                    >
                        Join
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    {currentRoom && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-bg-card rounded-xl p-4 border border-border space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-text-muted">Current Room</p>
                                        <p className="text-sm font-semibold text-accent">#{currentRoom}</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLeave}
                                        className="px-3 py-1.5 rounded-lg bg-error/20 text-error text-xs font-medium
                      hover:bg-error/30 transition-colors duration-200 cursor-pointer"
                                    >
                                        Leave
                                    </motion.button>
                                </div>

                                <div>
                                    <p className="text-xs text-text-muted mb-2">Members ({roomMembers.length})</p>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {roomMembers.map(m => (
                                            <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-hover transition-colors">
                                                <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center text-[10px] font-semibold">
                                                    {m.username[0].toUpperCase()}
                                                </div>
                                                <span className="text-xs text-text-primary">{m.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

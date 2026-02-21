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
            <div className="p-4 border-b border-border">
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Rooms</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center gap-0 rounded-xl bg-bg-input border border-border overflow-hidden
                  focus-within:border-text-dim transition-colors duration-200">
                    <input
                        type="text"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        placeholder="Room name"
                        className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-text-primary
              placeholder-text-dim text-sm border-none"
                    />
                    <button
                        onClick={handleJoin}
                        className="flex-shrink-0 px-4 py-2.5 m-1 rounded-lg bg-accent text-bg-primary text-xs font-semibold
              uppercase tracking-wider hover:bg-accent-hover active:scale-95
              transition-all duration-200 cursor-pointer"
                    >
                        Join
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {currentRoom && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="bg-bg-card rounded-xl border border-border p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-text-dim uppercase tracking-wider font-semibold">Current</p>
                                    <p className="text-sm font-semibold text-text-primary">#{currentRoom}</p>
                                </div>
                                <button
                                    onClick={handleLeave}
                                    className="px-3 py-1.5 rounded-lg text-error text-xs font-medium border border-error/20
                    hover:bg-error/10 transition-colors duration-200 cursor-pointer"
                                >
                                    Leave
                                </button>
                            </div>

                            <div>
                                <p className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-2">
                                    Members ({roomMembers.length})
                                </p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {roomMembers.map(m => (
                                        <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-hover transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-bg-hover flex items-center justify-center text-[10px] font-semibold text-text-muted">
                                                {m.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-xs text-text-primary">{m.username}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!currentRoom && (
                    <p className="text-text-dim text-xs text-center py-8">Join a room to start</p>
                )}
            </div>
        </div>
    );
}

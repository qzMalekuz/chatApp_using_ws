import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';
import type { ChatMessage } from '../types';
import { timeAgo } from '../utils/timeAgo';

interface Props {
    chatMode: 'global' | 'room' | 'private';
    privateChatUserId: number | null;
}

export default function ChatArea({ chatMode, privateChatUserId }: Props) {
    const {
        globalMessages, roomMessages, privateMessages, currentRoom,
        currentUser, sendChat, sendRoomChat, sendPrivateChat,
        sendTypingStart, sendTypingStop, typingUsers, onlineUsers,
    } = useChatContext();

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);

    let messages: ChatMessage[] = [];
    let title = 'Global Chat';

    if (chatMode === 'room' && currentRoom) {
        messages = roomMessages[currentRoom] || [];
        title = `# ${currentRoom}`;
    } else if (chatMode === 'private' && privateChatUserId) {
        messages = privateMessages[privateChatUserId] || [];
        const partner = onlineUsers.find(u => u.id === privateChatUserId);
        title = `DM — ${partner?.username || 'User'}`;
    } else {
        messages = globalMessages;
    }

    const scrollToBottom = useCallback(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        if (isNearBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);

    const handleTyping = () => {
        if (chatMode !== 'room') return;
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            sendTypingStart();
        }
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            isTypingRef.current = false;
            sendTypingStop();
        }, 1500);
    };

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;

        if (chatMode === 'room' && currentRoom) sendRoomChat(text);
        else if (chatMode === 'private' && privateChatUserId) sendPrivateChat(privateChatUserId, text);
        else sendChat(text);

        setInput('');
        if (isTypingRef.current) {
            isTypingRef.current = false;
            sendTypingStop();
        }
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const activeTyping = chatMode === 'room' && currentRoom ? (typingUsers[currentRoom] || []) : [];

    return (
        <div className="h-full flex flex-col bg-bg-primary">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-bg-secondary/50 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scroll-smooth">
                <AnimatePresence initial={false}>
                    {messages.map(msg => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                        >
                            {msg.type === 'SYSTEM' || msg.type === 'ROOM_NOTIFICATION' ? (
                                <div className="text-text-dim text-xs text-center w-full py-1">
                                    {msg.text}
                                </div>
                            ) : (
                                <>
                                    {!msg.isSelf && (
                                        <span className="text-xs text-text-muted mb-1 ml-1">{msg.username}</span>
                                    )}
                                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                    ${msg.isSelf
                                            ? 'bg-self-bubble text-text-primary rounded-br-md'
                                            : 'bg-other-bubble text-text-primary rounded-bl-md'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-text-dim mt-1 mx-1">
                                        {timeAgo(msg.timestamp)}
                                    </span>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {activeTyping.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-text-muted text-xs"
                    >
                        <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 bg-accent rounded-full"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                />
                            ))}
                        </div>
                        <span>{activeTyping.join(', ')} typing...</span>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-border bg-bg-secondary/50 backdrop-blur-sm">
                <div className="flex gap-3 items-end">
                    <textarea
                        value={input}
                        onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 px-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
              placeholder-text-dim resize-none focus:outline-none focus:ring-2 focus:ring-accent/50
              transition-all duration-200 text-sm"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium
              text-sm transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Send
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

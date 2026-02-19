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
    let title = '💬 Global Chat';
    let subtitle = 'Everyone can see these messages';

    if (chatMode === 'room' && currentRoom) {
        messages = roomMessages[currentRoom] || [];
        title = `# ${currentRoom}`;
        subtitle = 'Room messages';
    } else if (chatMode === 'private' && privateChatUserId) {
        messages = privateMessages[privateChatUserId] || [];
        const partner = onlineUsers.find(u => u.id === privateChatUserId);
        title = `💌 ${partner?.username || 'User'}`;
        subtitle = 'Private conversation';
    } else {
        messages = globalMessages;
    }

    const scrollToBottom = useCallback(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
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
        if (isTypingRef.current) { isTypingRef.current = false; sendTypingStop(); }
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const activeTyping = chatMode === 'room' && currentRoom ? (typingUsers[currentRoom] || []) : [];

    return (
        <div className="h-full flex flex-col bg-bg-primary">
            {/* Header */}
            <div className="px-7 py-5 border-b border-border bg-bg-secondary/60 backdrop-blur-md">
                <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                <p className="text-xs text-text-dim mt-0.5">{subtitle}</p>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-4xl mb-3">✨</p>
                        <p className="text-text-dim text-sm">No messages yet. Say something!</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map(msg => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                            className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                        >
                            {msg.type === 'SYSTEM' || msg.type === 'ROOM_NOTIFICATION' ? (
                                <div className="w-full flex items-center gap-3 py-2">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-text-dim text-[11px] font-medium whitespace-nowrap">{msg.text}</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>
                            ) : (
                                <div className={`max-w-[75%] ${msg.isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
                                    {!msg.isSelf && (
                                        <span className="text-[11px] text-text-muted font-semibold mb-1.5 ml-3">{msg.username}</span>
                                    )}
                                    <div className={`px-5 py-3 text-sm leading-relaxed break-words
                    ${msg.isSelf
                                            ? 'bg-self-bubble text-white rounded-3xl rounded-br-lg shadow-lg shadow-accent/10'
                                            : 'bg-other-bubble text-text-primary rounded-3xl rounded-bl-lg border border-border'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-text-dim mt-1.5 mx-3 font-medium">
                                        {timeAgo(msg.timestamp)}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                    {activeTyping.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="flex items-center gap-3 px-3"
                        >
                            <div className="flex gap-1 bg-other-bubble border border-border px-4 py-2.5 rounded-2xl">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 bg-accent rounded-full"
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                                    />
                                ))}
                            </div>
                            <span className="text-text-dim text-xs font-medium">{activeTyping.join(', ')} typing</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-border bg-bg-secondary/60 backdrop-blur-md">
                <div className="flex gap-3 items-end bg-bg-input border border-border rounded-2xl px-4 py-2
          focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent-glow transition-all duration-300">
                    <textarea
                        value={input}
                        onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 py-2 bg-transparent text-text-primary placeholder-text-dim
              resize-none text-sm leading-relaxed border-none outline-none"
                    />
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white
              transition-all duration-200 cursor-pointer
              ${input.trim()
                                ? 'bg-accent shadow-lg shadow-accent/30 hover:shadow-accent/50'
                                : 'bg-bg-hover text-text-dim cursor-not-allowed'
                            }`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

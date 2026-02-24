import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';
import type { ChatMessage } from '../types';

interface Props {
    chatMode: 'global' | 'room' | 'private';
    privateChatUserId: number | null;
    onBack?: () => void;
}

export default function ChatArea({ chatMode, privateChatUserId, onBack }: Props) {
    const {
        globalMessages, roomMessages, privateMessages, currentRoom,
        sendChat, sendRoomChat, sendPrivateChat,
        sendTypingStart, sendTypingStop, typingUsers, onlineUsers,
        mutedChats, toggleMute, setSelectedUserProfile
    } = useChatContext();

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);

    let messages: ChatMessage[] = [];
    let title = 'Global Chat';
    let currentChatId = 'global';

    if (chatMode === 'room' && currentRoom) {
        messages = roomMessages[currentRoom] || [];
        title = `# ${currentRoom}`;
        currentChatId = `room:${currentRoom}`;
    } else if (chatMode === 'private' && privateChatUserId) {
        messages = privateMessages[privateChatUserId] || [];
        const partner = onlineUsers.find(u => u.id === privateChatUserId);
        title = partner?.username || 'Direct Message';
        currentChatId = `user:${privateChatUserId}`;
    } else {
        messages = globalMessages;
    }

    const isMuted = mutedChats.includes(currentChatId);

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
            <div className="px-6 py-3 border-b border-border bg-bg-secondary flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center -ml-2 text-text-dim hover:text-text-primary hover:bg-bg-input transition-colors shrink-0"
                            aria-label="Back to chat list"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        </button>
                    )}
                    <h2 className="text-base font-semibold text-text-primary tracking-tight truncate max-w-[150px] xs:max-w-xs">{title}</h2>
                    {isMuted && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted shrink-0">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                    )}
                </div>

                <button
                    onClick={() => toggleMute(currentChatId)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer
                      ${isMuted ? 'text-accent bg-bg-hover' : 'text-text-dim hover:text-text-primary hover:bg-bg-input'}`}
                    title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
                >
                    {isMuted ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    )}
                </button>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messages.length === 0 && (
                    <p className="text-text-dim text-sm text-center py-12">No messages yet</p>
                )}

                <AnimatePresence initial={false}>
                    {messages.map(msg => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                        >
                            {msg.type === 'SYSTEM' || msg.type === 'ROOM_NOTIFICATION' ? (
                                <p className="text-text-dim text-xs text-center w-full py-1">{msg.text}</p>
                            ) : (
                                <div className={`max-w-[70%]`}>
                                    {!msg.isSelf && (
                                        <div
                                            className="flex items-center gap-2 mb-1 pl-1 cursor-pointer hover:opacity-80 transition-opacity w-fit"
                                            onClick={() => setSelectedUserProfile(msg.userId)}
                                        >
                                            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-bg-primary flex-shrink-0">
                                                {msg.username[0]?.toUpperCase()}
                                            </div>
                                            <span className="text-xs font-medium text-text-primary">{msg.username}</span>
                                        </div>
                                    )}
                                    <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed break-words shadow-sm relative
                    ${msg.isSelf
                                            ? 'bg-self-bubble text-text-primary rounded-br-[4px]'
                                            : 'bg-other-bubble text-text-primary rounded-bl-[4px] border border-border'
                                        }`}>
                                        {msg.text}
                                        <div className={`flex justify-end items-center gap-1 mt-1 -mb-1 ${msg.isSelf ? 'text-text-muted/70' : 'text-text-dim'}`}>
                                            <span className="text-[10.5px]">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

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
                                    className="w-1.5 h-1.5 bg-text-muted rounded-full"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                                />
                            ))}
                        </div>
                        <span>{activeTyping.join(', ')} typing</span>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 bg-bg-secondary border-t border-border">
                <div className="flex gap-3 items-end max-w-4xl mx-auto">
                    <button className="p-2.5 text-text-dim hover:text-text-primary transition-colors cursor-pointer rounded-full hover:bg-bg-hover">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                    <div className="flex-1 relative bg-bg-input rounded-2xl border border-transparent focus-within:border-text-dim transition-colors shadow-inner">
                        <textarea
                            value={input}
                            onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Message..."
                            rows={1}
                            style={{ minHeight: '44px', paddingRight: '48px' }}
                            className="w-full px-4 pt-[11px] bg-transparent text-text-primary
                  placeholder-text-dim resize-none text-[15px] outline-none"
                        />
                        <button className="absolute right-2 bottom-1.5 p-2 text-text-dim hover:text-text-primary transition-colors cursor-pointer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                        </button>
                    </div>
                    {input.trim() ? (
                        <button
                            onClick={handleSend}
                            className="p-3.5 rounded-full bg-accent text-bg-primary shadow-lg hover:shadow-xl hover:bg-accent-hover transition-all cursor-pointer active:scale-95"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    ) : (
                        <button className="p-3.5 rounded-full bg-bg-card text-text-dim hover:text-text-primary border border-border transition-colors cursor-pointer">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

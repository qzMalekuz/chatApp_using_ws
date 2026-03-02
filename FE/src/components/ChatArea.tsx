import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';
import type { ChatMessage } from '../types';

interface Props {
    chatMode: 'global' | 'room' | 'private';
    privateChatUserId: number | null;
    onBack?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const EMOJI_LIST = [
    '😀', '😂', '😍', '🥰', '😎', '🤔', '😅', '🙄', '😭', '😤',
    '🥳', '😴', '🤯', '😇', '🤩', '😬', '🤗', '😏', '🥺', '😱',
    '👍', '👎', '👏', '🙌', '🤝', '🫶', '❤️', '🔥', '✨', '💯',
    '🎉', '🎊', '🍕', '🍔', '☕', '🚀', '🌈', '⭐', '💪', '🧠',
];

function formatDuration(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Poll Modal ───────────────────────────────────────────────────────────────
function PollModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (q: string, opts: string[]) => void }) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    const addOption = () => setOptions(prev => [...prev, '']);
    const updateOption = (i: number, v: string) => setOptions(prev => prev.map((o, idx) => idx === i ? v : o));
    const removeOption = (i: number) => setOptions(prev => prev.filter((_, idx) => idx !== i));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validOpts = options.map(o => o.trim()).filter(Boolean);
        if (!question.trim() || validOpts.length < 2) return;
        onSubmit(question.trim(), validOpts);
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
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl"
            >
                <h2 className="text-base font-semibold text-text-primary mb-4">Create a Poll</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        autoFocus
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm placeholder-text-dim focus:border-text-muted outline-none"
                    />
                    <div className="space-y-2">
                        <p className="text-[10px] text-text-dim uppercase tracking-wider font-semibold">Options</p>
                        {options.map((opt, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    value={opt}
                                    onChange={e => updateOption(i, e.target.value)}
                                    placeholder={`Option ${i + 1}`}
                                    className="flex-1 px-3 py-2 rounded-xl bg-bg-input border border-border text-text-primary text-sm placeholder-text-dim focus:border-text-muted outline-none"
                                />
                                {options.length > 2 && (
                                    <button type="button" onClick={() => removeOption(i)} className="text-error/60 hover:text-error cursor-pointer transition-colors text-xs px-2">✕</button>
                                )}
                            </div>
                        ))}
                        {options.length < 6 && (
                            <button type="button" onClick={addOption} className="text-xs text-text-muted hover:text-text-primary cursor-pointer transition-colors">+ Add option</button>
                        )}
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-text-muted text-sm hover:bg-bg-hover cursor-pointer transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-accent text-bg-primary text-sm font-semibold hover:bg-accent-hover cursor-pointer transition-colors">
                            Post Poll
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ─── Rich message renderers ───────────────────────────────────────────────────
function AudioMessage({ url }: { url: string }) {
    return (
        <div className="flex items-center gap-2 bg-bg-input rounded-xl px-3 py-2 min-w-[200px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error flex-shrink-0">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
            <audio src={url} controls className="flex-1 h-7" style={{ minWidth: 0 }} />
        </div>
    );
}

function ImageMessage({ url }: { url: string }) {
    return (
        <a href={url} target="_blank" rel="noreferrer">
            <img src={url} alt="shared" className="max-w-[220px] max-h-[220px] rounded-xl object-cover border border-border cursor-pointer hover:opacity-90 transition-opacity" />
        </a>
    );
}

function VideoMessage({ url }: { url: string }) {
    return <video src={url} controls className="max-w-[220px] rounded-xl border border-border" />;
}

function FileMessage({ name, size }: { name: string; size: string }) {
    return (
        <div className="flex items-center gap-3 bg-bg-input rounded-xl px-3 py-2.5 min-w-[160px]">
            <div className="w-9 h-9 rounded-lg bg-bg-hover flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" />
                </svg>
            </div>
            <div className="min-w-0">
                <p className="text-sm text-text-primary font-medium truncate max-w-[140px]">{name}</p>
                <p className="text-[11px] text-text-dim">{size}</p>
            </div>
        </div>
    );
}

function PollMessage({ data, isSelf }: { data: NonNullable<ChatMessage['pollData']>; isSelf: boolean }) {
    const [votes, setVotes] = useState<number[]>(data.votes || data.options.map(() => 0));
    const [voted, setVoted] = useState<number | null>(null);
    const total = votes.reduce((a, b) => a + b, 0);

    const handleVote = (i: number) => {
        if (voted !== null) return;
        const newVotes = [...votes];
        newVotes[i]++;
        setVotes(newVotes);
        setVoted(i);
    };

    return (
        <div className={`rounded-2xl p-4 space-y-3 min-w-[220px] border border-border ${isSelf ? 'bg-self-bubble' : 'bg-other-bubble'}`}>
            <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span className="text-[10px] text-text-dim uppercase tracking-wider font-semibold">Poll</span>
            </div>
            <p className="text-sm font-semibold text-text-primary leading-snug">{data.question}</p>
            <div className="space-y-1.5">
                {data.options.map((opt, i) => {
                    const pct = total > 0 ? Math.round((votes[i] / total) * 100) : 0;
                    return (
                        <motion.button
                            key={i}
                            disabled={voted !== null}
                            onClick={() => handleVote(i)}
                            whileHover={voted === null ? { scale: 1.01 } : undefined}
                            whileTap={voted === null ? { scale: 0.99 } : undefined}
                            className={`w-full text-left rounded-lg overflow-hidden relative cursor-pointer disabled:cursor-default transition-colors
                                ${voted === i ? 'ring-1 ring-accent/50' : ''}`}
                        >
                            {/* progress bar */}
                            <div
                                className="absolute inset-0 bg-accent/10 rounded-lg transition-all duration-500"
                                style={{ width: voted !== null ? `${pct}%` : '0%' }}
                            />
                            <div className="relative flex items-center justify-between px-3 py-2">
                                <span className="text-[13px] text-text-primary">{opt}</span>
                                {voted !== null && <span className="text-[11px] text-text-muted font-medium">{pct}%</span>}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
            <p className="text-[10px] text-text-dim">{total} vote{total !== 1 ? 's' : ''}</p>
        </div>
    );
}

function LocationMessage({ lat, lng }: { lat: number; lng: number }) {
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    return (
        <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 bg-bg-input rounded-xl px-4 py-3 hover:bg-bg-hover transition-colors min-w-[180px]"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error flex-shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <div>
                <p className="text-sm text-text-primary font-medium">Location</p>
                <p className="text-[11px] text-text-dim">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
            </div>
        </a>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatArea({ chatMode, privateChatUserId, onBack }: Props) {
    const {
        globalMessages, roomMessages, privateMessages, currentRoom,
        sendChat, sendRoomChat, sendPrivateChat,
        sendTypingStart, sendTypingStop, typingUsers, onlineUsers,
        mutedChats, toggleMute, setSelectedUserProfile, addLocalMessage,
        currentUser,
    } = useChatContext();

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // attachment popup
    const [showAttachment, setShowAttachment] = useState(false);
    const attachmentRef = useRef<HTMLDivElement>(null);
    // file inputs
    const photoInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    // pending file for inline preview before send
    const [pendingMedia, setPendingMedia] = useState<{ type: 'image' | 'video' | 'file'; url: string; name: string; size: string } | null>(null);

    // emoji picker
    const [showEmoji, setShowEmoji] = useState(false);
    const emojiRef = useRef<HTMLDivElement>(null);

    // voice recording
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // poll modal
    const [showPoll, setShowPoll] = useState(false);

    // Derived messages & IDs
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
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 150) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);

    // Close popups on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (attachmentRef.current && !attachmentRef.current.contains(e.target as Node)) setShowAttachment(false);
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleTyping = () => {
        if (chatMode !== 'room') return;
        if (!isTypingRef.current) { isTypingRef.current = true; sendTypingStart(); }
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => { isTypingRef.current = false; sendTypingStop(); }, 1500);
    };

    // Helper to build a local-optimistic message
    const makeLocal = useCallback((overrides: Partial<ChatMessage>): ChatMessage => ({
        id: `local-${Date.now()}-${Math.random()}`,
        type: 'CHAT',
        userId: currentUser?.id ?? 0,
        username: currentUser?.username ?? 'You',
        text: '',
        timestamp: new Date().toISOString(),
        isSelf: true,
        ...overrides,
    }), [currentUser]);

    const handleSend = useCallback(() => {
        // ── Voice message ─────────────────────────────────────────────────────
        if (audioUrl && audioBlob) {
            addLocalMessage(currentChatId, makeLocal({ audioUrl, text: '[🎤 Voice message]' }));
            // Send a text placeholder so other users know a voice msg was sent
            const placeholder = '🎤 Voice message';
            if (chatMode === 'room' && currentRoom) sendRoomChat(placeholder);
            else if (chatMode === 'private' && privateChatUserId) sendPrivateChat(privateChatUserId, placeholder);
            else sendChat(placeholder);
            setAudioUrl(null);
            setAudioBlob(null);
            setRecordingSeconds(0);
            return;
        }

        // ── Pending file / image / video ──────────────────────────────────────
        if (pendingMedia) {
            const msg = pendingMedia.type === 'image'
                ? makeLocal({ imageUrl: pendingMedia.url, text: `📷 ${pendingMedia.name}` })
                : pendingMedia.type === 'video'
                    ? makeLocal({ videoUrl: pendingMedia.url, text: `🎬 ${pendingMedia.name}` })
                    : makeLocal({ fileInfo: { name: pendingMedia.name, size: pendingMedia.size }, text: `📎 ${pendingMedia.name}` });
            addLocalMessage(currentChatId, msg);
            const placeholder = pendingMedia.type === 'image' ? `📷 Photo` : pendingMedia.type === 'video' ? `🎬 Video` : `📎 ${pendingMedia.name}`;
            if (chatMode === 'room' && currentRoom) sendRoomChat(placeholder);
            else if (chatMode === 'private' && privateChatUserId) sendPrivateChat(privateChatUserId, placeholder);
            else sendChat(placeholder);
            setPendingMedia(null);
            return;
        }

        // ── Plain text ────────────────────────────────────────────────────────
        const text = input.trim();
        if (!text) return;
        if (chatMode === 'room' && currentRoom) sendRoomChat(text);
        else if (chatMode === 'private' && privateChatUserId) sendPrivateChat(privateChatUserId, text);
        else sendChat(text);
        setInput('');
        if (isTypingRef.current) { isTypingRef.current = false; sendTypingStop(); }
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, [audioUrl, audioBlob, pendingMedia, input, chatMode, currentRoom, privateChatUserId, currentChatId, sendChat, sendRoomChat, sendPrivateChat, sendTypingStop, makeLocal, addLocalMessage]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    // ── Emoji ──────────────────────────────────────────────────────────────────
    const insertEmoji = (emoji: string) => {
        const ta = inputRef.current;
        if (!ta) { setInput(prev => prev + emoji); return; }
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const nv = input.slice(0, start) + emoji + input.slice(end);
        setInput(nv);
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
    };

    // ── File handler ───────────────────────────────────────────────────────────
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, kind: 'media' | 'file') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const size = formatBytes(file.size);
        if (kind === 'media') {
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            setPendingMedia({ type, url, name: file.name, size });
        } else {
            setPendingMedia({ type: 'file', url, name: file.name, size });
        }
        setShowAttachment(false);
        e.target.value = '';
    };

    // ── Location ───────────────────────────────────────────────────────────────
    const shareLocation = () => {
        setShowAttachment(false);
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude: lat, longitude: lng } = pos.coords;
            addLocalMessage(currentChatId, makeLocal({ locationData: { lat, lng }, text: `📍 Location (${lat.toFixed(4)}, ${lng.toFixed(4)})` }));
            const txt = `📍 Location: https://www.google.com/maps?q=${lat},${lng}`;
            if (chatMode === 'room' && currentRoom) sendRoomChat(txt);
            else if (chatMode === 'private' && privateChatUserId) sendPrivateChat(privateChatUserId, txt);
            else sendChat(txt);
        }, () => {
            // permission denied — silently ignore
        });
    };

    // ── Poll ───────────────────────────────────────────────────────────────────
    const handlePollSubmit = (question: string, options: string[]) => {
        const pollData = { question, options, votes: options.map(() => 0) };
        addLocalMessage(currentChatId, makeLocal({ pollData, text: `📊 Poll: ${question}` }));
        const txt = `📊 Poll: "${question}" — Options: ${options.join(' | ')}`;
        if (chatMode === 'room' && currentRoom) sendRoomChat(txt);
        else if (chatMode === 'private' && privateChatUserId) sendPrivateChat(privateChatUserId, txt);
        else sendChat(txt);
    };

    // ── Voice recording ────────────────────────────────────────────────────────
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];
            recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(t => t.stop());
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordingSeconds(0);
            recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
        } catch { /* mic denied */ }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };

    const discardAudio = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null); setAudioBlob(null); setRecordingSeconds(0);
    };

    const discardMedia = () => {
        if (pendingMedia?.url) URL.revokeObjectURL(pendingMedia.url);
        setPendingMedia(null);
    };

    const activeTyping = chatMode === 'room' && currentRoom ? (typingUsers[currentRoom] || []) : [];
    const hasSomethingToSend = input.trim() || audioUrl || pendingMedia;

    const ATTACHMENT_OPTIONS = [
        { id: 'photo', label: 'Photo or Video', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>, action: () => photoInputRef.current?.click() },
        { id: 'file', label: 'File', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>, action: () => fileInputRef.current?.click() },
        { id: 'camera', label: 'Camera', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>, action: () => cameraInputRef.current?.click() },
        { id: 'poll', label: 'Poll', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>, action: () => { setShowAttachment(false); setShowPoll(true); } },
        { id: 'location', label: 'Location', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, action: shareLocation },
    ];

    return (
        <div className="h-full flex flex-col bg-bg-primary">
            {/* Hidden file inputs */}
            <input ref={photoInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => handleFileSelected(e, 'media')} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={e => handleFileSelected(e, 'file')} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFileSelected(e, 'media')} />

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="px-6 py-3 border-b border-border bg-bg-secondary flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="md:hidden w-8 h-8 rounded-full flex items-center justify-center -ml-2 text-text-dim hover:text-text-primary hover:bg-bg-input transition-colors shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                        </button>
                    )}
                    <h2 className="text-base font-semibold text-text-primary tracking-tight truncate max-w-[150px] xs:max-w-xs">{title}</h2>
                    {isMuted && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                    )}
                </div>
                <button
                    onClick={() => toggleMute(currentChatId)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isMuted ? 'text-accent bg-bg-hover' : 'text-text-dim hover:text-text-primary hover:bg-bg-input'}`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    )}
                </button>
            </div>

            {/* ── Messages ─────────────────────────────────────────────────── */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messages.length === 0 && <p className="text-text-dim text-sm text-center py-12">No messages yet</p>}
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
                                <div className="max-w-[70%]">
                                    {!msg.isSelf && (
                                        <div className="flex items-center gap-2 mb-1 pl-1 cursor-pointer hover:opacity-80 transition-opacity w-fit"
                                            onClick={() => setSelectedUserProfile(msg.userId)}>
                                            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-bg-primary flex-shrink-0">
                                                {msg.username[0]?.toUpperCase()}
                                            </div>
                                            <span className="text-xs font-medium text-text-primary">{msg.username}</span>
                                        </div>
                                    )}
                                    {/* Rich media renderers */}
                                    {msg.audioUrl ? (
                                        <AudioMessage url={msg.audioUrl} />
                                    ) : msg.imageUrl ? (
                                        <ImageMessage url={msg.imageUrl} />
                                    ) : msg.videoUrl ? (
                                        <VideoMessage url={msg.videoUrl} />
                                    ) : msg.fileInfo ? (
                                        <FileMessage name={msg.fileInfo.name} size={msg.fileInfo.size} />
                                    ) : msg.pollData ? (
                                        <PollMessage data={msg.pollData} isSelf={msg.isSelf} />
                                    ) : msg.locationData ? (
                                        <LocationMessage lat={msg.locationData.lat} lng={msg.locationData.lng} />
                                    ) : (
                                        <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed break-words shadow-sm
                                            ${msg.isSelf ? 'bg-self-bubble text-text-primary rounded-br-[4px]' : 'bg-other-bubble text-text-primary rounded-bl-[4px] border border-border'}`}>
                                            {msg.text}
                                            <div className={`flex justify-end items-center gap-1 mt-1 -mb-1 ${msg.isSelf ? 'text-text-muted/70' : 'text-text-dim'}`}>
                                                <span className="text-[10.5px]">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {activeTyping.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-text-muted text-xs">
                        <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                                <motion.div key={i} className="w-1.5 h-1.5 bg-text-muted rounded-full"
                                    animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
                            ))}
                        </div>
                        <span>{activeTyping.join(', ')} typing</span>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Audio Preview ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {audioUrl && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-2 bg-bg-card border-t border-border flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-error animate-pulse flex-shrink-0" />
                        <span className="text-xs text-text-muted">Voice ({formatDuration(recordingSeconds)})</span>
                        <audio src={audioUrl} controls className="flex-1 h-8" />
                        <button onClick={discardAudio} className="text-error/70 hover:text-error text-xs cursor-pointer transition-colors flex-shrink-0">Discard</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Pending Media Preview ──────────────────────────────────────── */}
            <AnimatePresence>
                {pendingMedia && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-2 bg-bg-card border-t border-border flex items-center gap-3">
                        {pendingMedia.type === 'image' && <img src={pendingMedia.url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                        {pendingMedia.type === 'video' && <div className="w-10 h-10 rounded-lg bg-bg-input flex items-center justify-center flex-shrink-0 text-text-dim text-lg">🎬</div>}
                        {pendingMedia.type === 'file' && <div className="w-10 h-10 rounded-lg bg-bg-input flex items-center justify-center flex-shrink-0 text-text-dim text-lg">📎</div>}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary truncate">{pendingMedia.name}</p>
                            <p className="text-xs text-text-dim">{pendingMedia.size}</p>
                        </div>
                        <button onClick={discardMedia} className="text-error/70 hover:text-error text-xs cursor-pointer transition-colors flex-shrink-0">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Input Bar ─────────────────────────────────────────────────── */}
            <div className="px-4 py-3 bg-bg-secondary border-t border-border">
                <div className="flex items-center gap-2 max-w-4xl mx-auto">

                    {/* Attachment Button */}
                    <div className="relative flex-shrink-0" ref={attachmentRef}>
                        <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => { setShowAttachment(prev => !prev); setShowEmoji(false); }}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-text-dim hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                        </motion.button>

                        <AnimatePresence>
                            {showAttachment && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute bottom-14 left-0 z-50 w-48 bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                                >
                                    {ATTACHMENT_OPTIONS.map((opt, i) => (
                                        <motion.button
                                            key={opt.id}
                                            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={opt.action}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer text-left"
                                        >
                                            <span className="text-text-dim">{opt.icon}</span>
                                            {opt.label}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Input Field */}
                    <div className="flex-1 relative bg-bg-input rounded-2xl border border-transparent focus-within:border-text-dim transition-colors shadow-inner flex items-center">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => { setInput(e.target.value); handleTyping(); }}
                            onKeyDown={handleKeyDown}
                            placeholder={pendingMedia ? `Add a caption... (or send as-is)` : 'Message...'}
                            rows={1}
                            style={{ minHeight: '44px', resize: 'none' }}
                            className="flex-1 w-full px-4 pt-[11px] bg-transparent text-text-primary placeholder-text-dim text-[15px] outline-none"
                        />
                        {/* Emoji Button */}
                        <div className="relative flex-shrink-0 pr-2" ref={emojiRef}>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                onClick={() => { setShowEmoji(prev => !prev); setShowAttachment(false); }}
                                className="w-8 h-8 flex items-center justify-center text-text-dim hover:text-text-primary transition-colors cursor-pointer rounded-full"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                                </svg>
                            </motion.button>
                            <AnimatePresence>
                                {showEmoji && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 8 }} transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute bottom-12 right-0 z-50 w-72 bg-bg-card border border-border rounded-2xl shadow-2xl p-3"
                                    >
                                        <p className="text-[10px] text-text-dim uppercase tracking-wider mb-2 font-semibold px-1">Emoji</p>
                                        <div className="grid grid-cols-8 gap-1">
                                            {EMOJI_LIST.map(emoji => (
                                                <motion.button key={emoji} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }}
                                                    onClick={() => insertEmoji(emoji)}
                                                    className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-bg-hover transition-colors cursor-pointer">
                                                    {emoji}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Send / Mic */}
                    {hasSomethingToSend ? (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                            onClick={handleSend}
                            className="w-10 h-10 rounded-full bg-accent text-bg-primary flex items-center justify-center flex-shrink-0 shadow-lg hover:bg-accent-hover transition-all cursor-pointer"
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </motion.button>
                    ) : (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
                                ${isRecording ? 'bg-error text-white shadow-[0_0_12px_rgba(248,113,113,0.5)]' : 'bg-bg-card text-text-dim hover:text-text-primary border border-border'}`}
                        >
                            {isRecording ? (
                                <motion.div className="w-4 h-4 rounded-sm bg-white"
                                    animate={{ scale: [1, 0.8, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                            ) : (
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </svg>
                            )}
                        </motion.button>
                    )}
                </div>

                {/* Recording indicator */}
                <AnimatePresence>
                    {isRecording && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-center gap-2 pt-2 text-error text-xs font-medium">
                            <motion.div className="w-2 h-2 rounded-full bg-error"
                                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                            Recording {formatDuration(recordingSeconds)} — tap ■ to finish
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Poll Modal */}
            <AnimatePresence>
                {showPoll && <PollModal onClose={() => setShowPoll(false)} onSubmit={handlePollSubmit} />}
            </AnimatePresence>
        </div>
    );
}

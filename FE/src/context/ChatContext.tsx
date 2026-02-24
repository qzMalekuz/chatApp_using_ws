import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import type { ChatMessage, OnlineUser, ServerMessage, UserProfile } from '../types';

interface ChatState {
    socket: WebSocket | null;
    connected: boolean;
    currentUser: { id: number; username: string } | null;
    userProfile: UserProfile;
    onlineUsers: OnlineUser[];
    globalMessages: ChatMessage[];
    privateMessages: Record<number, ChatMessage[]>;
    roomMessages: Record<string, ChatMessage[]>;
    currentRoom: string | null;
    roomMembers: OnlineUser[];
    typingUsers: Record<string, string[]>;
    errors: string[];
    mutedChats: string[];
    selectedUserIdForProfile: number | null;
    sendMessage: (type: string, payload: Record<string, unknown>) => void;
    setUsername: (username: string) => void;
    sendChat: (text: string) => void;
    sendPrivateChat: (toId: number, text: string) => void;
    joinRoom: (room: string) => void;
    leaveRoom: () => void;
    sendRoomChat: (text: string) => void;
    sendTypingStart: () => void;
    sendTypingStop: () => void;
    requestUsers: () => void;
    requestRoomMembers: (room: string) => void;
    dismissError: (index: number) => void;
    setUserStatus: (status: string) => void;
    setUserAvatar: (url: string | null) => void;
    toggleMute: (chatId: string) => void;
    setSelectedUserProfile: (userId: number | null) => void;
}

const ChatContext = createContext<ChatState | null>(null);

export function useChatContext() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChatContext must be inside ChatProvider');
    return ctx;
}

let msgCounter = 0;
function nextId() {
    return `msg-${++msgCounter}-${Date.now()}`;
}

export function ChatProvider({ children }: { children: ReactNode }) {
    const socketRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([]);
    const [privateMessages, setPrivateMessages] = useState<Record<number, ChatMessage[]>>({});
    const [roomMessages, setRoomMessages] = useState<Record<string, ChatMessage[]>>({});
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [roomMembers, setRoomMembers] = useState<OnlineUser[]>([]);
    const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
    const [errors, setErrors] = useState<string[]>([]);
    const [mutedChats, setMutedChats] = useState<string[]>([]);
    const [selectedUserIdForProfile, setSelectedUserProfile] = useState<number | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile>({
        status: '',
        avatarUrl: null,
        joinedAt: new Date().toISOString(),
        messagesSent: 0,
    });

    const currentUserRef = useRef(currentUser);
    const currentRoomRef = useRef(currentRoom);
    currentUserRef.current = currentUser;
    currentRoomRef.current = currentRoom;

    const addError = useCallback((msg: string) => {
        setErrors(prev => [...prev, msg]);
        setTimeout(() => {
            setErrors(prev => prev.slice(1));
        }, 4000);
    }, []);

    const sendMessage = useCallback((type: string, payload: Record<string, unknown>) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type, payload }));
        }
    }, []);

    useEffect(() => {
        let ws: WebSocket | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout>;
        let isCancelled = false;

        function connect() {
            if (isCancelled) return;
            ws = new WebSocket('ws://localhost:3000');
            socketRef.current = ws;

            ws.onopen = () => {
                if (!isCancelled) setConnected(true);
            };
            ws.onclose = () => {
                if (!isCancelled) {
                    setConnected(false);
                    reconnectTimer = setTimeout(connect, 3000);
                }
            };
            ws.onerror = () => {
                // will trigger onclose
            };

            ws.onmessage = (event) => {
                let msg: ServerMessage;
                try {
                    msg = JSON.parse(event.data);
                } catch {
                    return; // ignore non-JSON messages (pong, etc.)
                }
                const { type, payload } = msg;
                const me = currentUserRef.current;

                switch (type) {
                    case 'USER_JOINED': {
                        const u = payload as { id: number; username: string; timestamp: string };
                        if (!me) {
                            setCurrentUser({ id: u.id, username: u.username });
                            setUserProfile(prev => ({ ...prev, joinedAt: u.timestamp }));
                        }
                        setOnlineUsers(prev => {
                            if (prev.find(p => p.id === u.id)) return prev;
                            return [...prev, { id: u.id, username: u.username }];
                        });
                        setGlobalMessages(prev => [...prev, {
                            id: nextId(), type: 'SYSTEM', userId: u.id, username: u.username,
                            text: `${u.username} joined the chat`, timestamp: u.timestamp, isSelf: false,
                        }]);
                        break;
                    }

                    case 'USER_LEFT': {
                        const u = payload as { id: number; username: string; timestamp: string };
                        setOnlineUsers(prev => prev.filter(p => p.id !== u.id));
                        setGlobalMessages(prev => [...prev, {
                            id: nextId(), type: 'SYSTEM', userId: u.id, username: u.username,
                            text: `${u.username} left the chat`, timestamp: u.timestamp, isSelf: false,
                        }]);
                        break;
                    }

                    case 'USER_UPDATED': {
                        const u = payload as { id: number; status?: string; avatarUrl?: string | null; timestamp: string };
                        setOnlineUsers(prev => prev.map(p => {
                            if (p.id === u.id) {
                                return { ...p, status: u.status !== undefined ? u.status : p.status, avatarUrl: u.avatarUrl !== undefined ? u.avatarUrl : p.avatarUrl };
                            }
                            return p;
                        }));
                        break;
                    }

                    case 'CHAT': {
                        const c = payload as { id: number; username: string; text: string; timestamp: string };
                        setGlobalMessages(prev => [...prev, {
                            id: nextId(), type: 'CHAT', userId: c.id, username: c.username,
                            text: c.text, timestamp: c.timestamp, isSelf: c.id === me?.id,
                        }]);
                        break;
                    }

                    case 'USERNAME_CHANGED': {
                        const u = payload as { id: number; username: string; timestamp: string };
                        if (u.id === me?.id) {
                            setCurrentUser({ id: u.id, username: u.username });
                        }
                        setOnlineUsers(prev => prev.map(p => p.id === u.id ? { ...p, username: u.username } : p));
                        break;
                    }

                    case 'PRIVATE_CHAT': {
                        const p = payload as { from: number; username: string; text: string; timestamp: string };
                        const otherId = p.from === me?.id ? 0 : p.from;
                        setPrivateMessages(prev => ({
                            ...prev,
                            [otherId]: [...(prev[otherId] || []), {
                                id: nextId(), type: 'PRIVATE_CHAT', userId: p.from, username: p.username,
                                text: p.text, timestamp: p.timestamp, isSelf: p.from === me?.id,
                            }],
                        }));
                        break;
                    }

                    case 'ROOM_NOTIFICATION': {
                        const r = payload as { message: string; timestamp: string };
                        const room = currentRoomRef.current;
                        if (room) {
                            setRoomMessages(prev => ({
                                ...prev,
                                [room]: [...(prev[room] || []), {
                                    id: nextId(), type: 'ROOM_NOTIFICATION', userId: 0, username: 'System',
                                    text: r.message, timestamp: r.timestamp, isSelf: false,
                                }],
                            }));
                        }
                        break;
                    }

                    case 'ROOM_CHAT': {
                        const c = payload as { id: number; username: string; text: string; timestamp: string };
                        const room = currentRoomRef.current;
                        if (room) {
                            setRoomMessages(prev => ({
                                ...prev,
                                [room]: [...(prev[room] || []), {
                                    id: nextId(), type: 'ROOM_CHAT', userId: c.id, username: c.username,
                                    text: c.text, timestamp: c.timestamp, isSelf: c.id === me?.id,
                                }],
                            }));
                        }
                        break;
                    }

                    case 'USER_LIST': {
                        const list = payload as { users: OnlineUser[] };
                        setOnlineUsers(list.users);
                        break;
                    }

                    case 'ROOM_MEMBERS': {
                        const data = payload as { members: OnlineUser[] };
                        setRoomMembers(data.members);
                        break;
                    }

                    case 'TYPING_START': {
                        const t = payload as { username: string; room: string };
                        if (t.username !== me?.username) {
                            setTypingUsers(prev => {
                                const room = t.room;
                                const current = prev[room] || [];
                                if (current.includes(t.username)) return prev;
                                return { ...prev, [room]: [...current, t.username] };
                            });
                            setTimeout(() => {
                                setTypingUsers(prev => {
                                    const room = t.room;
                                    return { ...prev, [room]: (prev[room] || []).filter(u => u !== t.username) };
                                });
                            }, 3000);
                        }
                        break;
                    }

                    case 'TYPING_STOP': {
                        const t = payload as { username: string; room: string };
                        setTypingUsers(prev => {
                            const room = t.room;
                            return { ...prev, [room]: (prev[room] || []).filter(u => u !== t.username) };
                        });
                        break;
                    }

                    case 'ERROR': {
                        const e = payload as { message: string };
                        addError(e.message);
                        break;
                    }
                }
            };
        }

        connect();
        return () => {
            isCancelled = true;
            clearTimeout(reconnectTimer);
            ws?.close();
        };
    }, [addError]);

    const setUsername = useCallback((username: string) => sendMessage('SET_USERNAME', { username }), [sendMessage]);
    const sendChat = useCallback((text: string) => {
        sendMessage('CHAT', { text });
        setUserProfile(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
    }, [sendMessage]);
    const sendPrivateChat = useCallback((toId: number, text: string) => {
        sendMessage('PRIVATE_CHAT', { to: toId, text });
        setUserProfile(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
    }, [sendMessage]);
    const joinRoom = useCallback((room: string) => {
        sendMessage('ROOM_JOIN', { room });
        setCurrentRoom(room);
        sendMessage('ROOM_MEMBERS', { room });
    }, [sendMessage]);
    const leaveRoom = useCallback(() => {
        sendMessage('ROOM_LEAVE', {});
        setCurrentRoom(null);
        setRoomMembers([]);
    }, [sendMessage]);
    const sendRoomChat = useCallback((text: string) => {
        sendMessage('ROOM_CHAT', { text });
        setUserProfile(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
    }, [sendMessage]);
    const sendTypingStart = useCallback(() => sendMessage('TYPING_START', {}), [sendMessage]);
    const sendTypingStop = useCallback(() => sendMessage('TYPING_STOP', {}), [sendMessage]);
    const requestUsers = useCallback(() => sendMessage('GET_USERS', {}), [sendMessage]);
    const requestRoomMembers = useCallback((room: string) => sendMessage('ROOM_MEMBERS', { room }), [sendMessage]);
    const dismissError = useCallback((index: number) => setErrors(prev => prev.filter((_, i) => i !== index)), []);
    const setUserStatus = useCallback((status: string) => {
        setUserProfile(prev => ({ ...prev, status }));
        sendMessage('UPDATE_PROFILE', { status });
    }, [sendMessage]);
    const setUserAvatar = useCallback((url: string | null) => {
        setUserProfile(prev => ({ ...prev, avatarUrl: url }));
        sendMessage('UPDATE_PROFILE', { avatarUrl: url });
    }, [sendMessage]);
    const toggleMute = useCallback((chatId: string) => {
        setMutedChats(prev => prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId]);
    }, []);

    return (
        <ChatContext.Provider value={{
            socket: socketRef.current, connected, currentUser, userProfile, onlineUsers,
            globalMessages, privateMessages, roomMessages, currentRoom, roomMembers,
            typingUsers, errors, mutedChats, selectedUserIdForProfile, sendMessage, setUsername, sendChat, sendPrivateChat,
            joinRoom, leaveRoom, sendRoomChat, sendTypingStart, sendTypingStop,
            requestUsers, requestRoomMembers, dismissError, setUserStatus, setUserAvatar, toggleMute, setSelectedUserProfile,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

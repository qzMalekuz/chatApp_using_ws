import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

interface Props {
    onComplete: () => void;
}

export default function UsernameModal({ onComplete }: Props) {
    const { setUsername } = useChatContext();
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) { setError('Username is required'); return; }
        if (trimmed.length > 20) { setError('Max 20 characters'); return; }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setError('Only letters, numbers, underscore'); return; }
        setUsername(trimmed);
        onComplete();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-sm mx-4"
                >
                    <div className="bg-bg-card border border-border rounded-2xl p-8">
                        <h1 className="text-xl font-semibold text-text-primary text-center mb-1">
                            Welcome to ChatLo.io
                        </h1>
                        <p className="text-text-muted text-sm text-center mb-6">
                            Choose a display name
                        </p>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                placeholder="Username"
                                maxLength={20}
                                autoFocus
                                className="w-full px-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                  text-sm placeholder-text-dim focus:border-text-muted transition-colors duration-200"
                            />

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-error text-xs px-1"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={handleSubmit}
                                className="w-full py-3 rounded-xl bg-accent text-bg-primary font-semibold text-sm
                  hover:bg-accent-hover transition-colors duration-200 cursor-pointer"
                            >
                                Join Chat
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

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
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl"
                >
                    <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">
                        Welcome to Chat
                    </h2>
                    <p className="text-text-muted text-sm text-center mb-6">
                        Choose a display name to get started
                    </p>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Enter username..."
                        maxLength={20}
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
              placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent/50
              transition-all duration-200"
                    />

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-error text-sm mt-2"
                        >
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="w-full mt-4 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white
              font-semibold transition-colors duration-200 cursor-pointer"
                    >
                        Join Chat
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

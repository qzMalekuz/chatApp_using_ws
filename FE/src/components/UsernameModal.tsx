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
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ background: 'radial-gradient(ellipse at center, #161625 0%, #0f0f1a 70%)' }}
            >
                {/* Ambient glow */}
                <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />

                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                    className="relative z-10 w-full max-w-md mx-4"
                >
                    <div className="bg-bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-10 shadow-2xl"
                        style={{ boxShadow: '0 0 80px rgba(124, 58, 237, 0.08)' }}>

                        <div className="text-center mb-8">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                className="text-5xl mb-4"
                            >
                                💬
                            </motion.div>
                            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                                Welcome
                            </h1>
                            <p className="text-text-muted text-sm mt-2">
                                Pick a name. Start chatting.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    placeholder="Username"
                                    maxLength={20}
                                    autoFocus
                                    className="w-full px-5 py-4 rounded-2xl bg-bg-input border border-border text-text-primary
                    text-base placeholder-text-dim
                    focus:border-accent focus:ring-2 focus:ring-accent-glow
                    transition-all duration-300"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim text-xs">
                                    {name.length}/20
                                </span>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="text-error text-sm px-1"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(124, 58, 237, 0.3)' }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSubmit}
                                className="w-full py-4 rounded-2xl bg-accent hover:bg-accent-hover text-white
                  font-semibold text-base transition-all duration-300 cursor-pointer
                  shadow-lg shadow-accent/20"
                            >
                                Enter Chat →
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

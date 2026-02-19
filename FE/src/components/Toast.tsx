import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

export default function Toast() {
    const { errors, dismissError } = useChatContext();

    return (
        <div className="fixed top-5 right-5 z-50 space-y-3 max-w-sm">
            <AnimatePresence>
                {errors.map((err, i) => (
                    <motion.div
                        key={`${err}-${i}`}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                        className="bg-bg-card border border-error/30 px-5 py-4 rounded-2xl shadow-2xl
              backdrop-blur-xl flex items-center gap-4 cursor-pointer group"
                        style={{ boxShadow: '0 0 30px rgba(248, 113, 113, 0.1)' }}
                        onClick={() => dismissError(i)}
                    >
                        <div className="w-8 h-8 rounded-full bg-error/15 flex items-center justify-center flex-shrink-0">
                            <span className="text-error text-sm">!</span>
                        </div>
                        <span className="text-sm text-text-primary font-medium flex-1">{err}</span>
                        <span className="text-text-dim text-xs group-hover:text-text-muted transition-colors">✕</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

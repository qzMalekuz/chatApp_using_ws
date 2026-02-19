import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

export default function Toast() {
    const { errors, dismissError } = useChatContext();

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            <AnimatePresence>
                {errors.map((err, i) => (
                    <motion.div
                        key={`${err}-${i}`}
                        initial={{ opacity: 0, x: 80, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-error/20 border border-error/40 text-error px-4 py-3 rounded-xl
              backdrop-blur-md flex items-start gap-3 shadow-lg cursor-pointer"
                        onClick={() => dismissError(i)}
                    >
                        <span className="text-sm font-medium flex-1">{err}</span>
                        <span className="text-error/60 text-xs mt-0.5">✕</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

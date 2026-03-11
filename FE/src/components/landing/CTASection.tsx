import { motion } from 'framer-motion';

interface CTASectionProps {
  onOpenChat: () => void;
}

export default function CTASection({ onOpenChat }: CTASectionProps) {
  return (
    <section className="landing-border border-b py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45 }}
          className="landing-border rounded-3xl border bg-[var(--landing-card)] px-6 py-12 text-center sm:px-10"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--landing-text)] sm:text-4xl">Start chatting in seconds.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--landing-muted)]">
            No bloated setup. Open the browser, pick a display name, and join live conversation instantly.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenChat}
              className="rounded-full border border-[var(--landing-text)] bg-[var(--landing-text)] px-6 py-3 text-sm font-semibold text-[var(--landing-bg)] transition-all duration-200 hover:opacity-90"
            >
              Open Chat
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

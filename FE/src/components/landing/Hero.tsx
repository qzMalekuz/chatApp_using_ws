import { motion } from 'framer-motion';

interface HeroProps {
  onOpenChat: () => void;
}

const chatPreview = [
  { user: 'Amina', time: '09:41', text: 'Shipped the websocket typing update.', self: false },
  { user: 'You', time: '09:42', text: 'Looks fast. Pushing UI polish next.', self: true },
  { user: 'Noah', time: '09:43', text: 'Room latency is under 40ms now.', self: false },
  { user: 'You', time: '09:44', text: 'Great. Let us deploy after tests pass.', self: true },
];

export default function Hero({ onOpenChat }: HeroProps) {
  return (
    <section className="landing-border relative overflow-hidden border-b" id="top">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left"
        >
          <p className="landing-border mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--landing-muted)]">
            Built for fast conversations
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-[var(--landing-text)] sm:text-5xl lg:text-6xl">
            Connect Instantly. Chat Seamlessly.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--landing-muted)]">
            The fastest real-time chat platform built for developers and communities.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <button
              onClick={onOpenChat}
              className="min-h-11 rounded-full border border-[var(--landing-text)] bg-[var(--landing-text)] px-6 py-3 text-sm font-semibold text-[var(--landing-bg)] transition-all duration-200 hover:scale-[1.02] hover:opacity-90"
            >
              Open Chat in Browser
            </button>
            <a
              href="https://github.com/qzMalekuz/ChatLo.io"
              target="_blank"
              rel="noreferrer"
              className="landing-border min-h-11 rounded-full border px-6 py-3 text-sm font-semibold text-[var(--landing-text)] transition-all duration-200 hover:opacity-80"
            >
              View on GitHub
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
          className="mx-auto w-full max-w-xl"
        >
          <div className="landing-border rounded-3xl border bg-[var(--landing-card)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.2)]">
            <div className="landing-border mb-4 flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-sm font-semibold text-[var(--landing-text)]"># global-room</p>
                <p className="text-xs text-[var(--landing-muted)]">12 users online</p>
              </div>
              <span className="landing-border rounded-full border px-3 py-1 text-[11px] text-[var(--landing-muted)]">Live</span>
            </div>

            <div className="space-y-3">
              {chatPreview.map((message, index) => (
                <motion.div
                  key={`${message.user}-${message.time}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 + 0.25 }}
                  className={`rounded-2xl border px-3 py-3 ${
                    message.self
                      ? 'landing-border ml-auto max-w-[85%] border bg-[var(--landing-surface)]'
                      : 'landing-border max-w-[90%] border bg-[var(--landing-bg)]'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs text-[var(--landing-muted)]">
                    <span className="font-medium text-[var(--landing-text)]">{message.user}</span>
                    <span>{message.time}</span>
                  </div>
                  <p className="text-sm text-[var(--landing-text)]">{message.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

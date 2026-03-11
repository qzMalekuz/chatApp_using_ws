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
    <section className="relative overflow-hidden border-b border-gray-900" id="top">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="max-w-xl"
        >
          <p className="mb-4 inline-flex rounded-full border border-gray-700 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-gray-300">
            Built for fast conversations
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Connect Instantly. Chat Seamlessly.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-300">
            The fastest real-time chat platform built for developers and communities.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenChat}
              className="rounded-full border border-white bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:scale-[1.02] hover:bg-gray-200"
            >
              Open Chat in Browser
            </button>
            <a
              href="https://github.com/qzMalekuz/ChatLo.io"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-gray-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-gray-400 hover:bg-white/5"
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
          <div className="rounded-3xl border border-gray-800 bg-[#060606] p-5 shadow-[0_20px_80px_rgba(255,255,255,0.06)]">
            <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <p className="text-sm font-semibold text-white"># global-room</p>
                <p className="text-xs text-gray-400">12 users online</p>
              </div>
              <span className="rounded-full border border-gray-700 px-3 py-1 text-[11px] text-gray-300">Live</span>
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
                      ? 'ml-auto max-w-[85%] border-gray-700 bg-gray-900'
                      : 'max-w-[90%] border-gray-800 bg-black'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-medium text-gray-200">{message.user}</span>
                    <span>{message.time}</span>
                  </div>
                  <p className="text-sm text-gray-100">{message.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

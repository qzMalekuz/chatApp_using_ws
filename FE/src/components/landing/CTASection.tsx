import { motion } from 'framer-motion';

interface CTASectionProps {
  onOpenChat: () => void;
}

export default function CTASection({ onOpenChat }: CTASectionProps) {
  return (
    <section className="border-b border-gray-900 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-gray-800 bg-[#050505] px-6 py-12 text-center sm:px-10"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Start chatting in seconds.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            No bloated setup. Open the browser, pick a display name, and join live conversation instantly.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenChat}
              className="rounded-full border border-white bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-200"
            >
              Open Chat
            </button>
            <a
              href="https://github.com/qzMalekuz/ChatLo.io"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-gray-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-gray-400 hover:bg-white/5"
            >
              View Source
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

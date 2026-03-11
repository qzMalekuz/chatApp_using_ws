import { motion } from 'framer-motion';

const rows = [
  {
    user: 'samira.dev',
    message: 'Pushed room moderation and rate-limit patch.',
    timestamp: '10:21',
  },
  {
    user: 'kairo',
    message: 'Typing indicator is smooth on mobile now.',
    timestamp: '10:22',
  },
  {
    user: 'malekuz',
    message: 'Launching update in 15 mins. Final QA check?',
    timestamp: '10:23',
  },
];

export default function ProductPreview() {
  return (
    <section className="border-b border-gray-900 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-10 max-w-2xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Product preview</h2>
          <p className="mt-4 text-gray-400">
            A focused interface with clear message threads, usernames, and timestamps.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-3xl border border-gray-800 bg-[#060606]"
        >
          <div className="grid min-h-[28rem] md:grid-cols-[240px_1fr]">
            <aside className="border-b border-gray-800 bg-black/80 p-4 md:border-b-0 md:border-r">
              <p className="mb-4 text-xs uppercase tracking-[0.18em] text-gray-500">Rooms</p>
              <div className="space-y-2 text-sm">
                <div className="rounded-lg border border-gray-700 bg-white/5 px-3 py-2 text-white"># global</div>
                <div className="rounded-lg border border-transparent px-3 py-2 text-gray-400"># engineering</div>
                <div className="rounded-lg border border-transparent px-3 py-2 text-gray-400"># product</div>
              </div>
            </aside>

            <div className="flex flex-col">
              <header className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
                <div>
                  <p className="font-medium text-white"># global</p>
                  <p className="text-xs text-gray-500">Realtime sync online</p>
                </div>
                <span className="text-xs text-gray-500">3 online</span>
              </header>

              <div className="flex-1 space-y-4 p-5">
                {rows.map((row) => (
                  <div key={row.timestamp} className="max-w-2xl rounded-xl border border-gray-800 bg-black p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-semibold text-gray-200">{row.user}</span>
                      <span>{row.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-200">{row.message}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 p-5">
                <div className="rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm text-gray-500">Message #global</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

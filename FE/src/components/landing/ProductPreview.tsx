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
    <section className="landing-border border-b py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-10 max-w-2xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--landing-text)] sm:text-4xl">Product preview</h2>
          <p className="mt-4 text-[var(--landing-muted)]">
            A focused interface with clear message threads, usernames, and timestamps.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="landing-border overflow-hidden rounded-3xl border bg-[var(--landing-card)]"
        >
          <div className="grid min-h-[28rem] md:grid-cols-[240px_1fr]">
            <aside className="landing-border border-b bg-[var(--landing-bg)]/80 p-4 md:border-b-0 md:border-r">
              <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[var(--landing-muted)]">Rooms</p>
              <div className="space-y-2 text-sm">
                <div className="landing-border rounded-lg border bg-[var(--landing-card)] px-3 py-2 text-[var(--landing-text)]"># global</div>
                <div className="rounded-lg border border-transparent px-3 py-2 text-[var(--landing-muted)]"># engineering</div>
                <div className="rounded-lg border border-transparent px-3 py-2 text-[var(--landing-muted)]"># product</div>
              </div>
            </aside>

            <div className="flex flex-col">
              <header className="landing-border flex items-center justify-between border-b px-5 py-4">
                <div>
                  <p className="font-medium text-[var(--landing-text)]"># global</p>
                  <p className="text-xs text-[var(--landing-muted)]">Realtime sync online</p>
                </div>
                <span className="text-xs text-[var(--landing-muted)]">3 online</span>
              </header>

              <div className="flex-1 space-y-4 p-5">
                {rows.map((row) => (
                  <div key={row.timestamp} className="landing-border max-w-2xl rounded-xl border bg-[var(--landing-bg)] p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-[var(--landing-muted)]">
                      <span className="font-semibold text-[var(--landing-text)]">{row.user}</span>
                      <span>{row.timestamp}</span>
                    </div>
                    <p className="text-sm text-[var(--landing-text)]">{row.message}</p>
                  </div>
                ))}
              </div>

              <div className="landing-border border-t p-5">
                <div className="landing-border rounded-xl border bg-[var(--landing-bg)] px-4 py-3 text-sm text-[var(--landing-muted)]">Message #global</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

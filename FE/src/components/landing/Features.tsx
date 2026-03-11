import { motion } from 'framer-motion';

const features = [
  {
    title: 'Real-Time Messaging',
    description: 'Lightning fast WebSocket powered chat with instant delivery.',
    icon: (
      <path d="M21 11.5a8.5 8.5 0 01-8.5 8.5H6l-4 3v-6.5A8.5 8.5 0 0110.5 3H12a9 9 0 019 8.5z" />
    ),
  },
  {
    title: 'Developer Friendly',
    description: 'Built with a modern TypeScript stack for clean extensibility.',
    icon: <path d="M3 5h18v14H3zM8 9l2 2-2 2m8-4h-4" />,
  },
  {
    title: 'Open Source',
    description: 'Fully transparent architecture you can inspect and customize.',
    icon: <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v12m6-6H6" />,
  },
  {
    title: 'Lightweight',
    description: 'Minimal interface and blazing performance on desktop and mobile.',
    icon: <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
  },
  {
    title: 'Scalable',
    description: 'Designed to support thousands of simultaneous active users.',
    icon: <path d="M4 18h4V8H4v10zm6 0h4V4h-4v14zm6 0h4v-7h-4v7z" />,
  },
  {
    title: 'Secure',
    description: 'Built-in validation, rate limiting, and spam protection guardrails.',
    icon: <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4zm0 7v4m0 4h.01" />,
  },
];

export default function Features() {
  return (
    <section id="features" className="landing-border border-b py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--landing-text)] sm:text-4xl">Feature-rich, simple by default</h2>
          <p className="mt-4 text-[var(--landing-muted)]">
            ChatLo.io keeps the interface clean while preserving everything developers need for real-time collaboration.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="landing-border group rounded-2xl border bg-[var(--landing-card)] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition-all duration-200 hover:translate-y-[-2px]"
            >
              <div className="landing-border mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-[var(--landing-bg)] text-[var(--landing-text)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--landing-text)]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--landing-muted)]">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

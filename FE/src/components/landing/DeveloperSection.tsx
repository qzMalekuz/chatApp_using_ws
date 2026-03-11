import { motion } from 'framer-motion';

const stack = ['React', 'TypeScript', 'WebSockets', 'Node.js', 'TailwindCSS'];

export default function DeveloperSection() {
  return (
    <section id="developers" className="border-b border-gray-900 py-20 sm:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
        >
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gray-500">Built for Developers</p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built to be extended, not fought.
          </h2>
          <p className="mt-5 max-w-xl text-gray-400">
            ChatLo.io ships with a clean full-stack architecture, typed events, and a minimal UI layer so teams can customize quickly without rewriting core realtime behavior.
          </p>
          <a
            href="https://github.com/qzMalekuz/ChatLo.io"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex rounded-full border border-gray-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-gray-400 hover:bg-white/5"
          >
            View GitHub Repository
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="rounded-2xl border border-gray-800 bg-[#050505] p-6"
        >
          <p className="mb-5 text-sm font-medium text-gray-300">Tech stack</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {stack.map((item) => (
              <div key={item} className="rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-gray-200">
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { useState, type MouseEvent } from 'react';

interface FooterProps {
  onOpenChat: () => void;
}

type FooterColumn = {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
};

const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Open Chat', href: '/chat' },
      { label: 'Features', href: '#features' },
    ],
  },
  {
    title: 'Developers',
    links: [{ label: 'GitHub', href: 'https://github.com/qzMalekuz/ChatLo.io', external: true }],
  },
];

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/qzMalekuz/ChatLo.io',
    icon: (
      <path d="M12 .5C5.65.5.5 5.7.5 12.1c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.6v-2.3c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.9 2.9 1.4 3.6 1.1.1-.8.4-1.4.8-1.8-2.6-.3-5.4-1.3-5.4-6 0-1.3.5-2.5 1.2-3.4-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.5 1.3a11.8 11.8 0 016.3 0C18 4.7 19 5 19 5c.6 1.7.2 2.9.1 3.2.8.9 1.2 2.1 1.2 3.4 0 4.8-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6a11.6 11.6 0 007.8-10.9C23.5 5.7 18.4.5 12 .5z" />
    ),
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com',
    icon: <path d="M18.2 2H21l-6.5 7.3L22 22h-5.9l-4.6-6.4L5.8 22H3l7-7.9L2 2h6l4.2 5.9L18.2 2zm-1 18h1.6L7.1 3.9H5.4L17.2 20z" />,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com',
    icon: (
      <path d="M4.9 3.5A1.9 1.9 0 113 5.4a1.9 1.9 0 011.9-1.9zM3.2 8h3.4v12H3.2zM9.1 8h3.2v1.7h.1c.4-.8 1.6-2 3.4-2 3.6 0 4.2 2.3 4.2 5.3v7h-3.4v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V20H9.1z" />
    ),
  },
];

export default function Footer({ onOpenChat }: FooterProps) {
  const [openSection, setOpenSection] = useState<string | null>('Product');
  const year = 2026;

  const handleInternalLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '/chat') {
      event.preventDefault();
      onOpenChat();
    }
  };

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 border-b border-gray-800 pb-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <a href="/" className="inline-flex items-center gap-3" aria-label="ChatLo.io home">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-white text-black">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 3c-4.97 0-9 3.34-9 7.46 0 2.32 1.26 4.39 3.23 5.76L5 21l4.1-2.26c.93.2 1.9.3 2.9.3 4.97 0 9-3.34 9-7.46S16.97 3 12 3zm-4 8a1.25 1.25 0 110-2.5A1.25 1.25 0 018 11zm4 0a1.25 1.25 0 110-2.5A1.25 1.25 0 0112 11zm4 0a1.25 1.25 0 110-2.5A1.25 1.25 0 0116 11z" />
                </svg>
              </span>
              <span className="text-xl font-semibold tracking-tight">ChatLo.io</span>
            </a>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-400">
              Open-source real-time chat built for developers and communities.
            </p>

            <div className="mt-7 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 text-gray-300 transition-all duration-200 hover:border-gray-500 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="hidden grid-cols-2 gap-10 md:grid">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noreferrer' : undefined}
                          onClick={(event) => handleInternalLink(event, link.href)}
                          className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="md:hidden">
              {footerColumns.map((column) => {
                const isOpen = openSection === column.title;
                return (
                  <div key={column.title} className="border-b border-gray-800 last:border-b-0">
                    <button
                      onClick={() => setOpenSection((prev) => (prev === column.title ? null : column.title))}
                      className="flex w-full items-center justify-between py-4 text-left"
                    >
                      <span className="text-sm font-semibold">{column.title}</span>
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <ul className="space-y-3 pb-4">
                        {column.links.map((link) => (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              target={link.external ? '_blank' : undefined}
                              rel={link.external ? 'noreferrer' : undefined}
                              onClick={(event) => handleInternalLink(event, link.href)}
                              className="block text-sm text-gray-400"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-400">© {year} ChatLo.io</p>
          <button
            onClick={onOpenChat}
            className="rounded-full border border-white bg-white px-5 py-2 text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-200"
          >
            Open Chat
          </button>
        </div>
      </div>
    </footer>
  );
}

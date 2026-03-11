import { useState, type MouseEvent } from 'react';

interface NavbarProps {
  onOpenChat: () => void;
}

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'For Developers', href: '#developers' },
  { label: 'GitHub', href: 'https://github.com/qzMalekuz/ChatLo.io', external: true },
  { label: 'Login', href: '/chat' },
];

export default function Navbar({ onOpenChat }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);
  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '/chat') {
      event.preventDefault();
      closeMenu();
      onOpenChat();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/80 bg-black/60 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="group flex items-center gap-3" aria-label="ChatLo.io home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700 bg-white text-black transition-all duration-200 group-hover:translate-y-[-1px] group-hover:bg-gray-100">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12 3c-4.97 0-9 3.34-9 7.46 0 2.32 1.26 4.39 3.23 5.76L5 21l4.1-2.26c.93.2 1.9.3 2.9.3 4.97 0 9-3.34 9-7.46S16.97 3 12 3zm-4 8a1.25 1.25 0 110-2.5A1.25 1.25 0 018 11zm4 0a1.25 1.25 0 110-2.5A1.25 1.25 0 0112 11zm4 0a1.25 1.25 0 110-2.5A1.25 1.25 0 0116 11z" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">ChatLo.io</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              onClick={(event) => handleLinkClick(event, item.href)}
              className="text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={onOpenChat}
            className="rounded-full border border-white bg-white px-5 py-2 text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-200"
          >
            Get Started
          </button>
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 text-white md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-gray-800 bg-black md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                onClick={(event) => handleLinkClick(event, item.href)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                closeMenu();
                onOpenChat();
              }}
              className="mt-2 rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

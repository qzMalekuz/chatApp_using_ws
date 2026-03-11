import { useState } from 'react';
import ThemeToggle from '../ThemeToggle';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  onOpenChat: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'For Developers', href: '#developers' },
];

export default function Navbar({ onOpenChat, theme, onToggleTheme }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="landing-border sticky top-0 z-50 border-b bg-[var(--landing-bg)]/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="group flex items-center gap-3" aria-label="ChatLo.io home">
          <BrandLogo textClassName="text-lg text-[var(--landing-text)]" iconClassName="text-[var(--landing-text)]" />
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[var(--landing-muted)] transition-colors duration-200 hover:text-[var(--landing-text)]"
            >
              {item.label}
            </a>
          ))}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            onClick={onOpenChat}
            className="min-h-11 rounded-full border border-[var(--landing-text)] bg-[var(--landing-text)] px-5 py-2 text-sm font-semibold text-[var(--landing-bg)] transition-all duration-200 hover:opacity-90"
          >
            Get Started
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--landing-border)] text-[var(--landing-text)]"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="landing-border border-t bg-[var(--landing-bg)] md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--landing-muted)] transition-colors hover:bg-[var(--landing-card)] hover:text-[var(--landing-text)]"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                onOpenChat();
              }}
              className="mt-2 rounded-full border border-[var(--landing-text)] bg-[var(--landing-text)] px-4 py-2 text-sm font-semibold text-[var(--landing-bg)]"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

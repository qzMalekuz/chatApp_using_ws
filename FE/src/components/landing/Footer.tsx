import BrandLogo from './BrandLogo';
import BackgroundBrand from './BackgroundBrand';

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/qzMalekuz',
    icon: (
      <path d="M12 .5C5.65.5.5 5.7.5 12.1c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.6v-2.3c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.9 2.9 1.4 3.6 1.1.1-.8.4-1.4.8-1.8-2.6-.3-5.4-1.3-5.4-6 0-1.3.5-2.5 1.2-3.4-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.5 1.3a11.8 11.8 0 016.3 0C18 4.7 19 5 19 5c.6 1.7.2 2.9.1 3.2.8.9 1.2 2.1 1.2 3.4 0 4.8-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6a11.6 11.6 0 007.8-10.9C23.5 5.7 18.4.5 12 .5z" />
    ),
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com/qzmalekuz',
    icon: <path d="M18.2 2H21l-6.5 7.3L22 22h-5.9l-4.6-6.4L5.8 22H3l7-7.9L2 2h6l4.2 5.9L18.2 2zm-1 18h1.6L7.1 3.9H5.4L17.2 20z" />,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/malekuz-zafar-qadri-6b5405232/',
    icon: (
      <path d="M4.9 3.5A1.9 1.9 0 113 5.4a1.9 1.9 0 011.9-1.9zM3.2 8h3.4v12H3.2zM9.1 8h3.2v1.7h.1c.4-.8 1.6-2 3.4-2 3.6 0 4.2 2.3 4.2 5.3v7h-3.4v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V20H9.1z" />
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--landing-bg)] text-[var(--landing-text)]">
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-16 sm:px-6 lg:px-8">
        <div className="landing-border border-b pb-12">
          <a href="/" className="inline-flex items-center gap-3" aria-label="ChatLo.io home">
            <BrandLogo textClassName="text-[2rem] text-[var(--landing-text)]" iconClassName="text-[var(--landing-text)]" />
          </a>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--landing-muted)]">
            Open-source real-time chat built for developers and communities.
          </p>

          <div className="mt-8 flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="landing-border inline-flex h-12 w-12 items-center justify-center rounded-xl border text-[var(--landing-muted)] transition-all duration-200 hover:text-[var(--landing-text)]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  {social.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="pt-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--landing-muted)]/80">Credits</p>
          <p className="mt-3 max-w-3xl text-[clamp(1.15rem,2.4vw,1.75rem)] font-medium leading-tight tracking-tight text-[var(--landing-muted)]">
            Built and designed by{' '}
            <a
              href="https://zafarr.xyz/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--landing-text)] underline decoration-[var(--landing-border)] underline-offset-4 transition-opacity hover:opacity-80"
            >
              zafarr.
            </a>
          </p>
          <p className="mt-4 text-sm tracking-wide text-[var(--landing-muted)]">
            © 2026 ChatLo.io All Rights Reserved
          </p>
        </div>
      </div>

      <BackgroundBrand />
    </footer>
  );
}

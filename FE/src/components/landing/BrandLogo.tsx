interface BrandLogoProps {
  textClassName?: string;
  iconClassName?: string;
}

export default function BrandLogo({ textClassName = 'text-[var(--landing-text)]', iconClassName = '' }: BrandLogoProps) {
  return (
    <>
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] ${iconClassName}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
          <path d="M7 5h10a3 3 0 013 3v6a3 3 0 01-3 3h-5.2l-3.6 3.3c-.7.6-1.7.1-1.7-.8V17H7a3 3 0 01-3-3V8a3 3 0 013-3z" />
        </svg>
      </span>
      <span className={`text-2xl font-semibold tracking-tight ${textClassName}`}>ChatLo.io</span>
    </>
  );
}

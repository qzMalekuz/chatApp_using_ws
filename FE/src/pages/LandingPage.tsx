import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import ProductPreview from '../components/landing/ProductPreview';
import DeveloperSection from '../components/landing/DeveloperSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

interface LandingPageProps {
  onOpenChat: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function LandingPage({ onOpenChat, theme, onToggleTheme }: LandingPageProps) {
  return (
    <div className="min-h-screen scroll-smooth bg-[var(--landing-bg)] text-[var(--landing-text)]">
      <Navbar onOpenChat={onOpenChat} theme={theme} onToggleTheme={onToggleTheme} />
      <main>
        <Hero onOpenChat={onOpenChat} />
        <Features />
        <ProductPreview />
        <DeveloperSection />
        <CTASection onOpenChat={onOpenChat} />
      </main>
      <Footer />
    </div>
  );
}

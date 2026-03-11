import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import ProductPreview from '../components/landing/ProductPreview';
import DeveloperSection from '../components/landing/DeveloperSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

interface LandingPageProps {
  onOpenChat: () => void;
}

export default function LandingPage({ onOpenChat }: LandingPageProps) {
  return (
    <div className="min-h-screen scroll-smooth bg-black text-white">
      <Navbar onOpenChat={onOpenChat} />
      <main>
        <Hero onOpenChat={onOpenChat} />
        <Features />
        <ProductPreview />
        <DeveloperSection />
        <CTASection onOpenChat={onOpenChat} />
      </main>
      <Footer onOpenChat={onOpenChat} />
    </div>
  );
}

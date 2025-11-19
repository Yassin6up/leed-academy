import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { CryptoTicker } from "@/components/landing/CryptoTicker";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <Hero />
        <CryptoTicker />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

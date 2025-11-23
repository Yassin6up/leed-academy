import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { MarketTicker } from "@/components/landing/MarketTicker";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <Hero />
        <MarketTicker />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

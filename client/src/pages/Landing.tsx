import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { MarketTicker } from "@/components/landing/MarketTicker";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { WhoWeAre } from "@/components/landing/WhoWeAre";
import { VideoSection } from "@/components/landing/VideoSection";
import { EnhancedTestimonials } from "@/components/landing/EnhancedTestimonials";
import { StatsSection } from "@/components/landing/StatsSection";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const { i18n } = useTranslation();

  return (
    <div
      className="min-h-screen bg-background"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <Header />
      <main className="pt-20">
        <Hero />
        <MarketTicker />
        <WhoWeAre />
        <StatsSection />
        <VideoSection />
        <Features />
        <EnhancedTestimonials />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

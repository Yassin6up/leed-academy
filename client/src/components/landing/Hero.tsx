import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Trading_hero_background_image_e876a55e.png";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Trading"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground mb-6 leading-tight"
            data-testid="text-hero-title"
          >
            {t("hero.title")}
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl"
            data-testid="text-hero-subtitle"
          >
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="text-base px-8"
              data-testid="button-hero-primary"
            >
              <Link href="/courses">
                <a className="flex items-center gap-2">
                  {t("hero.cta.primary")}
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8 backdrop-blur-sm bg-background/50"
              data-testid="button-hero-secondary"
            >
              <Link href="/about">
                <a className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  {t("hero.cta.secondary")}
                </a>
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-xl">
            <div data-testid="stat-students">
              <p className="text-3xl font-bold text-foreground">10K+</p>
              <p className="text-sm text-muted-foreground">
                {t("language") === "ar" ? "طالب نشط" : "Active Students"}
              </p>
            </div>
            <div data-testid="stat-courses">
              <p className="text-3xl font-bold text-foreground">50+</p>
              <p className="text-sm text-muted-foreground">
                {t("language") === "ar" ? "دورة" : "Courses"}
              </p>
            </div>
            <div data-testid="stat-satisfaction">
              <p className="text-3xl font-bold text-foreground">95%</p>
              <p className="text-sm text-muted-foreground">
                {t("language") === "ar" ? "رضا" : "Satisfaction"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

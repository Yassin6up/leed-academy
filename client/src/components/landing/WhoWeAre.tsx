import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";
import { Award, Users, Zap, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

gsap.registerPlugin(ScrollTrigger);

const valueIcons = [Award, Users, Zap, Target];

export function WhoWeAre() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  const values = [
    {
      key: "excellence",
      icon: Award,
    },
    {
      key: "community",
      icon: Users,
    },
    {
      key: "innovation",
      icon: Zap,
    },
    {
      key: "results",
      icon: Target,
    },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".who-we-are-title",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        }
      );

      cardsRef.current.forEach((el, index) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: index * 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 50%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-background" data-testid="section-who-we-are">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="who-we-are-title text-4xl md:text-5xl font-bold mb-4">
            {t("landing.whoWeAre")}
          </h2>
          <h2 className="who-we-are-title text-4xl md:text-5xl font-bold mb-6 text-primary">
            {t("landing.whoWeAreAr")}
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            {t("landing.description")}
          </p>
          <p className="text-lg text-muted-foreground">
            {t("landing.descriptionAr")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
              >
                <Card className="p-6 h-full hover-elevate text-center" data-testid={`value-card-${index}`}>
                  <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">{t(`landing.values.${value.key}`)}</h3>
                  <h3 className="text-xl font-bold mb-4 text-primary">
                    {t(`landing.values.${value.key}Ar`)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t(`landing.values.${value.key}Desc`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(`landing.values.${value.key}DescAr`)}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, TrendingUp, BarChart3, Headphones } from "lucide-react";

export function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: GraduationCap,
      title: t("features.expert.title"),
      description: t("features.expert.desc"),
    },
    {
      icon: TrendingUp,
      title: t("features.live.title"),
      description: t("features.live.desc"),
    },
    {
      icon: BarChart3,
      title: t("features.progress.title"),
      description: t("features.progress.desc"),
    },
    {
      icon: Headphones,
      title: t("features.support.title"),
      description: t("features.support.desc"),
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <h2
          className="text-3xl md:text-4xl font-heading font-bold text-center text-foreground mb-12"
          data-testid="text-features-title"
        >
          {t("features.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover-elevate active-elevate-2 transition-all"
              data-testid={`card-feature-${index}`}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { SubscriptionPlan } from "@shared/schema";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Pricing() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-8">
                    <div className="h-64 bg-muted animate-pulse rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1
                className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6"
                data-testid="text-pricing-title"
              >
                {t("pricing.title")}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {language === "ar"
                  ? "اختر الخطة المناسبة لك وابدأ رحلتك التعليمية اليوم"
                  : "Choose the plan that's right for you and start your learning journey today"}
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans?.map((plan, index) => (
                <Card
                  key={plan.id}
                  className={`hover-elevate active-elevate-2 transition-all ${
                    plan.isPopular ? "border-primary border-2" : ""
                  }`}
                  data-testid={`card-pricing-plan-${index}`}
                >
                  <CardHeader>
                    {plan.isPopular && (
                      <Badge className="w-fit mb-2" data-testid="badge-popular">
                        {t("pricing.popular")}
                      </Badge>
                    )}
                    <CardTitle className="text-2xl">
                      {language === "ar" ? plan.nameAr : plan.nameEn}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        /{t("pricing.monthly")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      {language === "ar" ? plan.descriptionAr : plan.descriptionEn}
                    </p>
                    <ul className="space-y-3 mb-6">
                      {(language === "ar"
                        ? plan.featuresAr
                        : plan.featuresEn
                      )?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="w-full"
                      variant={plan.isPopular ? "default" : "outline"}
                    >
                      {isAuthenticated ? (
                        <Link href={`/subscribe/${plan.id}`}>
                          <a data-testid={`button-select-plan-${index}`}>{t("pricing.select")}</a>
                        </Link>
                      ) : (
                        <a href="/api/login" data-testid={`button-select-plan-${index}`}>{t("nav.login")}</a>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

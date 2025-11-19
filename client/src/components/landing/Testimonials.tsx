import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import type { Testimonial } from "@shared/schema";
import { useState, useEffect } from "react";

export function Testimonials() {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  useEffect(() => {
    if (!testimonials || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials]);

  if (isLoading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-foreground mb-12">
            {t("testimonials.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-32 bg-muted animate-pulse rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length],
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <h2
          className="text-3xl md:text-4xl font-heading font-bold text-center text-foreground mb-12"
          data-testid="text-testimonials-title"
        >
          {t("testimonials.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleTestimonials.map((testimonial, index) => (
            <Card
              key={`${testimonial.id}-${index}`}
              className="hover-elevate active-elevate-2 transition-all"
              data-testid={`card-testimonial-${index}`}
            >
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-500 text-yellow-500"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 italic">
                  "{language === "ar" ? testimonial.contentAr : testimonial.contentEn}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.imageUrl || ""} />
                    <AvatarFallback>
                      {(language === "ar" ? testimonial.nameAr : testimonial.nameEn)?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {language === "ar" ? testimonial.nameAr : testimonial.nameEn}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? testimonial.roleAr : testimonial.roleEn}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
              onClick={() => setCurrentIndex(index)}
              data-testid={`indicator-testimonial-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

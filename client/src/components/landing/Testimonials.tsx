import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@shared/schema";
import { useState, useEffect } from "react";

export function Testimonials() {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Translation content
  const translations = {
    en: {
      title: "What Our Students Say",
      subtitle: "Join thousands of successful traders who transformed their skills with our courses",
      loading: "Loading testimonials...",
      empty: "No testimonials available"
    },
    ar: {
      title: "ماذا يقول طلابنا",
      subtitle: "انضم إلى الآلاف من المتداولين الناجحين الذين طوروا مهاراتهم من خلال دوراتنا",
      loading: "جاري تحميل التوصيات...",
      empty: "لا توجد توصيات متاحة"
    }
  };

  const t = translations[language];

  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  useEffect(() => {
    if (!testimonials || testimonials.length === 0 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials, isAutoPlaying]);

  const nextTestimonial = () => {
    if (!testimonials) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    if (!testimonials) return;
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {t.title}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-slate-200 dark:border-slate-700">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                    </div>
                    <div className="flex items-center gap-3 pt-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16" />
                      </div>
                    </div>
                  </div>
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
    <section 
      className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-900/20"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <Star className="h-4 w-4 fill-current" />
            {language === "en" ? "Student Success Stories" : "قصص نجاح الطلاب"}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 disabled:opacity-50"
              disabled={testimonials.length <= 3}
            >
              <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? "w-6 bg-blue-600" 
                      : "w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                  }`}
                  onClick={() => goToTestimonial(index)}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 disabled:opacity-50"
              disabled={testimonials.length <= 3}
            >
              <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visibleTestimonials.map((testimonial, index) => (
              <Card
                key={`${testimonial.id}-${index}`}
                className="group hover:shadow-xl transition-all duration-500 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:scale-105"
              >
                <CardContent className="p-8 relative">
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Quote className="h-12 w-12 text-blue-600" />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-lg relative z-10">
                    "{language === "ar" ? testimonial.contentAr : testimonial.contentEn}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Avatar className="h-14 w-14 border-2 border-white dark:border-slate-800 shadow-lg">
                      <AvatarImage src={testimonial.imageUrl || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {(language === "ar" ? testimonial.nameAr : testimonial.nameEn)?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-lg truncate">
                        {language === "ar" ? testimonial.nameAr : testimonial.nameEn}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm truncate">
                        {language === "ar" ? testimonial.roleAr : testimonial.roleEn}
                      </p>
                      {testimonial.course && (
                        <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-1">
                          {language === "ar" ? `دورة: ${testimonial.course}` : `Course: ${testimonial.course}`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Auto-play Toggle */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
            >
              <div className={`w-3 h-3 rounded-full ${isAutoPlaying ? 'bg-green-500' : 'bg-red-500'}`} />
              {isAutoPlaying 
                ? (language === "en" ? "Auto-playing" : "التشغيل التلقائي") 
                : (language === "en" ? "Click to play" : "انقر للتشغيل")
              }
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
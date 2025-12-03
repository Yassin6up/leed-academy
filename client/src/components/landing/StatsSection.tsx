import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/i18n"; // Using your custom hook

gsap.registerPlugin(ScrollTrigger);

export function StatsSection() {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const numbersRef = useRef<HTMLDivElement[]>([]);

  // Translation content
  const translations = {
    en: {
      stats: {
        students: "Active Students",
        hours: "Learning Hours", 
        successRate: "Success Rate",
        rating: "Student Rating"
      }
    },
    ar: {
      stats: {
        students: "طالب نشط",
        hours: "ساعة تعلم",
        successRate: "معدل النجاح",
        rating: "تقييم الطلاب"
      }
    }
  };

  const t = translations[language];

  const stats = [
    { number: 5000, key: "students", decimals: 0, suffix: "+" },
    { number: 150, key: "hours", decimals: 0, suffix: "+" },
    { number: 98, key: "successRate", decimals: 0, suffix: "%" },
    { number: 4.9, key: "rating", decimals: 1, suffix: "/5" },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      numbersRef.current.forEach((el, index) => {
        const target = stats[index];
        const finalNumber = target.number;

        gsap.fromTo(
          { value: 0 },
          { value: finalNumber, duration: 3, ease: "power2.out" },
          {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top center",
              toggleActions: "play none none reverse",
            },
            onUpdate: function () {
              if (el) {
                const currentValue = target.decimals
                  ? this.targets()[0].value.toFixed(target.decimals)
                  : Math.round(this.targets()[0].value).toString();
                
                // For Arabic numbers, convert if needed
                if (language === "ar") {
                  el.textContent = currentValue;
                } else {
                  el.textContent = currentValue;
                }
              }
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [language]); // Added language dependency

  return (
    <section
      ref={containerRef}
      className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900"
      data-testid="section-stats"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} data-testid={`stat-${index}`} className="p-4">
              <div className="mb-3 flex items-center justify-center gap-1">
                <div
                  ref={(el) => {
                    if (el) numbersRef.current[index] = el;
                  }}
                  className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400"
                >
                  0
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-2xl md:text-3xl">
                  {stat.suffix}
                </span>
              </div>
              <p className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-300">
                {t.stats[stat.key as keyof typeof t.stats]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";
import { Award, Users, Zap, Target } from "lucide-react";
import { useLanguage } from "@/lib/i18n"; // Using your custom hook instead of react-i18next

gsap.registerPlugin(ScrollTrigger);

export function WhoWeAre() {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  // Translation content
  const translations = {
    en: {
      title: "Who We Are",
      description: "A leading educational platform dedicated to empowering traders with professional financial market trading education and real-world market insights.",
      values: {
        excellence: {
          title: "Excellence",
          description: "Committed to delivering the highest quality educational content and support"
        },
        community: {
          title: "Community",
          description: "Building a supportive network of traders learning and growing together"
        },
        innovation: {
          title: "Innovation",
          description: "Continuously updating our methods with the latest market trends and technologies"
        },
        results: {
          title: "Results",
          description: "Focused on helping our students achieve tangible trading success"
        }
      }
    },
    ar: {
      title: "من نحن",
      description: "منصة تعليمية رائدة مخصصة لتمكين المتداولين بتعليم تداول الأسواق المالية المحترف ورؤى السوق الواقعية.",
      values: {
        excellence: {
          title: "التميز",
          description: "ملتزمون بتقديم أعلى جودة من المحتوى التعليمي والدعم"
        },
        community: {
          title: "المجتمع",
          description: "بناء شبكة داعمة من المتداولين الذين يتعلمون وينمون معًا"
        },
        innovation: {
          title: "الابتكار",
          description: "تحديث أساليبنا باستمرار بأحدث اتجاهات السوق والتقنيات"
        },
        results: {
          title: "النتائج",
          description: "تركز على مساعدة طلابنا في تحقيق نجاح تداول ملموس"
        }
      }
    }
  };

  const t = translations[language];

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
    <section
      ref={sectionRef}
      className="py-20 bg-white dark:bg-slate-900"
      data-testid="section-who-we-are"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="who-we-are-title text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
            {t.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            const valueData = t.values[value.key as keyof typeof t.values];

            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
              >
                <Card
                  className="p-6 h-full hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 text-center hover:scale-105"
                  data-testid={`value-card-${index}`}
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                    {valueData.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {valueData.description}
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
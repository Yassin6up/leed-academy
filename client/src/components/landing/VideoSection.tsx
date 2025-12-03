import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play, Users, Target, Award, Globe, Shield, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

export function VideoSection() {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Translation content - Focused on company story
  const translations = {
    en: {
      title: "Our Story",
      subtitle: "Discover the journey behind Leed Academy and how we're revolutionizing financial market trading education worldwide",
      story: {
        part1: "Founded by a team of professional traders with over 15 years of combined experience in financial markets",
        part2: "We've helped thousands of students from 50+ countries achieve their financial goals through comprehensive education",
        part3: "Our mission is to make professional trading education accessible to everyone, regardless of their background"
      },
      values: {
        expertise: "Expert Team",
        expertiseDesc: "Learn from certified traders with proven track records in financial markets",
        global: "Global Reach",
        globalDesc: "Serving students worldwide with multilingual support and localized content",
        trusted: "Trusted Education",
        trustedDesc: "Industry-recognized courses with certified completion certificates"
      },
      achievements: {
        students: "Students Worldwide",
        countries: "Countries Served",
        success: "Success Rate",
        years: "Years Experience"
      },
      cta: "Watch Our Story"
    },
    ar: {
      title: "قصتنا",
      subtitle: "اكتشف الرحلة وراء Leed Academy وكيف نحدث ثورة في تعليم تداول الأسواق المالية حول العالم",
      story: {
        part1: "تأسست من قبل فريق من المتداولين المحترفين بأكثر من 15 عامًا من الخبرة المشتركة في الأسواق المالية",
        part2: "لقد ساعدنا الآلاف من الطلاب من أكثر من 50 دولة في تحقيق أهدافهم المالية من خلال التعليم الشامل",
        part3: " مهمتنا هي جعل التعليم المهني للتداول في متناول الجميع، بغض النظر عن خلفياتهم التعلمية"
      },
      values: {
        expertise: "فريق خبراء",
        expertiseDesc: "تعلم من متداولين معتمدين بسجلات حافلة مثبتة في الأسواق المالية",
        global: "وصول عالمي",
        globalDesc: "نخدم الطلاب حول العالم بدعم متعدد اللغات ومحتوى مترجم",
        trusted: "تعليم موثوق",
        trustedDesc: "دورات معترف بها في الصناعة مع شهادات إتمام معتمدة"
      },
      achievements: {
        students: "طالب حول العالم",
        countries: "دولة نخدمها",
        success: "معدل النجاح",
        years: "سنوات خبرة"
      },
      cta: "شاهد قصتنا"
    }
  };

  const t = translations[language];

  const values = [
    {
      icon: Users,
      key: "expertise"
    },
    {
      icon: Globe,
      key: "global"
    },
    {
      icon: Shield,
      key: "trusted"
    }
  ];

  const achievements = [
    { number: 10000, key: "students", suffix: "+" },
    { number: 50, key: "countries", suffix: "+" },
    { number: 98, key: "success", suffix: "%" },
    { number: 5, key: "years", suffix: "+" }
  ];

  const storyPoints = [
    t.story.part1,
    t.story.part2,
    t.story.part3
  ];

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        ".story-title",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );

      // Story text animation
      gsap.fromTo(
        ".story-text",
        { opacity: 0, x: language === "ar" ? 50 : -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        }
      );

      // Video section animation
      gsap.fromTo(
        ".video-section",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 50%",
          },
        }
      );

      // Values animation
      gsap.fromTo(
        ".value-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 40%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [language]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20"
      data-testid="section-story"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
              <Award className="h-4 w-4" />
              {language === "en" ? "About Leed Academy" : "عن Leed Academy"}
            </div>
            <h2 className="story-title text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              {t.title}
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Story Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                {storyPoints.map((point, index) => (
                  <div
                    key={index}
                    className="story-text flex items-start gap-4 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="text-center p-4 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {achievement.number}{achievement.suffix}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {t.achievements[achievement.key as keyof typeof t.achievements]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Presentation */}
            <div className="video-section">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <div
                  ref={videoRef}
                  className="w-full bg-gradient-to-br from-blue-500 to-purple-600 aspect-video flex items-center justify-center relative group cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                  onClick={() => setIsPlaying(true)}
                  data-testid="video-container"
                >
                  {/* Company Story Thumbnail */}
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=675&fit=crop&crop=center"
                    alt="Leed Academy Team Story"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40 group-hover:from-black/70 group-hover:via-black/30 group-hover:to-black/50 transition-all duration-500" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="icon"
                      className="h-20 w-20 rounded-full bg-white/90 hover:bg-white text-blue-600 shadow-2xl hover:scale-110 transition-all duration-300 group/btn"
                      data-testid="button-play-video"
                    >
                      <Play className="h-8 w-8 fill-blue-600 group-hover/btn:fill-blue-700 ml-1" />
                    </Button>
                  </div>

                  {/* Video Title Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <h3 className="text-white text-lg font-semibold mb-2">
                      {language === "en" ? "Our Company Story" : "قصة شركتنا"}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {language === "en" ? "See how we're changing trading education" : "شاهد كيف نغير تعليم التداول"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center mt-6">
                <Button
                  onClick={() => setIsPlaying(true)}
                  className="px-8 py-3 text-lg font-semibold rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {t.cta}
                </Button>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="value-item group text-center p-8 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all duration-300"
                  data-testid={`value-item-${index}`}
                >
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {t.values[value.key as keyof typeof t.values]}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t.values[`${value.key}Desc` as keyof typeof t.values]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Modal */}
        {isPlaying && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setIsPlaying(false)}
            data-testid="video-modal"
          >
            <div
              className="bg-black rounded-xl w-full max-w-4xl aspect-video shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2 text-lg font-semibold"
              >
                {language === "en" ? "Close" : "إغلاق"} ×
              </button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/VIDEO_ID_HERE?autoplay=1"
                title="Leed Academy - Our Story"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-xl"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
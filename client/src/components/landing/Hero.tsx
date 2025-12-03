import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, BookOpen, Award, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import heroImage from "../../assets/Trading_hero_background_image_e876a55e.png";

export function Hero() {
  const { t, language } = useLanguage();

  const { data: stats } = useQuery<{
    userCount: number;
    courseCount: number;
    satisfactionRate: number;
    successStories: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const translations = {
    en: {
      title: "Master Professional Trading",
      subtitle: "Learn professional trading strategies from industry experts. Start your journey to financial freedom today.",
      trusted: "Trusted by traders in 50+ countries",
      cta: {
        start: "Start Learning",
        watch: "Watch Demo"
      },
      stats: {
        students: "Active Students",
        courses: "Expert Courses",
        satisfaction: "Satisfaction Rate",
        success: "Success Stories"
      },
      comingSoon: "Coming Soon"
    },
    ar: {
      title: "إتقان التداول المهني",
      subtitle: "تعلم استراتيجيات التداول المحترفة من خبراء الصناعة. ابدأ رحلتك الى الحرية المالية اليوم.",
      trusted: "موثوق به من قبل المتداولين في 50+ دولة",
      cta: {
        start: "ابدأ التعلم",
        watch: "شاهد التجربة"
      },
      stats: {
        students: "طالب نشط",
        courses: "دورة احترافية",
        satisfaction: "معدل الرضا",
        success: "قصة نجاح"
      },
      comingSoon: "قريباً"
    }
  };

  const tHero = translations[language];

  const statsData = [
    {
      icon: Users,
      value: stats?.userCount ? (stats.userCount > 1000 ? `${(stats.userCount / 1000).toFixed(1)}K` : stats.userCount) : "10K",
      label: tHero.stats.students,
      suffix: "+",
      comingSoon: !stats?.userCount
    },
    {
      icon: BookOpen,
      value: stats?.courseCount || "50",
      label: tHero.stats.courses,
      suffix: "+",
      comingSoon: !stats?.courseCount
    },
    {
      icon: Award,
      value: stats?.satisfactionRate || "98",
      label: tHero.stats.satisfaction,
      suffix: "%",
      comingSoon: !stats?.satisfactionRate
    },
    {
      icon: TrendingUp,
      value: stats?.successStories ? (stats.successStories > 1000 ? `${(stats.successStories / 1000).toFixed(1)}K` : stats.successStories) : "2.5K",
      label: tHero.stats.success,
      suffix: "+",
      comingSoon: !stats?.successStories
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Clean Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Trading Education"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900" />
      </div>

      {/* Main Content - Centered */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Main Heading */}
          <div className="mb-8">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
              data-testid="text-hero-title"
            >
              {tHero.title}
            </h1>
            <p
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
              data-testid="text-hero-subtitle"
            >
              {tHero.subtitle}
            </p>
          </div>

          {/* CTA Buttons - Centered */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              asChild
              size="lg"
              className="px-8 py-3 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              data-testid="button-hero-primary"
            >
              <Link href="/courses" className="flex items-center gap-2">
                {tHero.cta.start}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-3 text-base font-semibold rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              data-testid="button-hero-secondary"
            >
              <Link href="/about" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                {tHero.cta.watch}
              </Link>
            </Button>
          </div>

          {/* Clean Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-12">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700"
                data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.comingSoon ? (
                    <span className="text-slate-400 text-sm">
                      {tHero.comingSoon}
                    </span>
                  ) : (
                    <>
                      {stat.value}
                      {stat.suffix}
                    </>
                  )}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Simple Trust Badge */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {tHero.trusted}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
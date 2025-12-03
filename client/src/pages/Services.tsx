import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Video, Calendar, LineChart, Users, Shield, CheckCircle, Star, Zap, Target, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Services() {
  const { language } = useLanguage();

  const translations = {
    en: {
      hero: {
        title: "Our Services",
        subtitle: "Comprehensive educational services designed to help you master financial market trading and achieve financial success"
      },
      services: {
        title: "What We Offer",
        subtitle: "Professional trading education with proven results"
      },
      features: {
        title: "Why Choose Us",
        subtitle: "Experience the difference with our unique approach"
      },
      process: {
        title: "How It Works",
        subtitle: "Simple steps to start your trading journey"
      },
      cta: {
        title: "Ready to Get Started?",
        subtitle: "Join thousands of students transforming their lives through professional education",
        button: "Explore Courses"
      }
    },
    ar: {
      hero: {
        title: "خدماتنا",
        subtitle: "خدمات تعليمية شاملة مصممة لمساعدتك في إتقان تداول الأسواق المالية وتحقيق النجاح المالي"
      },
      services: {
        title: "ما نقدمه",
        subtitle: "تعليم تداول محترف بنتائج مثبتة"
      },
      features: {
        title: "لماذا تختارنا",
        subtitle: "جرب الفرق مع نهجنا الفريد"
      },
      process: {
        title: "كيف تعمل",
        subtitle: "خطوات بسيطة لبدء رحلتك في التداول"
      },
      cta: {
        title: "جاهز للبدء؟",
        subtitle: "انضم إلى آلاف الطلاب الذين يحولون حياتهم من خلال التعليم المهني",
        button: "استكشف الدورات"
      }
    }
  };

  const t = translations[language];

  const services = [
    {
      icon: BookOpen,
      title: language === "ar" ? "دورات شاملة" : "Comprehensive Courses",
      description: language === "ar"
        ? "دورات منظمة بعناية تغطي جميع جوانب تداول الأسواق المالية"
        : "Carefully structured courses covering all aspects of financial market trading",
      features: [
        language === "ar" ? "محتوى عالي الجودة" : "High-quality content",
        language === "ar" ? "تحديثات منتظمة" : "Regular updates",
        language === "ar" ? "أمثلة عملية" : "Practical examples",
      ],
      color: "blue"
    },
    {
      icon: Video,
      title: language === "ar" ? "فيديوهات تعليمية" : "Educational Videos",
      description: language === "ar"
        ? "فيديوهات عالية الجودة مع شرح مفصل وأمثلة واقعية"
        : "High-quality videos with detailed explanations and real-world examples",
      features: [
        language === "ar" ? "دقة عالية" : "High definition",
        language === "ar" ? "ترجمة ثنائية" : "Bilingual subtitles",
        language === "ar" ? "وصول مدى الحياة" : "Lifetime access",
      ],
      color: "green"
    },
    {
      icon: Calendar,
      title: language === "ar" ? "جلسات مباشرة" : "Live Sessions",
      description: language === "ar"
        ? "جلسات تفاعلية مباشرة مع المدربين للإجابة على أسئلتك"
        : "Interactive live sessions with instructors to answer your questions",
      features: [
        language === "ar" ? "تفاعل مباشر" : "Direct interaction",
        language === "ar" ? "أسئلة وأجوبة" : "Q&A sessions",
        language === "ar" ? "تسجيلات متاحة" : "Recordings available",
      ],
      color: "purple"
    },
    {
      icon: LineChart,
      title: language === "ar" ? "تحليل السوق" : "Market Analysis",
      description: language === "ar"
        ? "بيانات السوق في الوقت الفعلي وتحليلات من الخبراء"
        : "Real-time market data and expert analysis",
      features: [
        language === "ar" ? "أسعار مباشرة" : "Live prices",
        language === "ar" ? "تنبيهات فورية" : "Instant alerts",
        language === "ar" ? "رؤى الخبراء" : "Expert insights",
      ],
      color: "orange"
    },
    {
      icon: Users,
      title: language === "ar" ? "مجتمع نشط" : "Active Community",
      description: language === "ar"
        ? "انضم إلى مجتمع من المتداولين المتحمسين وشارك الخبرات"
        : "Join a community of passionate traders and share experiences",
      features: [
        language === "ar" ? "منتديات نقاش" : "Discussion forums",
        language === "ar" ? "مشاركة الأفكار" : "Idea sharing",
        language === "ar" ? "دعم الأقران" : "Peer support",
      ],
      color: "indigo"
    },
    {
      icon: Shield,
      title: language === "ar" ? "دعم مخصص" : "Dedicated Support",
      description: language === "ar"
        ? "فريق دعم متاح على مدار الساعة لمساعدتك في رحلتك"
        : "24/7 support team available to help you in your journey",
      features: [
        language === "ar" ? "استجابة سريعة" : "Quick response",
        language === "ar" ? "دعم فني" : "Technical support",
        language === "ar" ? "إرشاد شخصي" : "Personal guidance",
      ],
      color: "red"
    },
  ];

  const features = [
    {
      icon: Star,
      title: language === "ar" ? "جودة مضمونة" : "Quality Guaranteed",
      description: language === "ar"
        ? "محتوياتنا مصممة من قبل خبراء الصناعة مع سنوات من الخبرة"
        : "Our content is designed by industry experts with years of experience"
    },
    {
      icon: Zap,
      title: language === "ar" ? "نتائج سريعة" : "Fast Results",
      description: language === "ar"
        ? "اطبق ما تتعلمه فوراً واشهد النتائج في وقت قياسي"
        : "Apply what you learn immediately and see results in record time"
    },
    {
      icon: Target,
      title: language === "ar" ? "أهداف واضحة" : "Clear Goals",
      description: language === "ar"
        ? "مسار تعليمي واضح مع أهداف قابلة للتحقيق في كل مرحلة"
        : "Clear learning path with achievable goals at every stage"
    },
    {
      icon: Clock,
      title: language === "ar" ? "مرونة زمنية" : "Time Flexibility",
      description: language === "ar"
        ? "تعلم في الوقت الذي يناسبك مع محتوى متاح 24/7"
        : "Learn at your own pace with 24/7 available content"
    },
    {
      icon: Globe,
      title: language === "ar" ? "دعم عالمي" : "Global Support",
      description: language === "ar"
        ? "فريق دعم متاح بلغات متعددة لخدمتك في أي وقت"
        : "Multilingual support team available to serve you anytime"
    },
    {
      icon: CheckCircle,
      title: language === "ar" ? "شهادات معتمدة" : "Certified Certificates",
      description: language === "ar"
        ? "احصل على شهادات معترف بها في نهاية كل دورة"
        : "Get recognized certificates upon completion of each course"
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: language === "ar" ? "اختر دورتك" : "Choose Your Course",
      description: language === "ar"
        ? "اختر من بين مجموعة دوراتنا المصممة لمستواك وأهدافك"
        : "Select from our range of courses designed for your level and goals"
    },
    {
      step: "02",
      title: language === "ar" ? "ابدأ التعلم" : "Start Learning",
      description: language === "ar"
        ? "الوصول الفوري للمحتوى وابدأ رحلتك التعليمية"
        : "Instant access to content and begin your learning journey"
    },
    {
      step: "03",
      title: language === "ar" ? "طبق المهارات" : "Apply Skills",
      description: language === "ar"
        ? "طبق ما تعلمته في بيئة تداول حقيقية تحت الإشراف"
        : "Apply what you've learned in a real trading environment under guidance"
    },
    {
      step: "04",
      title: language === "ar" ? "احصل على الشهادة" : "Get Certified",
      description: language === "ar"
        ? "احصل على شهادتك المعتمدة وابدأ مسيرتك المهنية"
        : "Receive your certified certificate and start your professional journey"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                {t.hero.title}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                {t.hero.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t.services.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {t.services.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-transparent hover:scale-105"
                >
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${getColorClasses(service.color)}`}>
                      <service.icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t.features.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {t.features.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t.process.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {t.process.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Connecting Line */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-blue-200 dark:bg-blue-800 z-0" />
                  )}

                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t.cta.title}
              </h2>
              <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                {t.cta.subtitle}
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 text-lg font-semibold rounded-lg"
              >
                <Link href="/courses">
                  {t.cta.button}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
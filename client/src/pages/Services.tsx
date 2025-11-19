import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Video, Calendar, LineChart, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Services() {
  const { language } = useLanguage();

  const services = [
    {
      icon: BookOpen,
      title: language === "ar" ? "دورات شاملة" : "Comprehensive Courses",
      description:
        language === "ar"
          ? "دورات منظمة بعناية تغطي جميع جوانب تداول العملات الرقمية"
          : "Carefully structured courses covering all aspects of cryptocurrency trading",
      features: [
        language === "ar" ? "محتوى عالي الجودة" : "High-quality content",
        language === "ar" ? "تحديثات منتظمة" : "Regular updates",
        language === "ar" ? "أمثلة عملية" : "Practical examples",
      ],
    },
    {
      icon: Video,
      title: language === "ar" ? "فيديوهات تعليمية" : "Educational Videos",
      description:
        language === "ar"
          ? "فيديوهات عالية الجودة مع شرح مفصل وأمثلة واقعية"
          : "High-quality videos with detailed explanations and real-world examples",
      features: [
        language === "ar" ? "دقة عالية" : "High definition",
        language === "ar" ? "ترجمة ثنائية" : "Bilingual subtitles",
        language === "ar" ? "وصول مدى الحياة" : "Lifetime access",
      ],
    },
    {
      icon: Calendar,
      title: language === "ar" ? "جلسات Zoom مباشرة" : "Live Zoom Sessions",
      description:
        language === "ar"
          ? "جلسات تفاعلية مباشرة مع المدربين للإجابة على أسئلتك"
          : "Interactive live sessions with instructors to answer your questions",
      features: [
        language === "ar" ? "تفاعل مباشر" : "Direct interaction",
        language === "ar" ? "أسئلة وأجوبة" : "Q&A sessions",
        language === "ar" ? "تسجيلات متاحة" : "Recordings available",
      ],
    },
    {
      icon: LineChart,
      title: language === "ar" ? "تحليل السوق المباشر" : "Live Market Analysis",
      description:
        language === "ar"
          ? "بيانات السوق في الوقت الفعلي وتحليلات من الخبراء"
          : "Real-time market data and expert analysis",
      features: [
        language === "ar" ? "أسعار مباشرة" : "Live prices",
        language === "ar" ? "تنبيهات" : "Alerts",
        language === "ar" ? "رؤى الخبراء" : "Expert insights",
      ],
    },
    {
      icon: Users,
      title: language === "ar" ? "مجتمع نشط" : "Active Community",
      description:
        language === "ar"
          ? "انضم إلى مجتمع من المتداولين المتحمسين وشارك الخبرات"
          : "Join a community of passionate traders and share experiences",
      features: [
        language === "ar" ? "منتديات نقاش" : "Discussion forums",
        language === "ar" ? "مشاركة الأفكار" : "Idea sharing",
        language === "ar" ? "دعم الأقران" : "Peer support",
      ],
    },
    {
      icon: Shield,
      title: language === "ar" ? "دعم مخصص" : "Dedicated Support",
      description:
        language === "ar"
          ? "فريق دعم متاح على مدار الساعة لمساعدتك"
          : "24/7 support team available to help you",
      features: [
        language === "ar" ? "استجابة سريعة" : "Quick response",
        language === "ar" ? "دعم فني" : "Technical support",
        language === "ar" ? "إرشاد شخصي" : "Personal guidance",
      ],
    },
  ];

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
                data-testid="text-services-title"
              >
                {language === "ar" ? "خدماتنا" : "Our Services"}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {language === "ar"
                  ? "نقدم مجموعة شاملة من الخدمات التعليمية المصممة لمساعدتك على إتقان تداول العملات الرقمية"
                  : "We offer a comprehensive range of educational services designed to help you master cryptocurrency trading"}
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="hover-elevate active-elevate-2 transition-all"
                  data-testid={`card-service-${index}`}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
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

        {/* CTA Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                {language === "ar"
                  ? "جاهز للبدء؟"
                  : "Ready to Get Started?"}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {language === "ar"
                  ? "انضم إلى آلاف الطلاب الذين يحولون حياتهم من خلال التعليم المهني"
                  : "Join thousands of students transforming their lives through professional education"}
              </p>
              <Button asChild size="lg">
                <Link href="/courses">
                  <a data-testid="button-services-cta">
                    {language === "ar"
                      ? "استكشف الدورات"
                      : "Explore Courses"}
                  </a>
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

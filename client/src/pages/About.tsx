import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Award, TrendingUp, Globe, BookOpen, Shield } from "lucide-react";

export default function About() {
  const { language } = useLanguage();

  const values = [
    {
      icon: Target,
      title: language === "ar" ? "مهمتنا" : "Our Mission",
      description:
        language === "ar"
          ? "تمكين المتداولين بالمعرفة والمهارات اللازمة للنجاح في الأسواق المالية"
          : "Empowering traders with the knowledge and skills needed to succeed in financial markets",
    },
    {
      icon: Users,
      title: language === "ar" ? "فريقنا" : "Our Team",
      description:
        language === "ar"
          ? "خبراء متخصصون بسنوات من الخبرة في التداول والتحليل المالي"
          : "Specialized experts with years of experience in trading and financial analysis",
    },
    {
      icon: Award,
      title: language === "ar" ? "التميز" : "Excellence",
      description:
        language === "ar"
          ? "نلتزم بتقديم أعلى جودة من المحتوى التعليمي والدعم"
          : "Committed to delivering the highest quality educational content and support",
    },
    {
      icon: TrendingUp,
      title: language === "ar" ? "النمو" : "Growth",
      description:
        language === "ar"
          ? "نساعد طلابنا على النمو المستمر وتحقيق أهدافهم المالية"
          : "Helping our students grow continuously and achieve their financial goals",
    },
  ];

  const stats = [
    {
      number: "10,000+",
      label: language === "ar" ? "طالب" : "Students",
      icon: Users,
    },
    {
      number: "50+",
      label: language === "ar" ? "دورة" : "Courses",
      icon: BookOpen,
    },
    {
      number: "25+",
      label: language === "ar" ? "دولة" : "Countries",
      icon: Globe,
    },
    {
      number: "98%",
      label: language === "ar" ? "رضا العملاء" : "Satisfaction Rate",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-28 bg-gradient-to-br from-primary/5 via-background to-muted/30 overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="container mx-auto px-6 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="text-sm font-medium text-primary">
                  {language === "ar" ? "منصة التعليم الرائدة" : "Leading Educational Platform"}
                </span>
              </div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground mb-6 leading-tight"
                data-testid="text-about-title"
              >
                {language === "ar" ? "من نحن" : "About Us"}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto" data-testid="text-about-description">
                {language === "ar"
                  ? "Leed Academy هي منصة تعليمية رائدة متخصصة في تعليم تداول الأسواق المالية. نحن نؤمن بأن التعليم الجيد هو مفتاح النجاح في عالم التداول المتطور باستمرار."
                  : "Leed Academy is a leading educational platform specialized in financial market trading education. We believe that quality education is the key to success in the ever-evolving world of trading."}
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
                {language === "ar" ? "قيمنا" : "Our Values"}
              </h2>
              <p className="text-lg text-muted-foreground">
                {language === "ar"
                  ? "الأساس الذي تقوم عليه رؤيتنا ونهجنا في التعليم"
                  : "The foundation of our vision and approach to education"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-background shadow-md hover:-translate-y-2"
                  data-testid={`card-value-${index}`}
                >
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-4">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 bg-gradient-to-br from-muted/50 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-dots-slate-300 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))]" />
          <div className="container mx-auto px-6 relative">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                    <span className="text-sm font-medium text-primary">
                      {language === "ar" ? "رحلة النجاح" : "Our Journey"}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-8 leading-tight">
                    {language === "ar" ? "قصتنا" : "Our Story"}
                  </h2>
                  <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                    <p>
                      {language === "ar"
                        ? "تأسست Leed Academy من قبل مجموعة من المتداولين المحترفين الذين أرادوا مشاركة معرفتهم وخبرتهم مع المتداولين الطموحين في جميع أنحاء العالم. لقد رأينا الحاجة إلى منصة تعليمية شاملة تجمع بين التعليم النظري والتطبيق العملي."
                        : "Leed Academy was founded by a group of professional traders who wanted to share their knowledge and experience with aspiring traders worldwide. We saw the need for a comprehensive educational platform that combines theoretical education with practical application."}
                    </p>
                    <p>
                      {language === "ar"
                        ? "اليوم، نفخر بخدمة آلاف الطلاب من مختلف أنحاء العالم، ونقدم دورات متخصصة في جميع جوانب تداول الأسواق المالية، من الأساسيات إلى الاستراتيجيات المتقدمة."
                        : "Today, we're proud to serve thousands of students from around the world, offering specialized courses in all aspects of financial market trading, from fundamentals to advanced strategies."}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 aspect-square flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <TrendingUp className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-4">
                        {language === "ar" ? "رؤيتنا للمستقبل" : "Our Vision Forward"}
                      </h3>
                      <p className="text-muted-foreground">
                        {language === "ar"
                          ? "نسعى لأن نكون الشريك التعليمي المفضل لكل متداول طموح حول العالم"
                          : "We strive to be the preferred educational partner for every aspiring trader worldwide"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                {language === "ar" ? "انضم إلى رحلتنا" : "Join Our Journey"}
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                {language === "ar"
                  ? "ابدأ رحلتك في تعلم تداول الأسواق المالية مع منصة موثوقة وخبراء متمرسين"
                  : "Start your financial market trading learning journey with a trusted platform and experienced experts"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-background text-foreground rounded-lg font-semibold hover:bg-background/90 transition-colors">
                  {language === "ar" ? "استكشاف الدورات" : "Explore Courses"}
                </button>
                <button className="px-8 py-4 border-2 border-background text-background rounded-lg font-semibold hover:bg-background hover:text-primary transition-colors">
                  {language === "ar" ? "تواصل معنا" : "Contact Us"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Award, TrendingUp } from "lucide-react";

export default function About() {
  const { language } = useLanguage();

  const values = [
    {
      icon: Target,
      title: language === "ar" ? "مهمتنا" : "Our Mission",
      description:
        language === "ar"
          ? "تمكين المتداولين بالمعرفة والمهارات اللازمة للنجاح في أسواق العملات الرقمية"
          : "Empowering traders with the knowledge and skills needed to succeed in cryptocurrency markets",
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
                data-testid="text-about-title"
              >
                {language === "ar" ? "من نحن" : "About Us"}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-about-description">
                {language === "ar"
                  ? "أكاديمية TradeMaster هي منصة تعليمية رائدة متخصصة في تعليم تداول العملات الرقمية. نحن نؤمن بأن التعليم الجيد هو مفتاح النجاح في عالم التداول المتطور باستمرار."
                  : "TradeMaster Academy is a leading educational platform specialized in cryptocurrency trading education. We believe that quality education is the key to success in the ever-evolving world of trading."}
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-foreground mb-12">
              {language === "ar" ? "قيمنا" : "Our Values"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="hover-elevate active-elevate-2 transition-all"
                  data-testid={`card-value-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-8">
                {language === "ar" ? "قصتنا" : "Our Story"}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  {language === "ar"
                    ? "تأسست أكاديمية TradeMaster من قبل مجموعة من المتداولين المحترفين الذين أرادوا مشاركة معرفتهم وخبرتهم مع المتداولين الطموحين في جميع أنحاء العالم. لقد رأينا الحاجة إلى منصة تعليمية شاملة تجمع بين التعليم النظري والتطبيق العملي."
                    : "TradeMaster Academy was founded by a group of professional traders who wanted to share their knowledge and experience with aspiring traders worldwide. We saw the need for a comprehensive educational platform that combines theoretical education with practical application."}
                </p>
                <p>
                  {language === "ar"
                    ? "اليوم، نفخر بخدمة آلاف الطلاب من مختلف أنحاء العالم، ونقدم دورات متخصصة في جميع جوانب تداول العملات الرقمية، من الأساسيات إلى الاستراتيجيات المتقدمة."
                    : "Today, we're proud to serve thousands of students from around the world, offering specialized courses in all aspects of cryptocurrency trading, from fundamentals to advanced strategies."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

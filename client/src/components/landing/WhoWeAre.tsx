import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";
import { Award, Users, Zap, Target } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const values = [
  {
    icon: Award,
    title: "Excellence",
    ar_title: "التميز",
    description: "Industry-leading education standards",
    ar_description: "معايير تعليمية رائدة في الصناعة",
  },
  {
    icon: Users,
    title: "Community",
    ar_title: "المجتمع",
    description: "Supportive trader network",
    ar_description: "شبكة تاجرين داعمة",
  },
  {
    icon: Zap,
    title: "Innovation",
    ar_title: "الابتكار",
    description: "Cutting-edge trading strategies",
    ar_description: "استراتيجيات تداول متقدمة",
  },
  {
    icon: Target,
    title: "Results",
    ar_title: "النتائج",
    description: "Proven success methods",
    ar_description: "طرق نجاح مثبتة",
  },
];

export function WhoWeAre() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

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
    <section ref={sectionRef} className="py-20 bg-background" data-testid="section-who-we-are">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="who-we-are-title text-4xl md:text-5xl font-bold mb-4">
            Who We Are
          </h2>
          <h2 className="who-we-are-title text-4xl md:text-5xl font-bold mb-6 text-primary">
            من نحن
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            Welcome to Leedacademya, where we transform aspiring traders into
            market experts with professional-grade education and real-world
            strategies.
          </p>
          <p className="text-lg text-muted-foreground">
            مرحبا بك في أكاديمية ليد، حيث نحول المتداولين الطموحين إلى خبراء
            السوق بتعليم عالي المستوى واستراتيجيات حقيقية.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
              >
                <Card className="p-6 h-full hover-elevate text-center" data-testid={`value-card-${index}`}>
                  <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <h3 className="text-xl font-bold mb-4 text-primary">
                    {value.ar_title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {value.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {value.ar_description}
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

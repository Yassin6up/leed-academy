import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: "Ahmed Hassan",
    ar_name: "أحمد حسن",
    role: "Forex Trader",
    ar_role: "متداول فوركس",
    content:
      "Leedacademya transformed my trading journey. The strategies taught here are practical and profitable.",
    ar_content:
      "حولت أكاديمية ليد رحلتي في التداول. الاستراتيجيات المدرسة هنا عملية ومربحة.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    initials: "AH",
  },
  {
    name: "Sarah Johnson",
    ar_name: "سارة جونسون",
    role: "Crypto Investor",
    ar_role: "مستثمر عملات رقمية",
    content:
      "Best investment in my trading education. The mentors are exceptional and supportive.",
    ar_content:
      "أفضل استثمار في تعليمي للتداول. المدربون استثنائيون وداعمون جدا.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    initials: "SJ",
  },
  {
    name: "Mohammed Ali",
    ar_name: "محمد علي",
    role: "Stock Trader",
    ar_role: "متداول الأسهم",
    content:
      "Clear explanations, real-world examples, and consistent profits. Highly recommended!",
    ar_content:
      "شروحات واضحة وأمثلة حقيقية وأرباح مستمرة. أنصح بها بشدة!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    initials: "MA",
  },
  {
    name: "Emily Chen",
    ar_name: "إيميلي تشين",
    role: "Professional Trader",
    ar_role: "متداول محترف",
    content:
      "The community aspect is amazing. Learning together with other traders accelerates growth.",
    ar_content:
      "جانب المجتمع رائع جدا. التعلم مع متداولين آخرين يسرع النمو.",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    initials: "EC",
  },
];

export function EnhancedTestimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".testimonials-title",
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
      className="py-20 bg-muted/30"
      data-testid="section-enhanced-testimonials"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="testimonials-title text-4xl md:text-5xl font-bold mb-4">
            Success Stories
          </h2>
          <h2 className="testimonials-title text-4xl md:text-5xl font-bold mb-4 text-primary">
            قصص النجاح
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of traders who have transformed their financial
            futures with our platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
            >
              <Card
                className="p-6 h-full hover-elevate flex flex-col"
                data-testid={`testimonial-${index}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-foreground">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm font-semibold text-primary">
                        {testimonial.ar_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(testimonial.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : i < testimonial.rating
                            ? "fill-yellow-400 text-yellow-400 opacity-50"
                            : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-foreground mb-3 flex-grow">
                  "{testimonial.content}"
                </p>
                <p className="text-primary text-sm">
                  "{testimonial.ar_content}"
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

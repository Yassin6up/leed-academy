import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { number: 5000, label: "Students Worldwide", ar_label: "طالب حول العالم" },
  { number: 150, label: "Hours of Content", ar_label: "ساعة من المحتوى" },
  {
    number: 98,
    label: "Success Rate (%)",
    ar_label: "معدل النجاح (%)",
  },
  {
    number: 4.9,
    label: "Average Rating",
    ar_label: "متوسط التقييم",
    decimals: 1,
  },
];

export function StatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const numbersRef = useRef<HTMLDivElement[]>([]);

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
                el.textContent = target.decimals
                  ? this.targets()[0].value.toFixed(target.decimals)
                  : Math.round(this.targets()[0].value).toString();
              }
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10"
      data-testid="section-stats"
    >
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} data-testid={`stat-${index}`}>
              <div className="mb-3">
                <div
                  ref={(el) => {
                    if (el) numbersRef.current[index] = el;
                  }}
                  className="text-5xl font-bold text-primary"
                >
                  0
                </div>
                <span className="text-primary text-3xl">+</span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {stat.label}
              </p>
              <p className="text-sm text-muted-foreground">{stat.ar_label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

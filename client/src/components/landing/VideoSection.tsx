import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

export function VideoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".video-section-content",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        }
      );

      gsap.fromTo(
        ".video-play-button",
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay: 0.3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"
      data-testid="section-video"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Watch Our Story
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              شاهد قصتنا
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover how traders transform their success with our platform
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            <div
              ref={videoRef}
              className="video-section-content w-full bg-muted/50 aspect-video flex items-center justify-center relative group cursor-pointer"
              onClick={() => setIsPlaying(true)}
              data-testid="video-container"
            >
              <img
                src="https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=1200&h=675&fit=crop"
                alt="Trading platform"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />

              <Button
                size="icon"
                className="video-play-button absolute h-20 w-20 rounded-full bg-primary hover:bg-primary/90"
                data-testid="button-play-video"
              >
                <Play className="h-8 w-8 fill-white" />
              </Button>
            </div>

            {isPlaying && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                onClick={() => setIsPlaying(false)}
                data-testid="video-modal"
              >
                <div
                  className="bg-black rounded-lg w-11/12 max-w-4xl aspect-video"
                  onClick={(e) => e.stopPropagation()}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Leedacademya Introduction"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Live Sessions",
                ar_title: "جلسات مباشرة",
                desc: "Real-time market analysis",
                ar_desc: "تحليل السوق في الوقت الفعلي",
              },
              {
                title: "Expert Mentors",
                ar_title: "مدربون خبراء",
                desc: "Learn from industry pros",
                ar_desc: "التعلم من محترفي الصناعة",
              },
              {
                title: "24/7 Support",
                ar_title: "دعم 24/7",
                desc: "Always here to help",
                ar_desc: "نحن هنا للمساعدة دائما",
              },
            ].map((item, index) => (
              <div key={index} className="text-center" data-testid={`video-benefit-${index}`}>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <h3 className="text-lg font-bold mb-3 text-primary">
                  {item.ar_title}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {item.desc}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.ar_desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

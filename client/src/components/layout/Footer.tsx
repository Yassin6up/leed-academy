import { useLanguage } from "@/lib/i18n";
import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-card-border mt-24">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-heading font-bold text-foreground mb-4">
              Leedacademya
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === "en"
                ? "Empowering traders with professional education and real-time market insights."
                : "تمكين المتداولين بالتعليم المهني ورؤى السوق في الوقت الفعلي."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {language === "en" ? "Quick Links" : "روابط سريعة"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/about" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm" 
                  data-testid="footer-link-about"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link 
                  href="/courses" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm" 
                  data-testid="footer-link-courses"
                >
                  {t("nav.courses")}
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm" 
                  data-testid="footer-link-pricing"
                >
                  {t("nav.pricing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {language === "en" ? "Support" : "الدعم"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/contact" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm" 
                  data-testid="footer-link-contact"
                >
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  data-testid="footer-link-faq"
                >
                  {language === "en" ? "FAQ" : "الأسئلة الشائعة"}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  data-testid="footer-link-terms"
                >
                  {language === "en" ? "Terms of Service" : "شروط الخدمة"}
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {language === "en" ? "Connect" : "تواصل معنا"}
            </h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-muted hover-elevate active-elevate-2"
                aria-label="Facebook"
                data-testid="link-social-facebook"
              >
                <Facebook className="h-5 w-5 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-muted hover-elevate active-elevate-2"
                aria-label="Twitter"
                data-testid="link-social-twitter"
              >
                <Twitter className="h-5 w-5 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-muted hover-elevate active-elevate-2"
                aria-label="LinkedIn"
                data-testid="link-social-linkedin"
              >
                <Linkedin className="h-5 w-5 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-muted hover-elevate active-elevate-2"
                aria-label="Instagram"
                data-testid="link-social-instagram"
              >
                <Instagram className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} TradeMaster Academy.{" "}
            {language === "en" ? "All rights reserved." : "جميع الحقوق محفوظة."}
          </p>
        </div>
      </div>
    </footer>
  );
}

import { useLanguage } from "@/lib/i18n";
import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Instagram, X, Youtube } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Footer() {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  const termsContent = {
    en: `
      <h3>Terms of Service</h3>
      <p><strong>Last Updated: ${new Date().toLocaleDateString('en-US')}</strong></p>
      
      <h4>1. Acceptance of Terms</h4>
      <p>By accessing and using Leed Academy, you accept and agree to be bound by the terms and provision of this agreement.</p>
      
      <h4>2. Educational Purpose</h4>
      <p>Our platform provides educational content about financial market trading. This is not financial advice. Trading involves risk and you should only trade with money you can afford to lose.</p>
      
      <h4>3. User Responsibilities</h4>
      <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
      
      <h4>4. Payment and Refunds</h4>
      <p>All payments are processed securely. Refund policies vary by course and are clearly stated at the time of purchase.</p>
      
      <h4>5. Intellectual Property</h4>
      <p>All course materials, videos, and content are the intellectual property of Leed Academy and may not be redistributed without permission.</p>
      
      <h4>6. Limitation of Liability</h4>
      <p>Leed Academy shall not be liable for any trading losses or damages resulting from the use of our educational materials.</p>
    `,
    ar: `
      <h3>شروط الخدمة</h3>
      <p><strong>آخر تحديث: ${new Date().toLocaleDateString('ar-EG')}</strong></p>
      
      <h4>1. قبول الشروط</h4>
      <p>باستخدامك لمنصة Leed Academy، فإنك توافق على الالتزام بالشروط والأحكام الواردة في هذه الاتفاقية.</p>
      
      <h4>2. الغرض التعليمي</h4>
      <p>توفر منصتنا محتوى تعليميًا حول تداول الأسواق المالية. هذا ليس نصيحة مالية. التداول ينطوي على مخاطر ويجب أن تتداول فقط بالأموال التي يمكنك تحمل خسارتها.</p>
      
      <h4>3. مسؤوليات المستخدم</h4>
      <p>أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور الخاصة بك. توافق على تحمل المسؤولية عن جميع الأنشطة التي تتم تحت حسابك.</p>
      
      <h4>4. الدفع والاسترداد</h4>
      <p>جميع المدفوعات تتم معالجتها بأمان. تختلف سياسات الاسترداد حسب الدورة ويتم ذكرها بوضوح عند الشراء.</p>
      
      <h4>5. الملكية الفكرية</h4>
      <p>جميع المواد التعليمية والفيديوهات والمحتوى هي ملكية فكرية لـ Leed Academy ولا يجوز إعادة توزيعها دون إذن.</p>
      
      <h4>6. limitation المسؤولية</h4>
      <p>لا تتحمل Leed Academy المسؤولية عن أي خسائر تداول أو أضرار ناتجة عن استخدام المواد التعليمية.</p>
    `
  };

  const faqContent = {
    en: [
      {
        question: "How do I get started with the courses?",
        answer: "Simply create an account, choose your desired course, and start learning immediately. All courses are available 24/7."
      },
      {
        question: "Do I need prior trading experience?",
        answer: "No, we offer courses for all levels - from complete beginners to advanced traders. Each course clearly indicates the required skill level."
      },
      {
        question: "Are the courses available in Arabic?",
        answer: "Yes, all our courses are available in both English and Arabic with bilingual subtitles and support materials."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept credit cards, PayPal, and various digital payments for your convenience."
      },
      {
        question: "Can I get a refund if I'm not satisfied?",
        answer: "We offer a 30-day money-back guarantee for most courses. Please check the specific refund policy for each course."
      },
      {
        question: "Is there any certification provided?",
        answer: "Yes, upon successful completion of any course, you will receive a certified digital certificate that you can share with employers."
      }
    ],
    ar: [
      {
        question: "كيف أبدأ في الدورات؟",
        answer: "ما عليك سوى إنشاء حساب، واختيار الدورة التي تريدها، والبدء في التعلم فورًا. جميع الدورات متاحة على مدار الساعة."
      },
      {
        question: "هل أحتاج إلى خبرة سابقة في التداول؟",
        answer: "لا، نحن نقدم دورات لجميع المستويات - من المبتدئين تمامًا إلى المتداولين المتقدمين. كل دورة توضح مستوى المهارة المطلوب."
      },
      {
        question: "هل الدورات متاحة باللغة العربية؟",
        answer: "نعم، جميع دوراتنا متاحة باللغتين الإنجليزية والعربية مع ترجمات ثنائية اللغة ومواد دعم."
      },
      {
        question: "ما هي طرق الدفع التي تقبلونها؟",
        answer: "نقبل بطاقات الائتمان، PayPal، ومختلف المدفوعات الرقمية لتسهيل الأمر عليك."
      },
      {
        question: "هل يمكنني الحصول على استرداد إذا لم أكن راضيًا؟",
        answer: "نحن نقدم ضمان استرداد الأموال لمدة 30 يومًا لمعظم الدورات. يرجى التحقق من سياسة الاسترداد المحددة لكل دورة."
      },
      {
        question: "هل يتم توفير أي شهادات؟",
        answer: "نعم، بعد الانتهاء بنجاح من أي دورة، ستتلقى شهادة رقمية معتمدة يمكنك مشاركتها مع أصحاب العمل."
      }
    ]
  };

  return (
    <>
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Leed Academy
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {language === "en"
                  ? "Empowering traders with professional education and real-time market insights. Start your journey to financial freedom today."
                  : "تمكين المتداولين بالتعليم المهني ورؤى السوق في الوقت الفعلي. ابدأ رحلتك نحو الحرية المالية اليوم."}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                {language === "en" ? "Quick Links" : "روابط سريعة"}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm block py-1"
                    data-testid="footer-link-about"
                  >
                    {t("nav.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses"
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm block py-1"
                    data-testid="footer-link-courses"
                  >
                    {t("nav.courses")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm block py-1"
                    data-testid="footer-link-pricing"
                  >
                    {t("nav.pricing")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                {language === "en" ? "Support" : "الدعم"}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/contact"
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm block py-1"
                    data-testid="footer-link-contact"
                  >
                    {t("nav.contact")}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setIsFaqOpen(true)}
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm text-left block py-1 w-full"
                    data-testid="footer-link-faq"
                  >
                    {language === "en" ? "FAQ" : "الأسئلة الشائعة"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsTermsOpen(true)}
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm text-left block py-1 w-full"
                    data-testid="footer-link-terms"
                  >
                    {language === "en" ? "Terms of Service" : "شروط الخدمة"}
                  </button>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                {language === "en" ? "Connect With Us" : "تواصل معنا"}
              </h4>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/share/16M6vBoLBm/"
                  className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
                  aria-label="Facebook"
                  data-testid="link-social-facebook"
                >
                  <Facebook className="h-5 w-5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" />
                </a>
                <a
                  href="https://www.youtube.com/@LeedMarkets-j5r1n"
                  className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
                  aria-label="Twitter"
                  data-testid="link-social-twitter"
                >
                  <Youtube className="h-5 w-5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" />
                </a>
                {/* <a
                  href="#"
                  className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
                  aria-label="LinkedIn"
                  data-testid="link-social-linkedin"
                >
                   <Telegram className="h-5 w-5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" /> 
                </a> */}
                <a
                  href="https://www.instagram.com/leed.markets?igsh=MXQya3I3cmtmcW95cw=="
                  className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
                  aria-label="Instagram"
                  data-testid="link-social-instagram"
                >
                  <Instagram className="h-5 w-5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" />
                </a>
              </div>


            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 mt-12 pt-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © {currentYear} Leed Academy.{" "}
              {language === "en" ? "All rights reserved." : "جميع الحقوق محفوظة."}
            </p>
          </div>
        </div>
      </footer>

      {/* Terms of Service Modal */}
      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{language === "en" ? "Terms of Service" : "شروط الخدمة"}</span>
              <button
                onClick={() => setIsTermsOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: termsContent[language] }}
          />
        </DialogContent>
      </Dialog>

      {/* FAQ Modal */}
      <Dialog open={isFaqOpen} onOpenChange={setIsFaqOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{language === "en" ? "Frequently Asked Questions" : "الأسئلة الشائعة"}</span>
              <button
                onClick={() => setIsFaqOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {faqContent[language].map((item, index) => (
              <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1">
                    {index + 1}
                  </span>
                  {item.question}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed ml-9">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
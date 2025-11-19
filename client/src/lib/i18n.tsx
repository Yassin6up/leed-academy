import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.courses": "Courses",
    "nav.pricing": "Pricing",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Admin Panel",
    
    // Hero
    "hero.title": "Master Cryptocurrency Trading",
    "hero.subtitle": "Learn from industry experts and transform your trading journey with comprehensive courses and live market analysis",
    "hero.cta.primary": "Start Learning",
    "hero.cta.secondary": "Explore Courses",
    
    // Features
    "features.title": "Why Choose Leedacademya",
    "features.expert.title": "Expert Instructors",
    "features.expert.desc": "Learn from certified professionals with years of trading experience",
    "features.live.title": "Live Market Data",
    "features.live.desc": "Real-time cryptocurrency prices and market analysis",
    "features.progress.title": "Track Progress",
    "features.progress.desc": "Monitor your learning journey with detailed analytics",
    "features.support.title": "24/7 Support",
    "features.support.desc": "Get help whenever you need it from our dedicated team",
    
    // Testimonials
    "testimonials.title": "What Our Students Say",
    
    // Courses
    "courses.title": "Our Courses",
    "courses.level": "Level",
    "courses.free": "Free",
    "courses.locked": "Locked",
    "courses.enrolled": "Enrolled",
    "courses.lessons": "Lessons",
    "courses.hours": "Hours",
    "courses.enroll": "Enroll Now",
    "courses.continue": "Continue Learning",
    "courses.filter.all": "All Courses",
    "courses.filter.free": "Free",
    "courses.filter.level": "Level",
    
    // Pricing
    "pricing.title": "Choose Your Plan",
    "pricing.monthly": "Monthly",
    "pricing.popular": "Most Popular",
    "pricing.select": "Select Plan",
    "pricing.features": "Features",
    
    // Contact
    "contact.title": "Get In Touch",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Send Message",
    
    // Dashboard
    "dashboard.welcome": "Welcome back",
    "dashboard.stats.enrolled": "Enrolled Courses",
    "dashboard.stats.completed": "Completed",
    "dashboard.stats.hours": "Hours Watched",
    "dashboard.stats.progress": "Overall Progress",
    "dashboard.my-courses": "My Courses",
    "dashboard.continue-learning": "Continue Learning",
    
    // Subscription
    "subscription.choose-plan": "Choose a Plan",
    "subscription.payment-method": "Payment Method",
    "subscription.upload-proof": "Upload Proof",
    "subscription.crypto": "Cryptocurrency",
    "subscription.bank": "Bank Transfer",
    "subscription.submit": "Submit Payment",
    "subscription.pending": "Payment Pending",
    "subscription.title": "My Subscription",
    "subscription.current-plan": "Current Plan",
    "subscription.status": "Status",
    "subscription.status.active": "Active",
    "subscription.status.pending": "Pending Approval",
    "subscription.status.expired": "Expired",
    "subscription.status.inactive": "Inactive",
    "subscription.expires": "Expires",
    "subscription.expired-on": "Expired on",
    "subscription.started": "Started",
    "subscription.upgrade": "Upgrade Plan",
    "subscription.change": "Change Plan",
    "subscription.no-subscription": "No Active Subscription",
    "subscription.no-subscription-desc": "You don't have an active subscription yet. Choose a plan to unlock premium courses and features.",
    "subscription.view-plans": "View Plans",
    
    // Admin
    "admin.dashboard": "Dashboard",
    "admin.users": "Users",
    "admin.courses": "Courses",
    "admin.payments": "Payments",
    "admin.analytics": "Analytics",
    "admin.meetings": "Zoom Meetings",
    "admin.settings": "Settings",
    "admin.create-course": "Create Course",
    "admin.create-lesson": "Create Lesson",
    "admin.approve": "Approve",
    "admin.reject": "Reject",
    
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
  },
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.about": "من نحن",
    "nav.services": "الخدمات",
    "nav.courses": "الدورات",
    "nav.pricing": "الأسعار",
    "nav.contact": "اتصل بنا",
    "nav.login": "تسجيل الدخول",
    "nav.logout": "تسجيل الخروج",
    "nav.dashboard": "لوحة التحكم",
    "nav.admin": "لوحة الإدارة",
    
    // Hero
    "hero.title": "احترف تداول العملات الرقمية",
    "hero.subtitle": "تعلم من خبراء الصناعة وحول رحلة التداول الخاصة بك مع دورات شاملة وتحليل مباشر للسوق",
    "hero.cta.primary": "ابدأ التعلم",
    "hero.cta.secondary": "استكشف الدورات",
    
    // Features
    "features.title": "لماذا تختار Leedacademya",
    "features.expert.title": "مدربون خبراء",
    "features.expert.desc": "تعلم من محترفين معتمدين بسنوات من الخبرة في التداول",
    "features.live.title": "بيانات السوق المباشرة",
    "features.live.desc": "أسعار العملات الرقمية في الوقت الفعلي وتحليل السوق",
    "features.progress.title": "تتبع التقدم",
    "features.progress.desc": "راقب رحلة التعلم الخاصة بك بتحليلات مفصلة",
    "features.support.title": "دعم على مدار الساعة",
    "features.support.desc": "احصل على المساعدة متى احتجتها من فريقنا المخصص",
    
    // Testimonials
    "testimonials.title": "ماذا يقول طلابنا",
    
    // Courses
    "courses.title": "دوراتنا",
    "courses.level": "المستوى",
    "courses.free": "مجاني",
    "courses.locked": "مقفل",
    "courses.enrolled": "مسجل",
    "courses.lessons": "دروس",
    "courses.hours": "ساعات",
    "courses.enroll": "سجل الآن",
    "courses.continue": "متابعة التعلم",
    "courses.filter.all": "جميع الدورات",
    "courses.filter.free": "مجاني",
    "courses.filter.level": "المستوى",
    
    // Pricing
    "pricing.title": "اختر خطتك",
    "pricing.monthly": "شهري",
    "pricing.popular": "الأكثر شعبية",
    "pricing.select": "اختر الخطة",
    "pricing.features": "المميزات",
    
    // Contact
    "contact.title": "تواصل معنا",
    "contact.name": "الاسم",
    "contact.email": "البريد الإلكتروني",
    "contact.message": "الرسالة",
    "contact.send": "إرسال الرسالة",
    
    // Dashboard
    "dashboard.welcome": "مرحباً بعودتك",
    "dashboard.stats.enrolled": "الدورات المسجلة",
    "dashboard.stats.completed": "المكتملة",
    "dashboard.stats.hours": "ساعات المشاهدة",
    "dashboard.stats.progress": "التقدم الإجمالي",
    "dashboard.my-courses": "دوراتي",
    "dashboard.continue-learning": "متابعة التعلم",
    
    // Subscription
    "subscription.choose-plan": "اختر خطة",
    "subscription.payment-method": "طريقة الدفع",
    "subscription.upload-proof": "تحميل الإثبات",
    "subscription.crypto": "العملات الرقمية",
    "subscription.bank": "تحويل بنكي",
    "subscription.submit": "إرسال الدفع",
    "subscription.pending": "الدفع قيد الانتظار",
    "subscription.title": "اشتراكي",
    "subscription.current-plan": "الخطة الحالية",
    "subscription.status": "الحالة",
    "subscription.status.active": "نشط",
    "subscription.status.pending": "قيد الموافقة",
    "subscription.status.expired": "منتهي",
    "subscription.status.inactive": "غير نشط",
    "subscription.expires": "ينتهي",
    "subscription.expired-on": "انتهى في",
    "subscription.started": "بدأ",
    "subscription.upgrade": "ترقية الخطة",
    "subscription.change": "تغيير الخطة",
    "subscription.no-subscription": "لا يوجد اشتراك نشط",
    "subscription.no-subscription-desc": "ليس لديك اشتراك نشط حتى الآن. اختر خطة لفتح الدورات والميزات المميزة.",
    "subscription.view-plans": "عرض الخطط",
    
    // Admin
    "admin.dashboard": "لوحة التحكم",
    "admin.users": "المستخدمون",
    "admin.courses": "الدورات",
    "admin.payments": "المدفوعات",
    "admin.analytics": "التحليلات",
    "admin.meetings": "اجتماعات Zoom",
    "admin.settings": "الإعدادات",
    "admin.create-course": "إنشاء دورة",
    "admin.create-lesson": "إنشاء درس",
    "admin.approve": "قبول",
    "admin.reject": "رفض",
    
    // Common
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.success": "نجح",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "ar" || saved === "en" ? saved : "en") as Language;
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

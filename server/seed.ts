import { db } from "./db";
import { subscriptionPlans, courses, lessons } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed subscription plans
  await db.insert(subscriptionPlans).values([
    {
      nameEn: "Basic",
      nameAr: "الأساسية",
      descriptionEn: "Perfect for beginners starting their trading journey",
      descriptionAr: "مثالي للمبتدئين الذين يبدأون رحلتهم التجارية",
      price: "29.99",
      durationDays: 30,
      featuresEn: ["Access to Level 1 courses", "Community forum access", "Email support"],
      featuresAr: ["الوصول إلى دورات المستوى 1", "الوصول إلى منتدى المجتمع", "دعم البريد الإلكتروني"],
      isPopular: false,
    },
    {
      nameEn: "Professional",
      nameAr: "المحترف",
      descriptionEn: "For serious traders who want to master the market",
      descriptionAr: "للمتداولين الجادين الذين يريدون إتقان السوق",
      price: "79.99",
      durationDays: 30,
      featuresEn: [
        "Access to all Level 1 & 2 courses",
        "Weekly live Zoom sessions",
        "Priority support",
        "Trading signals",
        "Community forum access"
      ],
      featuresAr: [
        "الوصول إلى جميع دورات المستوى 1 و 2",
        "جلسات Zoom مباشرة أسبوعية",
        "دعم ذو أولوية",
        "إشارات التداول",
        "الوصول إلى منتدى المجتمع"
      ],
      isPopular: true,
    },
    {
      nameEn: "Elite",
      nameAr: "النخبة",
      descriptionEn: "Ultimate package for professional traders",
      descriptionAr: "الباقة النهائية للمتداولين المحترفين",
      price: "149.99",
      durationDays: 30,
      featuresEn: [
        "Access to all courses (Levels 1, 2, 3)",
        "Daily live Zoom sessions",
        "1-on-1 mentoring",
        "Premium trading signals",
        "Exclusive market analysis",
        "Lifetime community access"
      ],
      featuresAr: [
        "الوصول إلى جميع الدورات (المستويات 1 و 2 و 3)",
        "جلسات Zoom مباشرة يومية",
        "إرشاد فردي",
        "إشارات تداول متميزة",
        "تحليل حصري للسوق",
        "وصول مدى الحياة للمجتمع"
      ],
      isPopular: false,
    },
  ]);

  // Seed courses
  const [course1] = await db.insert(courses).values([
    {
      titleEn: "Cryptocurrency Trading Fundamentals",
      titleAr: "أساسيات تداول العملات الرقمية",
      descriptionEn: "Learn the basics of cryptocurrency trading, market analysis, and risk management",
      descriptionAr: "تعلم أساسيات تداول العملات الرقمية وتحليل السوق وإدارة المخاطر",
      level: 1,
      price: "0",
      isFree: true,
      instructorEn: "John Smith",
      instructorAr: "جون سميث",
      duration: 8,
    },
  ]).returning();

  const [course2] = await db.insert(courses).values([
    {
      titleEn: "Advanced Technical Analysis",
      titleAr: "التحليل الفني المتقدم",
      descriptionEn: "Master advanced charting techniques and technical indicators",
      descriptionAr: "إتقان تقنيات الرسم البياني المتقدمة والمؤشرات الفنية",
      level: 2,
      price: "49.99",
      isFree: false,
      instructorEn: "Sarah Johnson",
      instructorAr: "سارة جونسون",
      duration: 12,
    },
  ]).returning();

  const [course3] = await db.insert(courses).values([
    {
      titleEn: "Professional Trading Strategies",
      titleAr: "استراتيجيات التداول الاحترافية",
      descriptionEn: "Learn professional trading strategies used by institutional traders",
      descriptionAr: "تعلم استراتيجيات التداول الاحترافية المستخدمة من قبل المتداولين المؤسسيين",
      level: 3,
      price: "99.99",
      isFree: false,
      instructorEn: "Michael Chen",
      instructorAr: "مايكل تشين",
      duration: 16,
    },
  ]).returning();

  // Seed lessons for course 1
  await db.insert(lessons).values([
    {
      courseId: course1.id,
      titleEn: "Introduction to Cryptocurrency",
      titleAr: "مقدمة إلى العملات الرقمية",
      descriptionEn: "Understanding what cryptocurrency is and how it works",
      descriptionAr: "فهم ما هي العملة الرقمية وكيف تعمل",
      videoUrl: "https://www.youtube.com/watch?v=SSo_EIwHSd4",
      duration: 45,
      order: 1,
      requiresPrevious: false,
      isFree: true,
    },
    {
      courseId: course1.id,
      titleEn: "Setting Up Your Trading Account",
      titleAr: "إعداد حساب التداول الخاص بك",
      descriptionEn: "Step-by-step guide to setting up your first trading account",
      descriptionAr: "دليل خطوة بخطوة لإعداد أول حساب تداول لك",
      videoUrl: "https://www.youtube.com/watch?v=1YyAzVmP9jQ",
      duration: 30,
      order: 2,
      requiresPrevious: true,
      isFree: true,
    },
    {
      courseId: course1.id,
      titleEn: "Understanding Market Orders",
      titleAr: "فهم أوامر السوق",
      descriptionEn: "Learn about different types of market orders and when to use them",
      descriptionAr: "تعرف على أنواع مختلفة من أوامر السوق ومتى تستخدمها",
      videoUrl: "https://www.youtube.com/watch?v=gXMPl7k9v5g",
      duration: 40,
      order: 3,
      requiresPrevious: true,
      isFree: true,
    },
  ]);

  // Seed lessons for course 2
  await db.insert(lessons).values([
    {
      courseId: course2.id,
      titleEn: "Chart Patterns and Trends",
      titleAr: "أنماط الرسم البياني والاتجاهات",
      descriptionEn: "Identify and trade using chart patterns",
      descriptionAr: "تحديد والتداول باستخدام أنماط الرسم البياني",
      videoUrl: "https://www.youtube.com/watch?v=GfQofTbvxFE",
      duration: 50,
      order: 1,
      requiresPrevious: false,
      isFree: false,
    },
    {
      courseId: course2.id,
      titleEn: "Technical Indicators Deep Dive",
      titleAr: "الغوص العميق في المؤشرات الفنية",
      descriptionEn: "Master RSI, MACD, Bollinger Bands and more",
      descriptionAr: "إتقان RSI و MACD و Bollinger Bands والمزيد",
      videoUrl: "https://www.youtube.com/watch?v=nuDlrOMinOk",
      duration: 60,
      order: 2,
      requiresPrevious: true,
      isFree: false,
    },
  ]);

  // Seed lessons for course 3
  await db.insert(lessons).values([
    {
      courseId: course3.id,
      titleEn: "Algorithmic Trading Basics",
      titleAr: "أساسيات التداول الخوارزمي",
      descriptionEn: "Introduction to automated trading strategies",
      descriptionAr: "مقدمة لاستراتيجيات التداول الآلي",
      videoUrl: "https://www.youtube.com/watch?v=p_tpQSY1aTs",
      duration: 70,
      order: 1,
      requiresPrevious: false,
      isFree: false,
    },
    {
      courseId: course3.id,
      titleEn: "Risk Management for Professionals",
      titleAr: "إدارة المخاطر للمحترفين",
      descriptionEn: "Advanced risk management techniques",
      descriptionAr: "تقنيات متقدمة لإدارة المخاطر",
      videoUrl: "https://www.youtube.com/watch?v=XnATmWzHR0Q",
      duration: 65,
      order: 2,
      requiresPrevious: true,
      isFree: false,
    },
  ]);

  console.log("Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

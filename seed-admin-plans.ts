import { db } from "./server/db";
import { users, subscriptionPlans } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

async function seedAdminAndPlans() {
    try {
        console.log("🌱 Starting seed...\n");

        // ========== CREATE ADMIN ACCOUNT ==========
        console.log("👤 Creating admin account...");

        const adminEmail = "admin@leedacademya.com";
        const adminPassword = "Admin@123456";

        // Check if admin exists
        const existingAdmin = await db
            .select()
            .from(users)
            .where(eq(users.email, adminEmail))
            .limit(1);

        let admin;
        if (existingAdmin.length > 0) {
            // Update existing admin
            const [updatedAdmin] = await db
                .update(users)
                .set({
                    role: "admin",
                    isVerified: true,
                    verificationToken: null,
                    isActive: true,
                })
                .where(eq(users.email, adminEmail))
                .returning();

            admin = updatedAdmin;
            console.log("✅ Admin account updated!");
        } else {
            // Create new admin
            const referralCode = randomBytes(4).toString("hex").toUpperCase().slice(0, 8);
            const passwordHash = await bcrypt.hash(adminPassword, 10);

            const [newAdmin] = await db
                .insert(users)
                .values({
                    email: adminEmail,
                    passwordHash,
                    firstName: "Admin",
                    lastName: "User",
                    phone: "+966500000000",
                    role: "admin",
                    referralCode,
                    isVerified: true,
                    verificationToken: null,
                    isActive: true,
                    subscriptionStatus: "active",
                })
                .returning();

            admin = newAdmin;
            console.log("✅ Admin account created!");
        }

        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log(`🎫 Referral Code: ${admin.referralCode}\n`);

        // ========== CREATE SUBSCRIPTION PLANS ==========
        console.log("💳 Creating subscription plans...\n");

        const plans = [
            {
                nameEn: "Basic Plan",
                nameAr: "الخطة الأساسية",
                descriptionEn: "Perfect for beginners starting their trading journey",
                descriptionAr: "مثالية للمبتدئين الذين يبدأون رحلتهم في التداول",
                price: "49.99",
                durationDays: 30,
                featuresEn: [
                    "Access to basic courses",
                    "Community chat access",
                    "Weekly market analysis",
                    "Email support"
                ],
                featuresAr: [
                    "الوصول إلى الدورات الأساسية",
                    "الوصول إلى المحادثة المجتمعية",
                    "تحليل السوق الأسبوعي",
                    "دعم عبر البريد الإلكتروني"
                ],
                isPopular: false,
            },
            {
                nameEn: "Pro Plan",
                nameAr: "الخطة الاحترافية",
                descriptionEn: "Most popular choice for serious traders",
                descriptionAr: "الخيار الأكثر شعبية للمتداولين الجادين",
                price: "99.99",
                durationDays: 30,
                featuresEn: [
                    "Access to all courses",
                    "Priority community access",
                    "Daily market analysis",
                    "Live trading sessions",
                    "1-on-1 mentorship (monthly)",
                    "Priority support"
                ],
                featuresAr: [
                    "الوصول إلى جميع الدورات",
                    "الأولوية في الوصول إلى المجتمع",
                    "تحليل السوق اليومي",
                    "جلسات تداول مباشرة",
                    "إرشاد فردي (شهري)",
                    "دعم ذو أولوية"
                ],
                isPopular: true,
            },
            {
                nameEn: "Premium Plan",
                nameAr: "الخطة المميزة",
                descriptionEn: "Ultimate package for professional traders",
                descriptionAr: "الحزمة النهائية للمتداولين المحترفين",
                price: "199.99",
                durationDays: 30,
                featuresEn: [
                    "All Pro Plan features",
                    "Advanced trading strategies",
                    "Real-time trade alerts",
                    "Private Discord channel",
                    "Weekly 1-on-1 coaching",
                    "Lifetime access to materials",
                    "24/7 Priority support"
                ],
                featuresAr: [
                    "جميع ميزات الخطة الاحترافية",
                    "استراتيجيات التداول المتقدمة",
                    "تنبيهات التداول في الوقت الفعلي",
                    "قناة Discord خاصة",
                    "تدريب فردي أسبوعي",
                    "وصول مدى الحياة إلى المواد",
                    "دعم ذو أولوية 24/7"
                ],
                isPopular: false,
            },
            {
                nameEn: "Annual Pro",
                nameAr: "برو السنوي",
                descriptionEn: "Best value - Save 20% with annual billing",
                descriptionAr: "أفضل قيمة - وفر 20% مع الفوترة السنوية",
                price: "959.99",
                durationDays: 365,
                featuresEn: [
                    "All Pro Plan features",
                    "2 months free",
                    "Annual strategy review",
                    "Exclusive webinars"
                ],
                featuresAr: [
                    "جميع ميزات الخطة الاحترافية",
                    "شهرين مجاناً",
                    "مراجعة الاستراتيجية السنوية",
                    "ندوات حصرية عبر الإنترنت"
                ],
                isPopular: false,
            },
        ];

        for (const plan of plans) {
            // Check if plan exists
            const existing = await db
                .select()
                .from(subscriptionPlans)
                .where(eq(subscriptionPlans.nameEn, plan.nameEn))
                .limit(1);

            if (existing.length > 0) {
                // Update existing plan
                await db
                    .update(subscriptionPlans)
                    .set(plan)
                    .where(eq(subscriptionPlans.id, existing[0].id));
                console.log(`✅ Updated: ${plan.nameEn} - $${plan.price}/${plan.durationDays} days`);
            } else {
                // Create new plan
                await db.insert(subscriptionPlans).values(plan);
                console.log(`✅ Created: ${plan.nameEn} - $${plan.price}/${plan.durationDays} days`);
            }
        }

        console.log("\n🎉 Seed completed successfully!");
        console.log("\n📋 Summary:");
        console.log(`   Admin: ${adminEmail}`);
        console.log(`   Plans: ${plans.length} subscription plans created/updated`);

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    }
}

seedAdminAndPlans()
    .then(() => {
        console.log("\n✅ All done! You can now login as admin.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    });

import { db } from "./server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

async function seedTestUser() {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "contactmeyassin@gmail.com"))
      .limit(1);

    if (existingUser.length > 0) {
      // Update existing user with $100 referral earnings
      await db
        .update(users)
        .set({
          referralEarnings: "100",
          referralCount: 10,
        })
        .where(eq(users.email, "contactmeyassin@gmail.com"));

      console.log("✅ User updated with $100 referral earnings!");
      console.log(`Referral Code: ${existingUser[0].referralCode}`);
      return existingUser[0];
    }

    // Generate referral code
    const referralCode = randomBytes(4)
      .toString("hex")
      .toUpperCase()
      .slice(0, 8);

    // Hash password
    const passwordHash = await bcrypt.hash("TestPassword123!", 10);

    // Create new user with $100 referral earnings
    const [newUser] = await db
      .insert(users)
      .values({
        email: "contactmeyassin@gmail.com",
        passwordHash,
        firstName: "Test",
        lastName: "User",
        phone: "+966123456789",
        role: "user",
        referralCode,
        referralEarnings: "100",
        referralCount: 10,
        subscriptionStatus: "active",
      })
      .returning();

    console.log("✅ Test user created successfully!");
    console.log(`Email: contactmeyassin@gmail.com`);
    console.log(`Password: TestPassword123!`);
    console.log(`Referral Code: ${newUser.referralCode}`);
    console.log(`Referral Earnings: $100`);

    return newUser;
  } catch (error) {
    console.error("Error seeding user:", error);
    throw error;
  }
}

seedTestUser()
  .then(() => {
    console.log("\n✅ Seed completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });

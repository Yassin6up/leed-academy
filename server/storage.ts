import { db } from "./db";
import { 
  users, 
  courses, 
  lessons, 
  courseResources,
  subscriptionPlans, 
  subscriptions,
  payments,
  progress,
  meetings,
  testimonials,
  paymentSettings,
  settings,
  referralTransactions,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type CourseResource,
  type InsertCourseResource,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
  type Payment,
  type InsertPayment,
  type Progress,
  type InsertProgress,
  type Meeting,
  type InsertMeeting,
  type Testimonial,
  type InsertTestimonial,
  type PaymentSettings,
  type InsertPaymentSettings,
  type Setting,
  type ReferralTransaction,
  type InsertReferralTransaction,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(userData: { email: string; password: string; firstName: string; lastName: string; phone?: string; referredBy?: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getReferralCount(userId: string): Promise<number>;
  getReferralStats(userId: string): Promise<{ count: number; earnings: string; transactions: ReferralTransaction[] }>;
  addReferralEarnings(referrerId: string, referredUserId: string, amount: number): Promise<ReferralTransaction>;
  validateUserPassword(email: string, password: string): Promise<User | null>;
  deactivateUser(userId: string): Promise<User>;
  activateUser(userId: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  cancelUserSubscription(userId: string): Promise<User>;
  
  // Course methods
  getCourse(id: string): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, data: Partial<Course>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
  // Lesson methods
  getLesson(id: string): Promise<Lesson | undefined>;
  getLessonsByCourse(courseId: string): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;
  
  // Course Resources methods
  getCourseResource(id: string): Promise<CourseResource | undefined>;
  getCourseResources(courseId: string): Promise<CourseResource[]>;
  createCourseResource(resource: InsertCourseResource): Promise<CourseResource>;
  updateCourseResource(id: string, data: Partial<CourseResource>): Promise<CourseResource>;
  deleteCourseResource(id: string): Promise<void>;
  
  // Subscription Plan methods
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan>;
  
  // Subscription methods
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription>;
  
  // Payment methods
  getPayment(id: string): Promise<Payment | undefined>;
  getAllPayments(): Promise<Payment[]>;
  getUserPayments(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, data: Partial<Payment>): Promise<Payment>;
  
  // Progress methods
  getUserProgress(userId: string): Promise<Progress[]>;
  getCourseProgress(userId: string, courseId: string): Promise<Progress[]>;
  upsertProgress(progressData: InsertProgress): Promise<Progress>;
  
  // Meeting methods
  getMeeting(id: string): Promise<Meeting | undefined>;
  getCourseMeetings(courseId: string): Promise<Meeting[]>;
  getAllMeetings(): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting>;
  deleteMeeting(id: string): Promise<void>;
  
  // Testimonial methods
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Stats methods
  getStats(): Promise<{ userCount: number; courseCount: number; satisfactionRate: number }>;
  
  // Analytics methods
  getAnalytics(): Promise<{
    revenueTrends: { 
      daily: Array<{ date: string; amount: number }>; 
      weekly: Array<{ week: string; amount: number }>; 
      monthly: Array<{ month: string; amount: number }>;
    };
    userRegistrationTrends: Array<{ month: string; count: number }>;
    courseEnrollments: Array<{ courseId: string; courseName: string; count: number }>;
    topCourses: Array<{ id: string; titleEn: string; titleAr: string; enrollments: number }>;
    paymentStatusBreakdown: { pending: number; approved: number; rejected: number };
  }>;
  
  // Payment Settings methods
  getPaymentSettings(): Promise<PaymentSettings | undefined>;
  upsertPaymentSettings(settings: InsertPaymentSettings): Promise<PaymentSettings>;
  
  // Settings methods
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  upsertSetting(key: string, value: string): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
    return result[0];
  }

  async createUser(userData: { email: string; password: string; firstName: string; lastName: string; phone?: string; referredBy?: string }): Promise<User> {
    // Hash the password
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    // Generate unique referral code
    let referralCode = this.generateReferralCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await this.getUserByReferralCode(referralCode);
      if (!existing) {
        isUnique = true;
      } else {
        referralCode = this.generateReferralCode();
      }
    }

    // Create user
    const [newUser] = await db.insert(users).values({
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      referralCode,
      referredBy: userData.referredBy || null,
    }).returning();

    return newUser;
  }

  async validateUserPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existing = user.email ? await this.getUserByEmail(user.email) : null;
    
    if (existing) {
      const [updated] = await db
        .update(users)
        .set({ ...user, updatedAt: new Date() })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    }
    
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getReferralCount(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    if (!user?.referralCode) return 0;
    
    const referrals = await db
      .select()
      .from(users)
      .where(eq(users.referredBy, user.referralCode));
    return referrals.length;
  }

  async getReferralStats(userId: string): Promise<{ count: number; earnings: string; transactions: ReferralTransaction[] }> {
    const user = await this.getUser(userId);
    if (!user) return { count: 0, earnings: "0", transactions: [] };

    const transactions = await db.query.referralTransactions.findMany({
      where: (t) => eq(t.referrerId, userId),
    });

    return {
      count: user.referralCount || 0,
      earnings: user.referralEarnings || "0",
      transactions,
    };
  }

  async addReferralEarnings(referrerId: string, referredUserId: string, amount: number): Promise<ReferralTransaction> {
    const transaction = await db.insert(referralTransactions).values({
      referrerId,
      referredUserId,
      amount: amount.toString(),
      status: "completed",
    }).returning().then(r => r[0]);

    // Update referrer's earnings and count
    const referrer = await this.getUser(referrerId);
    if (referrer) {
      const currentEarnings = parseFloat(referrer.referralEarnings || "0");
      const newCount = (referrer.referralCount || 0) + 1;
      await db.update(users).set({
        referralEarnings: (currentEarnings + amount).toString(),
        referralCount: newCount,
      }).where(eq(users.id, referrerId));
    }

    return transaction;
  }

  async deactivateUser(userId: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async activateUser(userId: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.update(payments).set({ reviewedBy: null }).where(eq(payments.reviewedBy, userId));
    await db.delete(testimonials).where(eq(testimonials.userId, userId));
    await db.delete(progress).where(eq(progress.userId, userId));
    await db.delete(payments).where(eq(payments.userId, userId));
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  }

  async cancelUserSubscription(userId: string): Promise<User> {
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);
    
    if (subscription.length > 0) {
      await db
        .update(subscriptions)
        .set({ status: 'cancelled' })
        .where(eq(subscriptions.userId, userId));
    }
    
    const [updated] = await db
      .update(users)
      .set({ subscriptionStatus: 'cancelled', updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Course methods
  async getCourse(id: string): Promise<Course | undefined> {
    const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return result[0];
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(courses.level);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const [updated] = await db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updated;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Lesson methods
  async getLesson(id: string): Promise<Lesson | undefined> {
    const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
    return result[0];
  }

  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(lessons.order);
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lesson).returning();
    return newLesson;
  }

  async updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson> {
    const [updated] = await db
      .update(lessons)
      .set(data)
      .where(eq(lessons.id, id))
      .returning();
    return updated;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  // Course Resources methods
  async getCourseResource(id: string): Promise<CourseResource | undefined> {
    const result = await db
      .select()
      .from(courseResources)
      .where(eq(courseResources.id, id))
      .limit(1);
    return result[0];
  }

  async getCourseResources(courseId: string): Promise<CourseResource[]> {
    return await db
      .select()
      .from(courseResources)
      .where(eq(courseResources.courseId, courseId))
      .orderBy(courseResources.order);
  }

  async createCourseResource(resource: InsertCourseResource): Promise<CourseResource> {
    const [newResource] = await db.insert(courseResources).values(resource).returning();
    return newResource;
  }

  async updateCourseResource(id: string, data: Partial<CourseResource>): Promise<CourseResource> {
    const [updated] = await db
      .update(courseResources)
      .set(data)
      .where(eq(courseResources.id, id))
      .returning();
    return updated;
  }

  async deleteCourseResource(id: string): Promise<void> {
    await db.delete(courseResources).where(eq(courseResources.id, id));
  }

  // Subscription Plan methods
  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const result = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id))
      .limit(1);
    return result[0];
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans);
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  async updateSubscriptionPlan(
    id: string,
    data: Partial<SubscriptionPlan>
  ): Promise<SubscriptionPlan> {
    const [updated] = await db
      .update(subscriptionPlans)
      .set(data)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updated;
  }

  // Subscription methods
  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return result[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSub] = await db.insert(subscriptions).values(subscription).returning();
    return newSub;
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const [updated] = await db
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  // Payment methods
  async getPayment(id: string): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const user = await this.getUser(payment.userId);
    const paymentData = {
      ...payment,
      userName: user ? `${user.firstName} ${user.lastName}` : undefined,
      userEmail: user?.email,
    };
    const [newPayment] = await db.insert(payments).values(paymentData).returning();
    return newPayment;
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const [updated] = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  // Progress methods
  async getUserProgress(userId: string): Promise<Progress[]> {
    return await db.select().from(progress).where(eq(progress.userId, userId));
  }

  async getCourseProgress(userId: string, courseId: string): Promise<Progress[]> {
    return await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)));
  }

  async upsertProgress(progressData: InsertProgress): Promise<Progress> {
    const existing = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, progressData.userId),
          eq(progress.lessonId, progressData.lessonId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(progress)
        .set({ ...progressData, lastAccessedAt: new Date() })
        .where(eq(progress.id, existing[0].id))
        .returning();
      return updated;
    }

    const [newProgress] = await db.insert(progress).values(progressData).returning();
    return newProgress;
  }

  // Meeting methods
  async getMeeting(id: string): Promise<Meeting | undefined> {
    const result = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
    return result[0];
  }

  async getCourseMeetings(courseId: string): Promise<Meeting[]> {
    return await db
      .select()
      .from(meetings)
      .where(eq(meetings.courseId, courseId))
      .orderBy(meetings.scheduledAt);
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return await db.select().from(meetings).orderBy(meetings.scheduledAt);
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [newMeeting] = await db.insert(meetings).values(meeting).returning();
    return newMeeting;
  }

  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const [updated] = await db
      .update(meetings)
      .set(data)
      .where(eq(meetings.id, id))
      .returning();
    return updated;
  }

  async deleteMeeting(id: string): Promise<void> {
    await db.delete(meetings).where(eq(meetings.id, id));
  }

  // Testimonial methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db.insert(testimonials).values(testimonial).returning();
    return newTestimonial;
  }
  
  // Stats methods
  async getStats(): Promise<{ userCount: number; courseCount: number; satisfactionRate: number }> {
    const { sql } = await import("drizzle-orm");
    
    const [{ userCount }] = await db
      .select({ userCount: sql<number>`cast(count(*) as integer)` })
      .from(users);
    
    const [{ courseCount }] = await db
      .select({ courseCount: sql<number>`cast(count(*) as integer)` })
      .from(courses);
    
    const [{ testimonialCount, totalRating }] = await db
      .select({
        testimonialCount: sql<number>`cast(count(*) as integer)`,
        totalRating: sql<number>`cast(coalesce(sum(${testimonials.rating}), 0) as integer)`,
      })
      .from(testimonials);
    
    let satisfactionRate = 0;
    if (testimonialCount > 0 && totalRating > 0) {
      satisfactionRate = Math.round((totalRating / (testimonialCount * 5)) * 100);
    }
    
    return {
      userCount,
      courseCount,
      satisfactionRate,
    };
  }
  
  // Analytics methods
  async getAnalytics() {
    const allPayments = await db.select().from(payments);
    const allUsers = await db.select().from(users);
    const allSubscriptions = await db.select().from(subscriptions);
    const allCourses = await db.select().from(courses);
    
    const now = new Date();
    const approvedPayments = allPayments.filter(p => p.status === "approved" && p.createdAt);
    
    // Daily revenue (last 30 days) - backfill all days
    const dailyRevenue = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyRevenue.set(dateStr, 0);
    }
    
    approvedPayments.forEach(p => {
      const paymentDate = new Date(p.createdAt!);
      const daysDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysDiff < 30) {
        const dateStr = paymentDate.toISOString().split('T')[0];
        dailyRevenue.set(dateStr, (dailyRevenue.get(dateStr) || 0) + parseFloat(p.amount));
      }
    });
    
    const daily = Array.from(dailyRevenue.entries())
      .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // ISO Week calculation helper
    const getISOWeek = (date: Date): string => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
    };
    
    // Weekly revenue (last 12 weeks) - backfill all weeks
    const weeklyRevenue = new Map<string, number>();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekKey = getISOWeek(date);
      weeklyRevenue.set(weekKey, 0);
    }
    
    approvedPayments.forEach(p => {
      const weekKey = getISOWeek(new Date(p.createdAt!));
      if (weeklyRevenue.has(weekKey)) {
        weeklyRevenue.set(weekKey, (weeklyRevenue.get(weekKey) || 0) + parseFloat(p.amount));
      }
    });
    
    const weekly = Array.from(weeklyRevenue.entries())
      .map(([week, amount]) => ({ week, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => a.week.localeCompare(b.week));
    
    // Monthly revenue (last 12 months) - backfill all months
    const monthlyRevenue = new Map<string, number>();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyRevenue.set(monthKey, 0);
    }
    
    approvedPayments.forEach(p => {
      const date = new Date(p.createdAt!);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (monthlyRevenue.has(monthKey)) {
        monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + parseFloat(p.amount));
      }
    });
    
    const monthly = Array.from(monthlyRevenue.entries())
      .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // User registration trends (last 12 months) - backfill all months
    const registrationTrends = new Map<string, number>();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      registrationTrends.set(monthKey, 0);
    }
    
    allUsers.forEach(u => {
      if (u.createdAt) {
        const date = new Date(u.createdAt);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (registrationTrends.has(monthKey)) {
          registrationTrends.set(monthKey, (registrationTrends.get(monthKey) || 0) + 1);
        }
      }
    });
    
    const userRegistrationTrends = Array.from(registrationTrends.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Course enrollments - count all subscriptions (since we don't have courseId in subscriptions)
    const courseEnrollments = allCourses.map(course => ({
      courseId: course.id,
      courseName: course.titleEn,
      count: Math.floor(allSubscriptions.length / Math.max(allCourses.length, 1)),
    }));
    
    // Top performing courses - distribute enrollments evenly across courses
    const enrollmentsPerCourse = Math.floor(allSubscriptions.length / Math.max(allCourses.length, 1));
    const topCourses = allCourses
      .map((course, idx) => ({
        id: course.id,
        titleEn: course.titleEn,
        titleAr: course.titleAr,
        enrollments: enrollmentsPerCourse + (idx === 0 ? allSubscriptions.length % allCourses.length : 0),
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);
    
    // Payment status breakdown
    const paymentStatusBreakdown = {
      pending: allPayments.filter(p => p.status === "pending").length,
      approved: allPayments.filter(p => p.status === "approved").length,
      rejected: allPayments.filter(p => p.status === "rejected").length,
    };
    
    return {
      revenueTrends: { daily, weekly, monthly },
      userRegistrationTrends,
      courseEnrollments,
      topCourses,
      paymentStatusBreakdown,
    };
  }
  
  // Payment Settings methods
  async getPaymentSettings(): Promise<PaymentSettings | undefined> {
    const result = await db.select().from(paymentSettings).limit(1);
    return result[0];
  }
  
  async upsertPaymentSettings(settings: InsertPaymentSettings): Promise<PaymentSettings> {
    const existing = await this.getPaymentSettings();
    
    if (existing) {
      const [updated] = await db
        .update(paymentSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(paymentSettings.id, existing.id))
        .returning();
      return updated;
    }
    
    const [newSettings] = await db.insert(paymentSettings).values(settings).returning();
    return newSettings;
  }

  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return setting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async upsertSetting(key: string, value: string): Promise<Setting> {
    const existing = await this.getSetting(key);
    
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return updated;
    }
    
    const [newSetting] = await db.insert(settings).values({ key, value }).returning();
    return newSetting;
  }
}

export const storage = new DatabaseStorage();

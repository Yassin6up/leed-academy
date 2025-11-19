import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table (Replit Auth + custom fields)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("none"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  featuresEn: text("features_en").array(),
  featuresAr: text("features_ar").array(),
  isPopular: boolean("is_popular").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// Courses
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleEn: varchar("title_en").notNull(),
  titleAr: varchar("title_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  level: integer("level").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  isFree: boolean("is_free").default(false),
  thumbnailUrl: varchar("thumbnail_url"),
  instructorEn: varchar("instructor_en"),
  instructorAr: varchar("instructor_ar"),
  duration: integer("duration"),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Lessons
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  titleEn: varchar("title_en").notNull(),
  titleAr: varchar("title_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  videoUrl: varchar("video_url"),
  duration: integer("duration"),
  order: integer("order").notNull(),
  requiresPrevious: boolean("requires_previous").default(true),
  isFree: boolean("is_free").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: varchar("plan_id").notNull().references(() => subscriptionPlans.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Payments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: varchar("method", { length: 20 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  proofImageUrl: varchar("proof_image_url"),
  walletAddress: varchar("wallet_address"),
  transactionHash: varchar("transaction_hash"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Progress tracking
export const progress = pgTable("progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: varchar("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
  createdAt: true,
});
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;

// Zoom Meetings
export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id, { onDelete: "cascade" }),
  titleEn: varchar("title_en").notNull(),
  titleAr: varchar("title_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  zoomLink: varchar("zoom_link").notNull(),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
});
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar").notNull(),
  roleEn: varchar("role_en"),
  roleAr: varchar("role_ar"),
  contentEn: text("content_en").notNull(),
  contentAr: text("content_ar").notNull(),
  rating: integer("rating").notNull().default(5),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  payments: many(payments),
  progress: many(progress),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  lessons: many(lessons),
  meetings: many(meetings),
  progress: many(progress),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  progress: many(progress),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [progress.lessonId],
    references: [lessons.id],
  }),
  course: one(courses, {
    fields: [progress.courseId],
    references: [courses.id],
  }),
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
  course: one(courses, {
    fields: [meetings.courseId],
    references: [courses.id],
  }),
}));

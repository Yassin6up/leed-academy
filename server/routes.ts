import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCourseSchema, insertLessonSchema, insertPaymentSchema, insertProgressSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";
import express from "express";

// Auth middleware
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth with session management
  await setupAuth(app);

  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // File upload configuration with security
  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        const sanitizedExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
        if (!sanitizedExt.match(/^\.(jpg|jpeg|png|pdf)$/)) {
          return cb(new Error("Invalid file extension"));
        }
        const uniqueName = `${randomUUID()}${sanitizedExt}`;
        cb(null, uniqueName);
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (_req, file, cb) => {
      const allowedTypes = /^(image\/(jpeg|png)|application\/pdf)$/;
      if (!allowedTypes.test(file.mimetype)) {
        return cb(new Error("Only JPEG, PNG images and PDF files are allowed"));
      }
      const extname = /\.(jpg|jpeg|png|pdf)$/i.test(file.originalname);
      if (!extname) {
        return cb(new Error("Invalid file extension"));
      }
      cb(null, true);
    },
  });

  // Auth user endpoint
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Serve uploaded files with authentication
  app.use("/uploads", isAuthenticated, express.static(uploadDir));

  // Public routes
  app.get("/api/courses", async (_req, res) => {
    const courses = await storage.getAllCourses();
    res.json(courses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  });

  app.get("/api/courses/:id/lessons", async (req, res) => {
    const lessons = await storage.getLessonsByCourse(req.params.id);
    res.json(lessons);
  });

  app.get("/api/courses/:id/meetings", async (req, res) => {
    const meetings = await storage.getCourseMeetings(req.params.id);
    res.json(meetings);
  });

  app.get("/api/subscription-plans", async (_req, res) => {
    const plans = await storage.getAllSubscriptionPlans();
    res.json(plans);
  });

  app.get("/api/subscription-plans/:id", async (req, res) => {
    const plan = await storage.getSubscriptionPlan(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(plan);
  });

  app.get("/api/testimonials", async (_req, res) => {
    const testimonials = await storage.getAllTestimonials();
    res.json(testimonials);
  });

  // Crypto prices from Binance API
  app.get("/api/crypto/prices", async (_req, res) => {
    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22BNBUSDT%22]"
      );
      
      if (!response.ok) {
        console.warn(`Binance API returned ${response.status}, using fallback data`);
        const fallbackPrices = [
          { symbol: "BTC", price: 43250.50, change24h: 2.45 },
          { symbol: "ETH", price: 2275.30, change24h: 1.82 },
          { symbol: "BNB", price: 315.75, change24h: -0.65 },
        ];
        return res.json(fallbackPrices);
      }
      
      const data = await response.json();
      
      const prices = data.map((item: any) => ({
        symbol: item.symbol.replace("USDT", ""),
        price: parseFloat(item.lastPrice),
        change24h: parseFloat(item.priceChangePercent),
      }));
      
      res.json(prices);
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
      const fallbackPrices = [
        { symbol: "BTC", price: 43250.50, change24h: 2.45 },
        { symbol: "ETH", price: 2275.30, change24h: 1.82 },
        { symbol: "BNB", price: 315.75, change24h: -0.65 },
      ];
      res.json(fallbackPrices);
    }
  });

  // Protected routes
  app.get("/api/user/progress", isAuthenticated, async (req, res) => {
    const progress = await storage.getUserProgress((req.user as any)?.claims?.sub);
    res.json(progress);
  });

  app.get("/api/progress/:courseId", isAuthenticated, async (req, res) => {
    const progress = await storage.getCourseProgress((req.user as any)?.claims?.sub, req.params.courseId);
    res.json(progress);
  });

  app.post("/api/progress", isAuthenticated, async (req, res) => {
    try {
      const validated = insertProgressSchema.parse({
        ...req.body,
        userId: (req.user as any)?.claims?.sub,
      });
      
      const progress = await storage.upsertProgress(validated);
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/payments", isAuthenticated, (req, res) => {
    upload.single("proofImage")(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File size exceeds 10MB limit" });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      try {
        const userId = (req.user as any)?.claims?.sub;
        const proofImageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        
        const validated = insertPaymentSchema.parse({
          userId,
          planId: req.body.planId,
          amount: req.body.amount,
          currency: req.body.currency || "USD",
          method: req.body.method,
          status: "pending",
          proofImageUrl,
        });

        const plan = await storage.getSubscriptionPlan(validated.planId);
        if (!plan) {
          return res.status(400).json({ message: "Invalid subscription plan" });
        }

        const existingSubscription = await storage.getUserSubscription(userId);
        if (!existingSubscription || existingSubscription.status !== "pending") {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.durationDays);

          await storage.createSubscription({
            userId,
            planId: validated.planId,
            status: "pending",
            startDate: new Date(),
            endDate,
          });
        }

        const payment = await storage.createPayment(validated);
        res.json(payment);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    });
  });

  // File upload endpoint with error handling
  app.post("/api/upload", isAuthenticated, (req, res) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File size exceeds 10MB limit" });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      res.json({
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        originalName: path.basename(req.file.originalname),
      });
    });
  });

  // Admin routes
  app.get("/api/admin/stats", isAuthenticated, requireAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    const courses = await storage.getAllCourses();
    const payments = await storage.getAllPayments();

    const approvedPayments = payments.filter(p => p.status === "approved");
    const totalRevenue = approvedPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );

    const activeSubscriptions = users.filter(
      u => u.subscriptionStatus === "active"
    ).length;

    const recentPayments = payments
      .filter(p => p.status === "approved")
      .slice(0, 6)
      .map(p => ({
        month: new Date(p.createdAt!).toLocaleDateString("en", { month: "short" }),
        amount: parseFloat(p.amount),
      }));

    res.json({
      totalUsers: users.length,
      totalCourses: courses.length,
      totalRevenue,
      activeSubscriptions,
      recentPayments,
    });
  });

  app.get("/api/admin/users", isAuthenticated, requireAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/admin/courses", isAuthenticated, requireAdmin, async (_req, res) => {
    const courses = await storage.getAllCourses();
    res.json(courses);
  });

  app.post("/api/admin/courses", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validated = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validated);
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/courses/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const course = await storage.updateCourse(req.params.id, req.body);
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/courses/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteCourse(req.params.id);
      res.json({ message: "Course deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/lessons", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validated = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(validated);
      res.json(lesson);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/payments", isAuthenticated, requireAdmin, async (_req, res) => {
    const payments = await storage.getAllPayments();
    res.json(payments);
  });

  app.patch("/api/admin/payments/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const payment = await storage.updatePayment(req.params.id, {
        status: req.body.status,
      });

      if (req.body.status === "approved") {
        await storage.updateUser(payment.userId, {
          subscriptionStatus: "active",
        });

        const subscription = await storage.getUserSubscription(payment.userId);
        if (subscription) {
          await storage.updateSubscription(subscription.id, {
            status: "active",
          });
        }
      }

      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/meetings", isAuthenticated, requireAdmin, async (_req, res) => {
    const meetings = await storage.getAllMeetings();
    res.json(meetings);
  });

  app.post("/api/admin/meetings", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const meeting = await storage.createMeeting(req.body);
      res.json(meeting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

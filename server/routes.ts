import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCourseSchema, insertLessonSchema, insertPaymentSchema, insertProgressSchema, insertUserSchema, users } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";
import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  generateUniqueFilename,
  ensureDir,
  getCourseUploadDir,
  cleanupCourseDir,
  validateMimeType,
  validateFileSize,
  MAX_THUMBNAIL_SIZE,
  MAX_VIDEO_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from "./uploadHelpers";
import express from "express";

// Auth middleware
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any)?.userId;
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
          return cb(new Error("Invalid file extension"), "");
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

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate input with Zod
      const registerData = insertUserSchema.safeParse({
        ...req.body,
        password: req.body.password, // Zod schema expects password field
      });

      if (!registerData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: registerData.error.errors 
        });
      }

      const { email, password, firstName, lastName, phone, referredBy } = registerData.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user
      const user = await storage.createUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        referredBy,
      });

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Registration failed" });
        }

        // Store user in session
        (req.session as any).userId = user.id;
        
        res.json({ 
          message: "Registration successful", 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          }
        });
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Validate credentials
      const user = await storage.validateUserPassword(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Login failed" });
        }

        // Store user in session
        (req.session as any).userId = user.id;
        
        res.json({ 
          message: "Login successful", 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          }
        });
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Strip sensitive fields before sending to client
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Validate referral code
  app.get("/api/referral/validate/:code", async (req, res) => {
    try {
      const user = await storage.getUserByReferralCode(req.params.code);
      if (user) {
        res.json({ valid: true, referrerName: `${user.firstName} ${user.lastName}` });
      } else {
        res.json({ valid: false });
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      res.status(500).json({ message: "Failed to validate referral code" });
    }
  });

  // Serve uploaded files with authentication
  app.use("/uploads", isAuthenticated, express.static(uploadDir));

  // Public routes
  app.get("/api/courses", async (_req, res) => {
    const courses = await storage.getAllCourses();
    
    // Add lesson count to each course
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        const lessons = await storage.getLessonsByCourse(course.id);
        return {
          ...course,
          lessonCount: lessons.length,
        };
      })
    );
    
    res.json(coursesWithCounts);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  });

  app.post("/api/courses/:id/increment-views", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const updated = await storage.updateCourse(req.params.id, {
        viewsCount: (course.viewsCount || 0) + 1,
      });
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id/lessons", async (req, res) => {
    const lessons = await storage.getLessonsByCourse(req.params.id);
    res.json(lessons);
  });

  app.get("/api/courses/:id/meetings", async (req, res) => {
    const meetings = await storage.getCourseMeetings(req.params.id);
    const isAuth = ((req.session as any)?.userId !== undefined);
    const userId = isAuth ? (req.session as any)?.userId : null;
    const user = userId ? await storage.getUser(userId) : null;
    const hasActiveSubscription = user?.subscriptionStatus === "active";
    
    // Sanitize meetings - remove Zoom links for unauthorized users
    const sanitizedMeetings = meetings.map(meeting => {
      const canAccess = !meeting.isPaidOnly || (isAuth && hasActiveSubscription);
      
      if (canAccess) {
        return meeting;
      } else {
        // Remove Zoom link for unauthorized users
        const { zoomLink, ...sanitizedMeeting } = meeting;
        return sanitizedMeeting;
      }
    });
    
    res.json(sanitizedMeetings);
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

  // Get stats for landing page
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get all upcoming meetings (for News page)
  // Returns sanitized meetings - Zoom links only visible to authenticated users with active subscriptions
  app.get("/api/meetings", async (req, res) => {
    const meetings = await storage.getAllMeetings();
    const isAuth = ((req.session as any)?.userId !== undefined);
    const userId = isAuth ? (req.session as any)?.userId : null;
    const user = userId ? await storage.getUser(userId) : null;
    const hasActiveSubscription = user?.subscriptionStatus === "active";
    
    // Sanitize meetings - remove Zoom links for unauthorized users
    const sanitizedMeetings = meetings.map(meeting => {
      const canAccess = !meeting.isPaidOnly || (isAuth && hasActiveSubscription);
      
      if (canAccess) {
        return meeting;
      } else {
        // Remove Zoom link for unauthorized users
        const { zoomLink, ...sanitizedMeeting } = meeting;
        return sanitizedMeeting;
      }
    });
    
    res.json(sanitizedMeetings);
  });

  // Market data (crypto, stocks, commodities, forex)
  app.get("/api/market/data", async (_req, res) => {
    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22BNBUSDT%22]"
      );
      
      let cryptoData = [];
      if (response.ok) {
        const data = await response.json();
        cryptoData = data.map((item: any) => ({
          type: "crypto",
          symbol: item.symbol.replace("USDT", ""),
          name: item.symbol.replace("USDT", ""),
          price: parseFloat(item.lastPrice),
          change24h: parseFloat(item.priceChangePercent),
        }));
      }
      
      const fallbackData = [
        { type: "crypto", symbol: "BTC", name: "Bitcoin", price: 43250.50, change24h: 2.45 },
        { type: "crypto", symbol: "ETH", name: "Ethereum", price: 2275.30, change24h: 1.82 },
        { type: "crypto", symbol: "BNB", name: "Binance Coin", price: 315.75, change24h: -0.65 },
        { type: "stock", symbol: "AAPL", name: "Apple", price: 228.45, change24h: 1.23 },
        { type: "stock", symbol: "GOOGL", name: "Google", price: 156.78, change24h: -0.45 },
        { type: "stock", symbol: "MSFT", name: "Microsoft", price: 423.19, change24h: 2.11 },
        { type: "commodity", symbol: "GOLD", name: "Gold", price: 2045.50, change24h: 0.67 },
        { type: "forex", symbol: "EUR/USD", name: "Euro", price: 1.0895, change24h: 0.32 },
        { type: "forex", symbol: "GBP/USD", name: "Pound", price: 1.2750, change24h: -0.15 },
        { type: "forex", symbol: "USD/JPY", name: "Yen", price: 148.65, change24h: 0.89 },
      ];
      
      const marketData = cryptoData.length > 0 ? [...cryptoData, ...fallbackData.slice(3)] : fallbackData;
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      const fallbackData = [
        { type: "crypto", symbol: "BTC", name: "Bitcoin", price: 43250.50, change24h: 2.45 },
        { type: "crypto", symbol: "ETH", name: "Ethereum", price: 2275.30, change24h: 1.82 },
        { type: "crypto", symbol: "BNB", name: "Binance Coin", price: 315.75, change24h: -0.65 },
        { type: "stock", symbol: "AAPL", name: "Apple", price: 228.45, change24h: 1.23 },
        { type: "stock", symbol: "GOOGL", name: "Google", price: 156.78, change24h: -0.45 },
        { type: "stock", symbol: "MSFT", name: "Microsoft", price: 423.19, change24h: 2.11 },
        { type: "commodity", symbol: "GOLD", name: "Gold", price: 2045.50, change24h: 0.67 },
        { type: "forex", symbol: "EUR/USD", name: "Euro", price: 1.0895, change24h: 0.32 },
        { type: "forex", symbol: "GBP/USD", name: "Pound", price: 1.2750, change24h: -0.15 },
        { type: "forex", symbol: "USD/JPY", name: "Yen", price: 148.65, change24h: 0.89 },
      ];
      res.json(fallbackData);
    }
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
  app.get("/api/user/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.json(null);
      }
      
      const plan = await storage.getSubscriptionPlan(subscription.planId);
      
      res.json({
        ...subscription,
        plan: plan || null,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user/progress", isAuthenticated, async (req, res) => {
    const progress = await storage.getUserProgress((req.session as any)?.userId);
    res.json(progress);
  });

  app.get("/api/progress/:courseId", isAuthenticated, async (req, res) => {
    const progress = await storage.getCourseProgress((req.session as any)?.userId, req.params.courseId);
    res.json(progress);
  });

  app.post("/api/progress", isAuthenticated, async (req, res) => {
    try {
      const validated = insertProgressSchema.parse({
        ...req.body,
        userId: (req.session as any)?.userId,
      });
      
      const progress = await storage.upsertProgress(validated);
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update watch progress (for sequential video tracking)
  app.patch("/api/progress/:lessonId/watch", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const { lessonId } = req.params;
      const { watchProgress, courseId } = req.body;
      
      // Get lesson to check duration
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      // Calculate if video is completed (watched at least 95% of duration)
      const completed = lesson.duration ? watchProgress >= (lesson.duration * 0.95) : false;
      
      const progressData = {
        userId,
        lessonId,
        courseId: courseId || lesson.courseId,
        completed,
        watchProgress,
        completedAt: completed ? new Date() : undefined,
      };
      
      const progress = await storage.upsertProgress(progressData);
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
        const userId = (req.session as any)?.userId;
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

        if (!validated.planId) {
          return res.status(400).json({ message: "Plan ID is required" });
        }

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

  // Admin analytics endpoint
  app.get("/api/admin/analytics", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Payment Settings routes
  app.get("/api/payment-settings", async (_req, res) => {
    try {
      const settings = await storage.getPaymentSettings();
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      res.status(500).json({ message: "Failed to fetch payment settings" });
    }
  });

  app.post("/api/admin/payment-settings", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const settings = await storage.upsertPaymentSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating payment settings:", error);
      res.status(500).json({ message: error.message || "Failed to update payment settings" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, requireAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.patch("/api/admin/users/:id/deactivate", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = (req.session as any)?.userId;
      
      if (currentUserId === id) {
        return res.status(400).json({ message: "You cannot deactivate your own account" });
      }
      
      const user = await storage.deactivateUser(id);
      res.json(user);
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: error.message || "Failed to deactivate user" });
    }
  });

  app.patch("/api/admin/users/:id/activate", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.activateUser(id);
      res.json(user);
    } catch (error: any) {
      console.error("Error activating user:", error);
      res.status(500).json({ message: error.message || "Failed to activate user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = (req.session as any)?.userId;
      
      if (currentUserId === id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: error.message || "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:id/cancel-subscription", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!targetUser.subscriptionStatus || targetUser.subscriptionStatus === "none" || targetUser.subscriptionStatus === "cancelled") {
        return res.status(400).json({ message: "User does not have an active subscription" });
      }
      
      const user = await storage.cancelUserSubscription(id);
      res.json(user);
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: error.message || "Failed to cancel subscription" });
    }
  });

  app.get("/api/admin/courses", isAuthenticated, requireAdmin, async (_req, res) => {
    const courses = await storage.getAllCourses();
    res.json(courses);
  });

  // Configure multer for course uploads (thumbnail + videos)
  const courseUpload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        const tempDir = path.join(process.cwd(), "uploads", "temp");
        ensureDir(tempDir);
        cb(null, tempDir);
      },
      filename: (_req, file, cb) => {
        const uniqueName = generateUniqueFilename(file.originalname, file.fieldname);
        cb(null, uniqueName);
      },
    }),
    limits: {
      fileSize: MAX_VIDEO_SIZE, // Max 2GB for videos
      files: 20, // Max 20 files total (1 thumbnail + up to 19 lesson videos)
    },
    fileFilter: (_req, file, cb) => {
      if (file.fieldname === "thumbnail") {
        if (!validateMimeType(file.mimetype, ALLOWED_IMAGE_TYPES)) {
          return cb(new Error("Invalid thumbnail format. Only JPEG, PNG, and WebP are allowed."));
        }
      } else if (file.fieldname.startsWith("lessonVideo_")) {
        if (!validateMimeType(file.mimetype, ALLOWED_VIDEO_TYPES)) {
          return cb(new Error("Invalid video format. Only MP4, WebM, and MOV are allowed."));
        }
      }
      cb(null, true);
    },
  });

  app.post("/api/admin/courses", isAuthenticated, requireAdmin, (req, res) => {
    courseUpload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "lessonVideos", maxCount: 20 },
    ])(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File size exceeds 2GB limit" });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({ message: "Too many files uploaded" });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const uploadedFiles: string[] = [];
      let courseId: string | null = null;

      try {
        // Validate thumbnail size if provided
        if (files.thumbnail && files.thumbnail[0]) {
          if (!validateFileSize(files.thumbnail[0].size, MAX_THUMBNAIL_SIZE)) {
            throw new Error("Thumbnail size exceeds 5MB limit");
          }
          uploadedFiles.push(files.thumbnail[0].path);
        }

        // Validate lesson video sizes if provided
        if (files.lessonVideos) {
          for (const video of files.lessonVideos) {
            if (!validateFileSize(video.size, MAX_VIDEO_SIZE)) {
              throw new Error(`Video ${video.originalname} exceeds 2GB limit`);
            }
            uploadedFiles.push(video.path);
          }
        }

        // Parse and validate course data
        const courseData = {
          ...req.body,
          level: parseInt(req.body.level),
          price: req.body.price, // Keep as string for decimal field
          duration: parseInt(req.body.duration),
          isFree: req.body.isFree === "true" || req.body.isFree === true,
          requiredPlanId: req.body.requiredPlanId || null,
        };

        const validated = insertCourseSchema.parse(courseData);

        // Create course in database
        const course = await storage.createCourse(validated);
        courseId = course.id;

        // Move thumbnail to final destination if uploaded
        if (files.thumbnail && files.thumbnail[0] && courseId) {
          const thumbnailFile = files.thumbnail[0];
          const courseDir = getCourseUploadDir(courseId);
          const thumbnailDir = path.join(courseDir, "thumbnails");
          ensureDir(thumbnailDir);
          
          const finalPath = path.join(thumbnailDir, generateUniqueFilename(thumbnailFile.originalname, "thumbnail"));
          fs.renameSync(thumbnailFile.path, finalPath);
          
          // Update course with thumbnail path
          await storage.updateCourse(courseId, {
            thumbnailUrl: `/uploads/courses/${courseId}/thumbnails/${path.basename(finalPath)}`,
          });
        }

        res.json(course);
      } catch (error: any) {
        // Cleanup uploaded files on error
        for (const filePath of uploadedFiles) {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch {}
        }

        // Cleanup course directory if created
        if (courseId) {
          await cleanupCourseDir(courseId);
          // Optionally delete the course from database if it was created
          try {
            await storage.deleteCourse(courseId);
          } catch {}
        }

        res.status(400).json({ message: error.message || "Failed to create course" });
      }
    });
  });

  app.patch("/api/admin/courses/:id", isAuthenticated, requireAdmin, (req, res) => {
    courseUpload.fields([
      { name: "thumbnail", maxCount: 1 },
    ])(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File size exceeds 2GB limit" });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const uploadedFiles: string[] = [];

      try {
        const currentCourse = await storage.getCourse(req.params.id);
        if (!currentCourse) {
          return res.status(404).json({ message: "Course not found" });
        }

        if (files.thumbnail && files.thumbnail[0]) {
          if (!validateFileSize(files.thumbnail[0].size, MAX_THUMBNAIL_SIZE)) {
            throw new Error("Thumbnail size exceeds 5MB limit");
          }
          uploadedFiles.push(files.thumbnail[0].path);
        }

        const courseData: any = {
          titleEn: req.body.titleEn,
          titleAr: req.body.titleAr,
          descriptionEn: req.body.descriptionEn || null,
          descriptionAr: req.body.descriptionAr || null,
          instructorEn: req.body.instructorEn || null,
          instructorAr: req.body.instructorAr || null,
          level: req.body.level ? parseInt(req.body.level) : undefined,
          price: req.body.price || undefined,
          duration: req.body.duration ? parseInt(req.body.duration) : undefined,
          isFree: req.body.isFree === "true" || req.body.isFree === true,
          requiredPlanId: req.body.requiredPlanId === "null" || req.body.requiredPlanId === "" ? null : req.body.requiredPlanId,
          language: req.body.language || "en",
        };

        if (files.thumbnail && files.thumbnail[0]) {
          const thumbnailFile = files.thumbnail[0];
          const courseDir = getCourseUploadDir(req.params.id);
          const thumbnailDir = path.join(courseDir, "thumbnails");
          ensureDir(thumbnailDir);
          
          const extension = path.extname(thumbnailFile.originalname);
          const newFilename = `${Date.now()}-${slugify(req.body.titleEn || "course")}${extension}`;
          const finalPath = path.join(thumbnailDir, newFilename);
          
          fs.renameSync(thumbnailFile.path, finalPath);
          
          courseData.thumbnailUrl = `/uploads/courses/${req.params.id}/thumbnails/${newFilename}`;
        } else {
          courseData.thumbnailUrl = currentCourse.thumbnailUrl;
        }

        const course = await storage.updateCourse(req.params.id, courseData);
        res.json(course);
      } catch (error: any) {
        uploadedFiles.forEach(file => {
          try {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          } catch {}
        });

        res.status(400).json({ message: error.message || "Failed to update course" });
      }
    });
  });

  app.delete("/api/admin/courses/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteCourse(req.params.id);
      res.json({ message: "Course deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Configure multer for lesson video uploads
  const lessonUpload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        const tempDir = path.join(process.cwd(), "uploads", "temp");
        ensureDir(tempDir);
        cb(null, tempDir);
      },
      filename: (_req, file, cb) => {
        const uniqueName = generateUniqueFilename(file.originalname, "video");
        cb(null, uniqueName);
      },
    }),
    limits: {
      fileSize: MAX_VIDEO_SIZE, // Max 2GB
    },
    fileFilter: (_req, file, cb) => {
      if (!validateMimeType(file.mimetype, ALLOWED_VIDEO_TYPES)) {
        return cb(new Error("Invalid video format. Only MP4, WebM, and MOV are allowed."));
      }
      cb(null, true);
    },
  });

  app.post("/api/admin/lessons", isAuthenticated, requireAdmin, (req, res) => {
    lessonUpload.single("video")(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "Video size exceeds 2GB limit" });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const videoFile = req.file;
      let uploadedFilePath: string | null = null;
      let lessonId: string | null = null;
      let lessonCourseId: string | null = null;

      try {
        // Validate video size if provided
        if (videoFile) {
          if (!validateFileSize(videoFile.size, MAX_VIDEO_SIZE)) {
            throw new Error("Video size exceeds 2GB limit");
          }
          uploadedFilePath = videoFile.path;
        }

        // Parse and validate lesson data
        const lessonData = {
          ...req.body,
          duration: parseInt(req.body.duration),
          order: parseInt(req.body.order),
          requiresPrevious: req.body.requiresPrevious === "true" || req.body.requiresPrevious === true,
          isFree: req.body.isFree === "true" || req.body.isFree === true,
        };

        const validated = insertLessonSchema.parse(lessonData);
        lessonCourseId = validated.courseId;

        // Create lesson in database
        const lesson = await storage.createLesson(validated);
        lessonId = lesson.id;

        // Move video to final destination if uploaded
        if (videoFile && lessonId && validated.courseId) {
          const courseDir = getCourseUploadDir(validated.courseId);
          const videoDir = path.join(courseDir, "videos", lessonId);
          ensureDir(videoDir);
          
          const finalPath = path.join(videoDir, generateUniqueFilename(videoFile.originalname, "lesson"));
          fs.renameSync(videoFile.path, finalPath);
          
          // Update lesson with video paths
          await storage.updateLesson(lessonId, {
            videoUrl: `/uploads/courses/${validated.courseId}/videos/${lessonId}/${path.basename(finalPath)}`,
            videoFilePath: finalPath,
          });
        }

        res.json(lesson);
      } catch (error: any) {
        // Comprehensive cleanup on error - clean up temp file
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
          try {
            fs.unlinkSync(uploadedFilePath);
          } catch {}
        }
        
        // Clean up final video directory if lesson was created
        if (lessonId && lessonCourseId) {
          const videoDir = path.join(getCourseUploadDir(lessonCourseId), "videos", lessonId);
          if (fs.existsSync(videoDir)) {
            try {
              fs.rmSync(videoDir, { recursive: true, force: true });
            } catch {}
          }
        }

        // Delete the lesson from database if it was created
        if (lessonId) {
          try {
            await storage.deleteLesson(lessonId);
          } catch {}
        }

        res.status(400).json({ message: error.message || "Failed to create lesson" });
      }
    });
  });

  app.delete("/api/admin/lessons/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteLesson(req.params.id);
      res.json({ message: "Lesson deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Course Resources Routes
  app.get("/api/courses/:courseId/resources", async (req, res) => {
    try {
      const resources = await storage.getCourseResources(req.params.courseId);
      res.json(resources);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/courses/:courseId/resources", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { insertCourseResourceSchema } = await import("@shared/schema");
      const validated = insertCourseResourceSchema.parse({
        ...req.body,
        courseId: req.params.courseId,
      });
      const resource = await storage.createCourseResource(validated);
      res.json(resource);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/course-resources/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const resource = await storage.updateCourseResource(req.params.id, {
        ...req.body,
        updatedAt: new Date(),
      });
      res.json(resource);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/course-resources/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteCourseResource(req.params.id);
      res.json({ message: "Resource deleted successfully" });
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
        // Get the user being paid for
        const user = await storage.getUser(payment.userId);
        
        await storage.updateUser(payment.userId, {
          subscriptionStatus: "active",
        });

        const subscription = await storage.getUserSubscription(payment.userId);
        if (subscription) {
          await storage.updateSubscription(subscription.id, {
            status: "active",
          });
        }

        // Credit referrer with $10 if user was referred
        if (user && user.referredBy) {
          const referrer = await storage.getUserByReferralCode(user.referredBy);
          if (referrer) {
            await storage.addReferralEarnings(referrer.id, payment.userId, 10);
            console.log(`Credited $10 to referrer ${referrer.email} for referral of ${user.email}`);
          }
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
      // Convert scheduledAt string to Date object
      const meetingData = {
        ...req.body,
        scheduledAt: new Date(req.body.scheduledAt),
        courseId: req.body.courseId || null,
      };
      
      const meeting = await storage.createMeeting(meetingData);
      res.json(meeting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/meetings/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      // Convert scheduledAt string to Date object if provided
      const updateData = {
        ...req.body,
      };
      
      if (req.body.scheduledAt) {
        updateData.scheduledAt = new Date(req.body.scheduledAt);
      }
      
      if (req.body.courseId !== undefined) {
        updateData.courseId = req.body.courseId || null;
      }
      
      const meeting = await storage.updateMeeting(req.params.id, updateData);
      res.json(meeting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/meetings/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteMeeting(req.params.id);
      res.json({ message: "Meeting deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Settings API (for social links, etc.)
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/settings", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const settingsSchema = z.object({
        settings: z.array(z.object({
          key: z.string().min(1),
          value: z.string(),
        })),
      });
      
      const { settings: settingsArray } = settingsSchema.parse(req.body);
      
      const updated = await Promise.all(
        settingsArray.map(async (setting) => {
          return await storage.upsertSetting(setting.key, setting.value);
        })
      );
      
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User Profile & Settings API
  app.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      const profileSchema = z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phone: z.string().optional(),
      });
      
      const validated = profileSchema.parse(req.body);
      
      const updated = await storage.updateUser(userId, validated);
      
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/user/password", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      const passwordSchema = z.object({
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6),
      });
      
      const { currentPassword, newPassword } = passwordSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(userId, { passwordHash: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User Subscription API
  app.get("/api/user/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.json(null);
      }
      
      const plan = subscription.planId 
        ? await storage.getSubscriptionPlan(subscription.planId)
        : null;
      
      res.json({ ...subscription, plan });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User Reviews API
  app.get("/api/user/reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const allTestimonials = await storage.getAllTestimonials();
      const userReviews = allTestimonials.filter(
        t => t.userId === userId
      );
      
      res.json(userReviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      const reviewSchema = z.object({
        rating: z.number().min(1).max(5),
        content: z.string().min(10).max(1000),
      });
      
      const { rating, content } = reviewSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const testimonial = await storage.createTestimonial({
        nameEn: `${user.firstName} ${user.lastName}`,
        nameAr: `${user.firstName} ${user.lastName}`,
        roleEn: "Student",
        roleAr: "طالب",
        contentEn: content,
        contentAr: content,
        rating,
        userId,
        isActive: false, // Requires admin approval
      });
      
      res.json(testimonial);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Referral API endpoints
  app.get("/api/referral/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stats = await storage.getReferralStats(userId);
      
      // Get referrals with user details
      const referrals = await db
        .select()
        .from(users)
        .where(eq(users.referredBy, user.referralCode));

      res.json({
        code: user.referralCode,
        count: stats.count,
        earnings: stats.earnings,
        referrals: referrals.map(u => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          subscriptionStatus: u.subscriptionStatus,
          createdAt: u.createdAt,
        })),
        transactions: stats.transactions,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/referral/process-earnings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const { referrerId, referredUserId, amount } = req.body;

      if (!referrerId || !referredUserId) {
        return res.status(400).json({ message: "Missing referrer or referred user" });
      }

      const transaction = await storage.addReferralEarnings(referrerId, referredUserId, amount || 10);
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Withdrawal endpoints
  app.post("/api/withdrawals/request", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const { amount, walletAddress, chain } = req.body;

      // Validate minimum withdrawal amount
      if (parseFloat(amount) < 100) {
        return res.status(400).json({ message: "Minimum withdrawal amount is $100" });
      }

      // Check user's current earnings
      const user = await storage.getUser(userId);
      if (!user || parseFloat(user.referralEarnings || "0") < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const withdrawal = await storage.createWithdrawalRequest({
        userId,
        amount,
        walletAddress,
        chain,
      });

      res.json(withdrawal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/withdrawals/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const withdrawals = await storage.getUserWithdrawals(userId);
      res.json(withdrawals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/withdrawals/admin", requireAdmin, async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawalRequests();
      
      // Get user details for each withdrawal
      const withUserDetails = await Promise.all(
        withdrawals.map(async (w) => {
          const user = await storage.getUser(w.userId);
          return {
            ...w,
            userName: `${user?.firstName} ${user?.lastName}`,
            userEmail: user?.email,
            referralCode: user?.referralCode,
            referralCount: user?.referralCount || 0,
            referralEarnings: user?.referralEarnings || "0",
            phone: user?.phone,
            subscriptionStatus: user?.subscriptionStatus,
          };
        })
      );

      res.json(withUserDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/withdrawals/:id/approve", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const withdrawal = await storage.approveWithdrawal(id, adminNotes);
      res.json(withdrawal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/withdrawals/:id/reject", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const withdrawal = await storage.rejectWithdrawal(id, adminNotes);
      res.json(withdrawal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Secure video streaming endpoint with authentication
  app.get("/api/videos/:lessonId/stream", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const { lessonId } = req.params;

      // Get lesson details
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Get course to verify access
      const course = await storage.getCourse(lesson.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check user subscription/access
      const user = await storage.getUser(userId);
      const userSub = await storage.getUserSubscription(userId);

      // Allow access if user has active subscription or is admin
      const hasAccess = user?.role === "admin" || userSub?.status === "active";
      if (!hasAccess) {
        return res.status(403).json({ message: "No access to this course" });
      }

      // Serve video file with security headers
      if (lesson.videoFilePath) {
        const videoPath = path.join(process.cwd(), lesson.videoFilePath);

        // Set security headers to prevent caching and downloading
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Security-Policy", "default-src 'self'");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Content-Disposition", "inline; filename=video.mp4");

        // Stream video file
        res.sendFile(videoPath);
      } else if (lesson.videoUrl) {
        // If external URL, redirect securely
        res.json({ url: lesson.videoUrl });
      } else {
        return res.status(404).json({ message: "Video not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

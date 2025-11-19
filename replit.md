# Leedacademya - Trading Education Platform

## Overview

Leedacademya is a premium bilingual (English/Arabic) cryptocurrency trading education platform. The application provides comprehensive course management, user subscriptions, payment processing, live Zoom sessions, and progress tracking. It features a modern landing page, user dashboard, and advanced admin panel for content and subscription management.

The platform is built as a full-stack TypeScript application with a React frontend and Express backend, designed to deliver a sophisticated fintech user experience with Material Design principles and premium aesthetics inspired by platforms like SmartTrader.me.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- React Query (TanStack Query) for server state management and caching

**UI Component System**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- CVA (Class Variance Authority) for component variant management
- Custom theming system supporting light/dark modes
- RTL/LTR layout support for Arabic/English bilingual interface

**User Dashboard Navigation**
- Tab-based interface using Shadcn Tabs component (replaced sidebar navigation)
- Single /dashboard route with URL query parameter support (?tab=courses, ?tab=subscription, etc.)
- Deep linking support for direct access to specific tabs
- Browser back/forward navigation synchronized with tab state via wouter location hooks
- Five main sections: My Courses, Subscription, Join Group, Settings, Ratings
- URL state management with useEffect listening to location changes

**State Management**
- React Query for server state with optimistic updates
- React Context for theme and language preferences
- React Hook Form with Zod validation for form state

**Design System**
- Typography: Inter (UI/body) and Poppins (headings) from Google Fonts
- Spacing: Tailwind unit system (2, 4, 6, 8, 12, 16, 20, 24)
- Color system: HSL-based with CSS variables for theme switching
- Component patterns: Cards with elevation states, glassmorphism effects, hover animations

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for type-safe REST API development
- Session-based authentication with PostgreSQL session store
- File upload handling via Multer with security validation
- Error handling middleware with structured logging

**Authentication & Authorization**
- Email/password authentication with bcrypt hashing (10 rounds)
- Session-based authentication with PostgreSQL session store
- Session fixation prevention via session regeneration
- Role-based access control (user/admin roles)
- Protected routes with authentication and admin middleware
- Password hash sanitization in all API responses

**API Structure**
- RESTful endpoints organized by resource type
- Request validation using Zod schemas
- Standardized JSON responses with error codes
- File serving for uploaded content (payment proofs, course materials)

**Business Logic Layer**
- Storage abstraction layer for database operations
- Separation of concerns: routes → controllers → storage
- Transaction support for payment and subscription operations
- Progress tracking with lesson completion validation

### Data Storage

**Database**
- PostgreSQL via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with TypeScript type inference

**Schema Design**
- Users: Email/password auth, phone number, roles, subscription status, referral system
- Courses: Multi-level system (Level 1-3), bilingual content, pricing
- Lessons: Sequential ordering, video URLs, access control, duration tracking
- Subscription Plans: Tiered pricing, feature lists, duration-based
- Subscriptions: User enrollments with start/end dates, status tracking
- Payments: Crypto/bank transfer support, proof uploads, admin approval workflow
- Progress: Per-lesson completion tracking with timestamps
- Meetings: Zoom session scheduling with paid/free access control
- Testimonials: User reviews with ratings and bilingual content
- Sessions: PostgreSQL-backed session storage for authentication

**Data Relationships**
- One-to-many: Users → Subscriptions, Courses → Lessons
- Many-to-one: Progress → Users/Lessons, Payments → Users/Plans
- Referential integrity enforced through foreign key constraints

### External Dependencies

**Authentication**
- Bcrypt for password hashing and validation
- Express-session for session management
- Zod for request validation and sanitization
- Session regeneration for security

**Database**
- Neon serverless PostgreSQL for production database hosting
- WebSocket connection support for serverless environments
- Drizzle Kit for schema migrations

**File Storage**
- Local filesystem storage for uploaded files (payment proofs, course thumbnails, lesson videos)
- Multer for multipart form data handling
- File type validation:
  - Course thumbnails: JPEG, PNG, WebP only (max 5MB)
  - Lesson videos: MP4, WebM, MOV only (max 2GB)
  - Payment proofs: JPEG, PNG, PDF only (max 10MB)
- Timestamp-based unique filenames with slugs for better organization
- Directory structure:
  - uploads/courses/{courseId}/thumbnails/ - Course thumbnail images
  - uploads/courses/{courseId}/videos/{lessonId}/ - Lesson video files
  - uploads/ - Payment proof files
- Automatic cleanup on errors (files deleted if database operation fails)

**UI Components**
- Radix UI primitives for accessible component foundations
- Lucide React for icon system
- React Day Picker for date selection
- Recharts for analytics visualization (admin dashboard)
- Embla Carousel for testimonial rotations
- CMDK for command palette patterns

**Development Tools**
- Replit-specific plugins for development environment integration
- Runtime error overlay for debugging
- Source map support for production troubleshooting

**Payment Integration**
- Manual payment processing (no automated gateway)
- Support for cryptocurrency wallets (USDT, BTC, ETH addresses)
- Bank transfer with proof upload workflow
- Admin approval system for payment verification

**Video Content**
- External video hosting (URLs stored in database)
- No integrated video player library (uses HTML5 video element)
- Progress tracking via video playback events

**Styling & Design**
- Google Fonts API for web typography
- PostCSS with Autoprefixer for CSS processing
- Tailwind CSS JIT compiler for production optimization

**Form Validation**
- Zod for runtime schema validation
- Hookform Resolvers for React Hook Form integration
- Type-safe form handling with TypeScript inference
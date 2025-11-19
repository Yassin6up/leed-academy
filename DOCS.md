# Leedacademya - Application Documentation

## Overview

Leedacademya is a comprehensive bilingual (English/Arabic) cryptocurrency trading education platform featuring:
- Multi-level course system (Level 1-3)
- Subscription-based access control
- Payment processing (crypto & bank transfer)
- Live Zoom meeting scheduling
- Referral system
- Admin dashboard with analytics
- Udemy-style video player with progress tracking

---

## Authentication System

### How Login/Register Works

The application uses **Replit OIDC (OpenID Connect)** for secure authentication.

#### User Flow:
1. **Visit `/auth`** - Access the login/register page
2. **Choose Login or Register** - Select appropriate tab
3. **Referral Code** - During registration, optionally enter a referral code
4. **Replit Authentication** - Redirected to Replit for secure login
5. **Auto Account Creation** - Account created automatically on first login
6. **Redirect** - Sent to dashboard (users) or admin panel (admins)

#### Login vs Register:
- **Login**: For existing users - redirects directly to OIDC
- **Register**: For new users - allows entering referral code before OIDC redirect
- Both use the same Replit authentication system
- Account is created automatically during first OIDC callback

### Referral System:
- Each user gets a unique 8-character referral code upon registration
- New users can enter a referral code during registration
- Referral code is stored in session and applied during OIDC callback
- Only applied for first-time users

### User Roles:
- **User** (default): Access to courses, dashboard, subscription
- **Admin**: Full access to admin panel + all user features

### Session Management & Token Expiry:

The authentication system uses robust fallback logic to ensure reliable session expiry handling across different OIDC providers:

**Expiry Fallback Chain:**
1. **Primary**: `claims.exp` from ID token
2. **Fallback 1**: `tokens.expires_at` from token response
3. **Fallback 2**: Calculated from `tokens.expires_in` (current time + expires_in seconds)
4. **Final**: `undefined` (if all methods fail)

This ensures that even providers with minimal token metadata maintain valid sessions for downstream authentication checks (`isAuthenticated`, `/api/auth/user`).

**Session Data Structure:**
```javascript
req.user = {
  // Profile data from database
  id, email, firstName, lastName, profileImageUrl, 
  referralCode, referredBy, role, 
  // Token metadata
  claims, access_token, refresh_token, expires_at
}
```

---

## Routes & Pages

### Public Routes (No Authentication Required)

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, testimonials |
| `/auth` | Login/Register page with referral code input |
| `/about` | About the academy and team |
| `/services` | Services offered |
| `/contact` | Contact form |
| `/pricing` | Subscription plans pricing |
| `/courses` | Browse all available courses |
| `/course/:id` | View specific course details |
| `/news` | Upcoming Zoom meetings/sessions |

### Protected Routes (Authentication Required)

| Route | Description | Access |
|-------|-------------|--------|
| `/dashboard` | User dashboard showing subscriptions and progress | All Users |
| `/subscribe/:planId?` | Subscribe/checkout page with payment options | All Users |

### Admin Routes (Admin Role Required)

| Route | Description |
|-------|-------------|
| `/admin` or `/admin/dashboard` | Admin dashboard with analytics |
| `/admin/users` | Manage users, roles, subscriptions |
| `/admin/courses` | Create/edit courses and lessons |
| `/admin/payments` | Review and approve payment submissions |
| `/admin/analytics` | Advanced analytics (placeholder) |
| `/admin/meetings` | Create/manage Zoom meetings |
| `/admin/settings` | Configure payment information (bank details, crypto wallets) |

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/login` | Initiate OIDC login flow | No |
| GET | `/api/callback` | OIDC callback handler | No |
| GET | `/api/logout` | Logout and clear session | No |
| GET | `/api/auth/user` | Get current user info | Yes |
| POST | `/api/auth/referral-intent` | Store referral code before OIDC | No |

### User & Referral Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/referral/validate/:code` | Check if referral code is valid | No |
| GET | `/api/referral/stats` | Get user's referral statistics | Yes |

### Course Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/courses` | Get all courses | No |
| GET | `/api/courses/:id` | Get specific course | No |
| POST | `/api/admin/courses` | Create new course | Admin |
| PATCH | `/api/admin/courses/:id` | Update course | Admin |
| DELETE | `/api/admin/courses/:id` | Delete course | Admin |

### Lesson Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/courses/:courseId/lessons` | Get lessons for course | No |
| GET | `/api/lessons/:id` | Get specific lesson | Yes |
| POST | `/api/admin/lessons` | Create new lesson | Admin |
| PATCH | `/api/admin/lessons/:id` | Update lesson | Admin |
| DELETE | `/api/admin/lessons/:id` | Delete lesson | Admin |

### Progress Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/progress/:courseId` | Get user's progress for course | Yes |
| POST | `/api/progress` | Update lesson progress | Yes |

### Subscription & Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/subscription-plans` | Get all subscription plans | No |
| GET | `/api/subscriptions` | Get user's subscriptions | Yes |
| POST | `/api/payments` | Submit payment proof | Yes |
| GET | `/api/admin/payments` | Get all payments (for review) | Admin |
| PATCH | `/api/admin/payments/:id` | Approve/reject payment | Admin |
| GET | `/api/payment-settings` | Get payment configuration | Yes |
| POST | `/api/admin/payment-settings` | Update payment settings | Admin |

### Meeting Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/meetings` | Get all upcoming meetings | No |
| POST | `/api/admin/meetings` | Create new meeting | Admin |
| DELETE | `/api/admin/meetings/:id` | Delete meeting | Admin |

### Analytics & Stats

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/stats` | Get platform statistics | No |
| GET | `/api/admin/analytics` | Get detailed analytics | Admin |

---

## Key Features

### 1. Course System
- **3-Level Structure**: Level 1 (Beginner), Level 2 (Intermediate), Level 3 (Advanced)
- **Sequential Lessons**: Lessons must be completed in order
- **Video Content**: Each lesson has a video URL and description
- **Progress Tracking**: 95% video completion required to unlock next lesson
- **Access Control**: Requires active subscription

### 2. Subscription System
- **Multiple Plans**: Different pricing tiers with various features
- **Payment Methods**: Cryptocurrency (BTC, ETH, USDT) or Bank Transfer
- **Manual Approval**: Admin reviews and approves all payment proofs
- **Duration-Based**: Plans have specific durations (30, 90, 365 days)

### 3. Payment Processing
- **Admin-Configured**: Payment details set by admin in `/admin/settings`
- **Payment Information**: Bank details (name, account, IBAN, SWIFT) and crypto wallets
- **Proof Upload**: Users upload payment proof (image or PDF, max 10MB)
- **Admin Review**: Admins approve/reject payments in `/admin/payments`

### 4. Referral System
- **Unique Codes**: Each user gets 8-character referral code (e.g., "ABC12345")
- **Registration Bonus**: New users enter code during registration
- **Tracking**: Users can see their referral count
- **Validation**: Real-time validation during registration

### 5. Admin Dashboard
- **User Management**: View users, change roles, manage subscriptions
- **Course Management**: Create/edit courses and lessons
- **Payment Review**: Approve/reject payment submissions
- **Analytics**: View platform statistics
- **Meeting Management**: Schedule Zoom sessions
- **Settings**: Configure payment information

### 6. Udemy-Style Video Player
- **Full-Width Player**: Immersive video experience
- **Fixed Sidebar**: Lesson list always visible
- **Tabbed Content**: Overview, Resources, Sessions
- **Navigation**: Previous/Next buttons
- **Progress Bar**: Visual progress indicator

---

## How to Use as Admin

### First Time Setup:
1. **Login**: Visit `/auth` and login with Replit
2. **Database**: Manually set your role to 'admin' in database
3. **Payment Settings**: Go to `/admin/settings` and configure:
   - Bank account details
   - Crypto wallet addresses
   - Payment instructions
4. **Create Subscription Plans**: Add pricing tiers
5. **Create Courses**: Add courses with lessons
6. **Schedule Meetings**: Add Zoom session information

### Managing Courses:
1. Go to `/admin/courses`
2. Click "Create Course"
3. Fill in course details (title, description, level, price)
4. Add lessons to the course with video URLs

### Approving Payments:
1. Go to `/admin/payments`
2. Review pending payment submissions
3. Check payment proof images
4. Approve or reject with notes

### Managing Users:
1. Go to `/admin/users`
2. View all registered users
3. Change user roles (user → admin)
4. View subscription status

---

## How to Use as User

### Getting Started:
1. **Register**: Visit `/auth` and click "Register" tab
2. **Referral Code** (Optional): Enter code if you have one
3. **Login with Replit**: Complete authentication
4. **Browse Courses**: View available courses at `/courses`
5. **Choose Plan**: Select subscription plan at `/pricing`

### Subscribing:
1. Click "Subscribe" on a plan
2. Fill in personal information
3. Choose payment method (Crypto or Bank Transfer)
4. Upload payment proof
5. Wait for admin approval
6. Access courses once approved

### Taking Courses:
1. Go to `/dashboard` to see your subscriptions
2. Click on a course to start learning
3. Watch video lessons sequentially
4. Complete 95% of video to unlock next lesson
5. Track your progress

### Referrals:
1. Find your referral code in `/dashboard`
2. Share with friends
3. They enter your code during registration
4. Track your referrals in dashboard

---

## Database Schema

### Key Tables:
- **users**: User accounts, roles, referral codes
- **courses**: Course information and pricing
- **lessons**: Video lessons linked to courses
- **subscription_plans**: Available subscription tiers
- **subscriptions**: Active user subscriptions
- **payments**: Payment submissions and approvals
- **progress**: User lesson completion tracking
- **meetings**: Scheduled Zoom sessions
- **payment_settings**: Admin-configured payment information
- **sessions**: Session storage for authentication

---

## Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `ISSUER_URL`: OIDC provider URL (default: Replit)
- `REPL_ID`: Replit application ID

---

## Tech Stack

### Frontend:
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for server state
- **Shadcn/ui** + Radix UI components
- **Tailwind CSS** for styling
- **React Hook Form** + Zod for forms

### Backend:
- **Express.js** with TypeScript
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM** for database
- **Passport.js** for OIDC authentication
- **Multer** for file uploads
- **Express Session** for session management

---

## Development Commands

```bash
# Start development server
npm run dev

# Push database schema changes
npm run db:push

# Force push schema changes
npm run db:push -- --force
```

---

## Support

For questions or issues, please contact the development team or check the repository documentation.

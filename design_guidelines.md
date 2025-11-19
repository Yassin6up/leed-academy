# Design Guidelines: Premium Trading Education Platform

## Design Approach

**Hybrid Approach**: Combine SmartTrader.me's premium aesthetic (sophisticated fintech design) with Material Design principles for dashboard functionality. Reference platforms: SmartTrader.me for marketing pages, Udemy for course layouts, Stripe for payment flows.

**Key Design Principles**:
- Professional sophistication with financial credibility
- Data-driven trust building through live market integration
- Bilingual excellence with seamless RTL/LTR switching
- Premium education platform aesthetics

## Typography System

**Primary Font**: Inter (Google Fonts) - for UI, navigation, body text
**Accent Font**: Poppins - for headings, CTAs, emphasis

**Hierarchy**:
- Hero Headlines: Poppins Bold, 48-64px (desktop), 32-40px (mobile)
- Section Headers: Poppins SemiBold, 32-40px (desktop), 24-28px (mobile)
- Card Titles: Inter SemiBold, 20-24px
- Body Text: Inter Regular, 16-18px
- UI Labels: Inter Medium, 14-16px
- Captions: Inter Regular, 12-14px

**RTL Considerations**: Maintain same font sizes but adjust letter-spacing for Arabic (slightly tighter)

## Layout System

**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24 (desktop), py-12 (mobile)
- Card gaps: gap-6 to gap-8
- Container: max-w-7xl with px-6

**Grid System**:
- Course cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Feature sections: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Dashboard: Sidebar (260px) + Content area with responsive collapse

## Component Library

### Navigation
**Header**: Fixed top navigation with glassmorphism effect (backdrop-blur), height 80px
- Logo left, nav center, language switcher + CTA right
- Mobile: Hamburger menu with slide-in drawer
- RTL: Mirror layout completely

**Language Switcher**: Toggle button with flag icons (AR/EN), smooth transition

### Marketing Pages

**Hero Section** (Home):
- Split layout: 60% content, 40% visual
- Live crypto ticker banner integrated subtly below hero
- Animated numbers/stats
- Primary CTA + Secondary CTA with backdrop-blur on image background
- Height: 85vh

**Testimonial Slider**:
- Auto-rotating cards (5s interval)
- Card design: Avatar (60px), quote, name, role, 5-star rating
- 3 visible on desktop, 1 on mobile
- Subtle shadow and border treatment

**Live Crypto Widget**:
- Horizontal ticker strip or dashboard-style cards
- Show: BTC, ETH, USDT with price, 24h change, sparkline
- Update every 10s with smooth number transitions
- Position: Below hero or sticky top banner

### Course Catalog

**Course Card**:
- Thumbnail image (16:9 ratio, 400x225px)
- Badge overlay: "Free", "Level 1", "Locked" with icons
- Title, instructor, duration, lesson count
- Progress bar for enrolled users (0-100%)
- Hover: Subtle lift with shadow increase

**Course Detail Page**:
- Hero with course banner image
- Left: Video player / course overview (65%)
- Right: Enrollment card with pricing, locked status (35%)
- Curriculum accordion below with lesson checkmarks

### Dashboard Components

**User Dashboard**:
- Top stats cards: Enrolled Courses, Completed, Hours Watched, Progress
- Main content: Tabs for "My Courses", "Continue Learning", "Certificates"
- Course cards show progress rings and "Continue" CTA

**Admin Dashboard**:
- Sidebar navigation with icons (Users, Courses, Payments, Analytics, Settings)
- Analytics: Line charts for revenue, bar charts for subscriptions, user growth
- Payment review table: User, Amount, Method, Proof Image, Status, Actions
- Course management: Drag-drop lesson ordering, toggle lock/unlock

### Forms & Authentication

**Auth Pages**:
- Centered card (max-w-md) on gradient background
- Social proof element (user count, rating) below form
- Input fields: Icon prefix, floating labels, validation states
- Password strength indicator on register

**Payment Flow**:
- Step indicator (Choose Plan → Payment Method → Upload Proof)
- Plan cards: Highlight "Popular" with border treatment
- Payment method: Radio cards with crypto icons or bank icon
- Upload area: Drag-drop zone for receipt image with preview

### Interactive Elements

**Buttons**:
- Primary: Solid with subtle gradient, rounded-lg
- Secondary: Border with background-blur when on images
- Icon buttons: Consistent 40px × 40px touch targets
- No explicit hover states defined (let Button component handle)

**Cards**:
- Border radius: rounded-xl (12px)
- Shadow: subtle elevation (shadow-md to shadow-lg on hover)
- Padding: p-6 to p-8

**Badges/Tags**:
- Rounded-full, px-3 py-1
- Status indicators: Success (green), Warning (yellow), Locked (gray)

## Images

**Hero Section**: Use a sophisticated trading/education themed image showing:
- Professional trader at multiple screens OR
- Modern classroom/online learning setup OR
- Abstract financial charts with depth of field
- Dimensions: 1920×1080px, optimized for web
- Treatment: Subtle gradient overlay for text contrast

**Course Thumbnails**: Consistent placeholder or branded graphics (400×225px)

**About Page**: Team photo or professional office environment

**Testimonial Avatars**: Circular 60×60px user photos

**Admin Dashboard**: Use chart libraries (Chart.js) for data visualization, no static images

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (single column, stacked layout)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (full multi-column)

**Mobile Adjustments**:
- Collapse navigation to drawer
- Stack hero to single column
- Reduce spacing units by ~30%
- Single-column course grids
- Bottom navigation for dashboard

## RTL (Arabic) Specific

- Mirror entire layout (flex-row-reverse, text-right)
- Reverse grid order where needed
- Icon positions swap (chevrons flip direction)
- Maintain same spacing and proportions
- Test navigation flow thoroughly

## Animations

**Minimal, Purposeful Motion**:
- Page transitions: Subtle fade (200ms)
- Crypto price updates: Number counter animation
- Course unlock: Celebratory micro-interaction (confetti burst, 600ms)
- Avoid: Excessive parallax, complex scroll animations
- Use: Smooth transitions on state changes (loading, success)

## Performance Priorities

- Lazy load course videos and thumbnails
- Optimize crypto API polling (10s intervals, cache)
- Progressive image loading for hero
- Code-split dashboard vs. marketing pages

This design creates a premium, trustworthy trading education platform that balances sophistication with usability across both languages.
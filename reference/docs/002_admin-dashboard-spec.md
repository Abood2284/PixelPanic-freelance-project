# Admin Dashboard - Specification

**Status:** In Progress
**Author:** Abdulraheem
**Last Updated:** 2025-01-27

---

### 1. Overview

The PixelPanic Admin Dashboard is a comprehensive operational hub that provides full control and visibility over business processes. It enables administrators to manage orders, technicians, pricing, customers, and view analytics. The dashboard is designed for desktop-first usage with mobile responsiveness, featuring real-time data updates, role-based access control, and intuitive navigation.

### 2. User Stories

- **As an Admin**, I want to view a dashboard overview with key metrics so that I can quickly assess business performance.
- **As an Admin**, I want to manage all repair orders so that I can track status, assign technicians, and ensure timely completion.
- **As an Admin**, I want to manage the pricing matrix so that I can update service costs and maintain competitive pricing.
- **As an Admin**, I want to manage technicians so that I can onboard new team members and monitor their performance.
- **As an Admin**, I want to view customer information so that I can provide support and track order history.
- **As an Admin**, I want to view analytics and reports so that I can make data-driven business decisions.
- **As an Admin**, I want to create technician invitations so that I can onboard new team members securely.

### 3. Requirements & Acceptance Criteria

#### 3.1 Authentication & Access Control

- [x] Role-gated access: Only `admin` role can access the admin dashboard area.
- [x] Session management with automatic logout on inactivity.
- [x] Forbidden page for unauthorized access attempts.
- [x] Development mode support for multi-role testing.

#### 3.2 Dashboard Overview

- [x] Real-time KPI cards showing:
  - Monthly revenue (last 30 days)
  - Completed jobs count
  - Pending orders count
  - Average repair time
- [x] Recent orders table with status and quick actions.
- [x] Auto-refresh data every 5 minutes.
- [x] Responsive layout for desktop and tablet.

#### 3.3 Order Management

- [x] Orders list page with comprehensive table view.
- [x] Order detail page with complete information:
  - Customer details and contact information
  - Service address (for doorstep orders)
  - Order items and pricing breakdown
  - Status timeline and history
- [x] Technician assignment functionality with OTP generation.
- [x] Status tracking: pending_payment → confirmed → in_progress → completed → cancelled.
- [x] Search and filtering capabilities (by status, date, customer).
- [x] Bulk operations for multiple orders.

#### 3.4 Pricing Matrix Management

- [x] Add brand functionality with logo upload to Cloudinary.
- [x] Add model functionality with comprehensive form:
  - Brand selection
  - Model name input
  - Image upload
  - Service pricing configuration (Original vs Aftermarket)
- [x] Edit existing models with pricing updates.
- [x] Duplicate prevention for brands and models.
- [x] Form validation with user-friendly error messages.

#### 3.5 Technician Management

- [x] Technicians list with performance metrics:
  - Total jobs completed
  - Average completion time
  - Success rate percentage
  - Current status (active, on_leave, inactive)
- [x] Technician detail page with comprehensive profile:
  - Personal information and verification status
  - Performance metrics and earnings
  - Current job assignment
  - Job history with success/failure tracking
- [x] Technician invitation system:
  - Create new invitations with token-based links
  - Track invitation status (active, used, expired)
  - Revoke invitations
  - Copy invitation links for sharing

#### 3.6 Customer Management

- [ ] Customer list page with search and filtering.
- [ ] Customer detail page with:
  - Personal information
  - Complete order history
  - Contact preferences
  - Support tickets
- [ ] Customer analytics and insights.

#### 3.7 Analytics & Reporting

- [ ] Revenue trends over time with charts.
- [ ] Most popular services and phone models.
- [ ] Technician performance reports.
- [ ] Customer satisfaction metrics.
- [ ] Export functionality for reports.

#### 3.8 Settings & Configuration

- [ ] System configuration management.
- [ ] User management for admin accounts.
- [ ] Notification preferences.
- [ ] Business hours and service area settings.

### 4. UI/UX Flow

#### 4.1 Navigation Structure

- **Dashboard**: Main overview with KPIs and recent activity
- **Orders**: List view with filtering and detail pages
- **Pricing Matrix**: Brand and model management
- **Technicians**: Team management and performance tracking
- **Customers**: Customer profiles and order history
- **Analytics**: Reports and business insights
- **Settings**: System configuration

#### 4.2 Key User Flows

1. **Order Assignment Flow**: Orders list → Order detail → Assign technician → Generate OTP
2. **Pricing Update Flow**: Pricing matrix → Add/Edit model → Configure services → Save
3. **Technician Onboarding**: Technician invitations → Create invite → Share link → Monitor completion
4. **Analytics Review**: Analytics page → Select date range → View reports → Export data

### 5. Technical Considerations

#### 5.1 Backend API Endpoints

- **Dashboard**: `/api/admin/dashboard` - KPI and recent orders
- **Orders**: `/api/admin/orders` and `/api/admin/orders/:id`
- **Technicians**: `/api/admin/technicians` for assignment
- **Technician Invites**: Full CRUD operations
- **Brand Management**: Add brands with logo upload
- **Model Management**: Add/edit models with pricing
- **Order Assignment**: Assign orders to technicians with OTP generation

#### 5.2 Database Schema

- **Orders table**: Links to users, technicians, and addresses
- **Technicians table**: User profiles with role-based access
- **Technician Invites table**: Token-based invitation system
- **Brands and Models tables**: Pricing matrix management

#### 5.3 Security Requirements

- Role-based access control (RBAC)
- Session management with secure tokens
- Input validation and sanitization
- File upload security for images
- API rate limiting and protection

#### 5.4 Performance Requirements

- Dashboard loads within 2 seconds
- Real-time data updates every 5 minutes
- Mobile-responsive design
- Optimized image loading and caching
- Efficient database queries with proper indexing

### 6. Development Status

#### 6.1 Completed Features

- ✅ Authentication and access control
- ✅ Dashboard overview with KPIs
- ✅ Order management (list, detail, assignment)
- ✅ Pricing matrix management (brands and models)
- ✅ Technician management (list, detail, invitations)
- ✅ Backend API endpoints for all core functionality

#### 6.2 In Progress

- 🔄 Customer management interface
- 🔄 Analytics and reporting dashboard
- 🔄 Settings and configuration pages

#### 6.3 Planned Features

- 📋 Advanced filtering and search
- 📋 Bulk operations for orders
- 📋 Export functionality
- 📋 Real-time notifications
- 📋 Advanced analytics with charts
- 📋 Mobile app for admin operations

# PixelPanic Admin Dashboard: Feature Roadmap

_Version 1.0 - July 26, 2025_

This document outlines the phased development plan for the PixelPanic Admin Dashboard. The goal is to evolve the dashboard from a simple data-entry tool into a comprehensive operational hub that provides full control and visibility over our business processes.

## Core Pillars

The dashboard's features will be structured around three core business functions:

1.  **Operations**: Real-time management of day-to-day activities like repair orders.
2.  **Management**: Tools for CRUD (Create, Read, Update, Delete) operations on our core data like pricing, technicians, and customers.
3.  **Analytics**: Dashboards and reports to turn our data into actionable business insights.

---

## Feature Roadmap

### Phase 1: Core Operations (Must-Haves)

These are the essential features needed to run the business.

- **Dashboard Overview**: The main landing page showing at-a-glance metrics:
  - Jobs for Today
  - Pending & In-Progress Orders
  - Total Revenue (This Month)
  - Recent Activity Feed
- **Order Management**: An interactive table to view, filter, and manage all repair orders. This will include a detail page for each order to update its status and assign a technician.
- **Pricing Matrix Management**: A dedicated section with a tabbed interface for full CRUD functionality for:
  - **Models & Prices**
  - **Brands**
  - **Services (Issues)**

### Phase 2: Growth & Efficiency (Should-Haves)

Features to help us scale efficiently once the core operations are stable.

- **Technician Management**: A section to manage our team, view their assignments, and track performance.
- **Customer Management**: A simple CRM to view customer profiles and their complete order history.

### Phase 3: Analytics & Insights (Future)

This phase focuses on leveraging data for business intelligence.

- **Reporting**: A dedicated analytics page with charts and reports on:
  - Revenue trends over time.
  - Most popular services and phone models.
  - Technician performance and average repair times.

---

## Proposed Sidebar Structure

This structure provides a scalable navigation path for all planned features.

| Feature            | Proposed Route | Icon Component            |
| :----------------- | :------------- | :------------------------ |
| **Dashboard**      | `/dashboard`   | `<IconLayoutDashboard />` |
| **Orders**         | `/orders`      | `<IconShoppingCart />`    |
| **Pricing Matrix** | `/pricing`     | `<IconDatabase />`        |
| **Technicians**    | `/technicians` | `<IconUsers />`           |
| **Customers**      | `/customers`   | `<IconUserCircle />`      |
| **Analytics**      | `/analytics`   | `<IconChartBar />`        |
| **Settings**       | `/settings`    | `<IconSettings />`        |
| **Logout**         | `#`            | `<IconLogout />`          |

---

## Anticipated Schema Changes

Implementing these features will require additions to our database schema.

- **New `orders` Table**:
  - `id` (Primary Key)
  - `customerId` (Foreign Key to users/customers)
  - `technicianId` (Foreign Key to technicians, nullable)
  - `status` (Enum: 'Pending', 'Assigned', 'In-Progress', 'Completed', 'Cancelled')
  - `totalAmount` (Numeric)
  - `scheduledAt` (Timestamp)
  - `createdAt`, `updatedAt`
- **New `technicians` Table**:
  - `id` (Primary Key)
  - `userId` (Foreign Key to a general users table)
  - `name`, `phone`, `currentLocation`, etc.
- **New `customers` Table** (or a generic `users` table with roles):
  - `id` (Primary Key)
  - `name`, `email`, `phone`, `addresses`, etc.

## Next Steps

Our immediate focus will be on building out the **Phase 1** features, starting with the main **Dashboard Overview** page.

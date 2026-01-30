# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PixelPanic is a device repair service platform built as a monorepo using Turborepo. The application serves three main user groups:
- **Customers**: Browse repair services, get quotes, and place orders
- **Admins**: Manage technicians, orders, pricing, and business operations
- **Technicians**: View and manage assigned repair jobs

## Architecture

This is a Turborepo monorepo with the following structure:

### Applications
- `apps/pixel-panic-web`: Next.js 15 web application (main customer and admin interface)
- `apps/pixel-panic-worker`: Cloudflare Worker API backend using Hono

### Shared Packages
- `packages/db`: Database schema and migrations using Drizzle ORM with Neon PostgreSQL
- `packages/ui`: Shared React component library with Radix UI primitives
- `packages/validators`: Zod validation schemas
- `packages/eslint-config`: Shared ESLint configurations
- `packages/typescript-config`: Shared TypeScript configurations

### Key Technologies
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Cloudflare Workers, Hono, Drizzle ORM
- **Database**: Neon PostgreSQL
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: GSAP, Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Authentication**: NextAuth.js 5.0 beta with Drizzle adapter

## Development Commands

### Root Level Commands (run from project root)
```bash
# Install dependencies
pnpm install

# Start all applications in development mode
pnpm dev
# or
turbo run dev

# Build all applications
pnpm build
# or
turbo run build

# Run linting across all packages
pnpm lint
# or
turbo run lint

# Type checking across all packages
pnpm check-types
# or
turbo run check-types

# Format code
pnpm format
```

### Application-Specific Commands

#### Web App (apps/pixel-panic-web)
```bash
# Start development server with Turbopack
pnpm --filter pixel-panic-web dev

# Build for production
pnpm --filter pixel-panic-web build

# Start production server
pnpm --filter pixel-panic-web start

# Run linting
pnpm --filter pixel-panic-web lint

# Database operations
pnpm --filter pixel-panic-web db:generate  # Generate Drizzle migrations
pnpm --filter pixel-panic-web db:migrate   # Run database migrations

# Cloudflare deployment
pnpm --filter pixel-panic-web deploy      # Deploy to Cloudflare
pnpm --filter pixel-panic-web preview     # Preview deployment
pnpm --filter pixel-panic-web cf-typegen  # Generate Cloudflare types
```

#### Worker API (apps/pixel-panic-worker)
```bash
# Start development server
pnpm --filter pixel-panic-worker dev

# Deploy to Cloudflare Workers
pnpm --filter pixel-panic-worker deploy

# Generate Cloudflare types
pnpm --filter pixel-panic-worker cf-typegen
```

## Application Structure

### Route Organization
The web app uses Next.js App Router with route groups:

- `(marketing)`: Public customer-facing pages
  - Landing page, repair services, about us, contact
  - Cart, checkout, and order tracking
  - Brand/model selection flows
- `(admin)`: Admin dashboard pages
  - Dashboard, orders, technicians, pricing
  - Coupons, contact messages, analytics
- `(technician)`: Technician portal pages
  - Job dashboard, gig details, invitations

### Component Architecture
- `components/features/`: Feature-specific components (e.g., landing page components)
- `components/shared/`: Reusable UI components (Header, Footer, etc.)
- `components/ui/`: Base UI components from shadcn/ui

### Database Schema
Uses Drizzle ORM with PostgreSQL. Key entities include:
- Users (customers, admins, technicians)
- Orders and order items
- Device brands and models
- Pricing and service options
- Coupons and discounts
- Technician invitations

## Development Notes

### Authentication Flow
- Uses NextAuth.js 5.0 beta with Drizzle adapter
- Supports multiple user roles (customer, admin, technician)
- Session management through JWT tokens

### State Management
- Zustand for client-side state management
- React Hook Form for form state with Zod validation
- Server components for data fetching where possible

### Styling Approach
- Tailwind CSS v4 with PostCSS
- shadcn/ui component library built on Radix UI
- Custom animations using GSAP and Framer Motion
- Responsive design with mobile-first approach

### Database Development
- Use `pnpm --filter pixel-panic-web db:generate` to create migrations after schema changes
- Use `pnpm --filter pixel-panic-web db:migrate` to apply migrations to database
- Schema defined in `packages/db/` with Drizzle ORM

### Deployment
- Web app deployed to Cloudflare Pages using OpenNext
- Worker API deployed to Cloudflare Workers
- Uses workspace protocol (`workspace:*`) for internal package dependencies

### Package Manager
Uses pnpm workspaces for monorepo management with Turborepo for task orchestration.
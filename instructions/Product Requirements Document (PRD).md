# Product Requirements Document (PRD)

_Mobile Repair-as-a-Service Platform for Mumbai_

Before building code, design, or marketing assets, every stakeholder needs a single source of truth that answers three questions: **what are we building, for whom, and why does it matter?**
This PRD captures that clarity. It will evolve through the project life-cycle, but today it provides the agreed “North Star” for engineering, design, growth, and operations.

## 1. Executive Summary

Mumbai’s smartphone penetration now tops 70 percent and 90 percent of tech-savvy consumers prefer digital payments for services[^1][^2]. Yet when their phone breaks, most users still queue at crowded bazaars or mail devices to OEM centres, losing time, data, and trust. Our web and PWA-first platform, **PixelPanic**, offers instant price discovery, orange-themed animated UX, and doorstep or in-store repairs across all major brands. The MVP will target mid-to-high ASP devices (₹15k-₹120k), where users value certified parts, 6-month warranty, and same-day service. We aim to capture 3 percent of Mumbai’s organised repair market within 18 months and reach EBITDA break-even at 2 000 monthly jobs with 97% of traffic expected from mobile devices, the product is engineered as a touch-first PWA.

## 2. Problem Statement

1. **Fragmented supply** – 60 000+ informal kiosks, inconsistent quality, no warranties[^3][^4].
2. **Trust \& transparency gap** – Users can’t verify spare-part authenticity or data safety[^5][^6].
3. **Poor digital UX** – Existing competitors’ funnels are static, text-heavy, and lack engaging motion design (see Cashify/Ongofix PDFs).
4. **Time cost** – Tier-1 professionals lose ~2 work-hours per repair trip (primary interviews, n = 22).

## 3. Goals \& Success Metrics

| Theme      | Metric                         | Target @ 6 months                  | Target @ 12 months |
| :--------- | :----------------------------- | :--------------------------------- | :----------------- |
| Conversion | Visitor→ checkout              | ≥ 4.5%                             | ≥ 6%               |
| Speed      | Avg. repair TAT                | ≤ 120 min doorstep, ≤ 8 h carry-in | ≤ 90 min doorstep  |
| NPS        | Post-repair NPS                | ≥ 70                               | ≥ 75               |
| Quality    | Repeat failure rate            | < 2% within 90 days                | < 1%               |
| Revenue    | Monthly completed jobs         | 800                                | 2 500              |
| Revenue    | add a Mobile Conversion metric | ≥ 6%                               | ≥ 12%              |

## 4. User Personas (Mumbai)

| Persona                            | Age   | Device \& Spend                                              | Pain Point                                | Key Driver                     |
| :--------------------------------- | :---- | :----------------------------------------------------------- | :---------------------------------------- | :----------------------------- |
| **Hustle-Pro** (iPhone heavy)      | 25-34 | iPhone 13-15; willing to pay ₹9-15 k for screen[^7][image:1] | Can’t be phoneless for work               | Fastest doorstep, data privacy |
| **Campus-Creator** (Tecno/Android) | 18-24 | ₹12-20 k phones; budget ≤ ₹3 k repair[^8]                    | Cash-strapped, but social-media dependent | Visible price, UPI discounts   |
| **Exec-Switcher**                  | 35-44 | Corporate Samsung/Pixel; company reimburses                  | Compliance \& GST invoice                 | Certified parts, B2B portal    |
| **Budget-Family**                  | 25-40 | Redmi/Realme shared devices                                  | Single phone in household                 | Financing, pick-up \& drop     |

## 5. Value Proposition

1. **See, Click, Fix** – animated 3-step funnel (device→ model→ issue) with real-time SKU pricing.
2. **Certified Parts + 6-Month Warranty** – parity with OEM, beats street shops.
3. **Doorstep in 60 minutes** – GPS-optimised technician routing.
4. **Orange Motion-First Brand** – energetic yet trustworthy colour shown to increase CTA visibility and urgency[^9][^10][^11].
5. **Cashless \& Paperless** – UPI, BNPL; e-invoices for warranties.

## 6. Scope (MVP Release R 1.0)

### 6.1 User Flows

1. **Landing → Device Select → Model → Issue/Pricing → Cart → Checkout → Slot Booking → Confirmation.**
2. **Technician App** – accept job, parts checklist, OTP close-out, photo proof.
3. **Admin Console** – price matrix CRUD, SLA dashboard, warranty claims.

### 6.2 Key Features

| Priority | Feature                | Notes                                   |
| :------- | :--------------------- | :-------------------------------------- |
| P0       | Dynamic pricing engine | Drizzle ORM; models \& parts in Neon DB |
| P0       | Slot \& routing        | Mapbox API; 4-slot daypart              |
| P0       | Payment gateway        | Razorpay UPI/cards                      |
| P0       | Order tracking + push  | FCM \& WhatsApp                         |
| P1       | Loyalty wallet         | Earn 2% credit per repair               |
| P1       | AI part-forecast       | Reduce van inventory 20%                |
| P1       | Referral code          | Deep-link shares                        |

## 7. Tech Stack

| Frontend                                                                                              | Backend                                                                                | Infra \& DevOps                                                                  |
| :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| Next.js 15 + TypeScript, ShadCN UI, Framer Motion (for Rohogaka-style page-load \& scroll animations) | Cloudflare Workers + Hono (edge routing), Zod validation, Drizzle ORM on Neon Postgres | Vercel hosting, Cloudflare R2 for images, GitHub Actions CI/CD, Sentry, Logflare |

CDN-edge architecture keeps TTFB < 100 ms across Mumbai ISP nodes.

## 8. Design \& Branding Guidelines (summary; full **Branding.md** to follow)

Palette: **Primary Orange \#FF6B27**, Accent Navy \#16202C, Neutral Greys.
Typography: Inter for body, Urbanist Bold for headers.
Motion Principles: 200-400 ms spring ease; hero device explodes into isometric parts on scroll (inspired by ControlZ).
Accessibility: WCAG 2.2 AA contrast; prefers-reduced-motion fallback disables heavy animations.

## 9. Non-Functional Requirements

- **Security** – ISO 27001 aligned, device data never accessed; technicians background-checked.
- **Scalability** – stateless workers; horizontal scaling via Cloudflare load balancing.
- **Compliance** – GST e-invoice, e-waste partner tie-up; adheres to India DPDP Act.
- **Reliability** – 99.9% API uptime; offline-first technician app (Workbox).

## 10. Risks \& Mitigations

| Risk                      | Impact          | Mitigation                                    |
| :------------------------ | :-------------- | :-------------------------------------------- |
| Parts supply shortage     | TAT breach      | Dual vendors, weekly demand forecast          |
| Animation bloat slows FCP | Higher bounce   | Lazy-load Lottie JSON, prefers-reduced-motion |
| Price war vs incumbents   | Margin squeeze  | Bundle warranties, tiered service levels      |
| Technician churn          | Service quality | ESOP pool + performance bonus                 |

## 11. Milestones \& Timeline

| Month | Milestone                                |
| :---- | :--------------------------------------- |
| M0    | PRD sign-off, repo setup                 |
| M1    | UI kit, landing with scroll animations   |
| M2    | Pricing DB + checkout, technician PWA    |
| M3    | Closed beta (friends \& family 100 jobs) |
| M4    | Public launch + paid ads                 |
| M6    | Android/iOS wrapper, B2B portal          |

## 12. Open Questions / Parking Lot

1. Should we support “board-level” repairs in-house or outsource initially?
2. Financing partner for BNPL – Simpl vs Zest?
3. Evaluate 24×7 support viability based on NPS feedback post-launch.

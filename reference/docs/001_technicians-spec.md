# Technician Platform — Specification

**Status:** In Progress
**Author:** Abdulraheem
**Last Updated:** 2025-08-08

---

### 1. Overview

Technician Platform enables PixelPanic technicians to manage assigned repair gigs from mobile devices. It focuses on a clear daily queue, streamlined gig details, location navigation, job status transitions (Confirmed → In Progress → Completed), OTP-based completion verification, photo evidence, job notes, and WhatsApp notifications. Earnings are intentionally excluded (payroll-based). The experience is mobile-first, fast, and role-gated.

### 2. User Stories

- As a Technician, I want to authenticate on mobile so that I can access my assigned gigs securely.
- As a Technician, I want to see today’s assigned gigs in a clear list so that I can plan my day.
- As a Technician, I want to open a gig and view address, contact, device, issue, and parts so that I arrive prepared.
- As a Technician, I want a Navigate button so that I can open Maps with the destination prefilled.
- As a Technician, I want to change status to In Progress on arrival so that ops know I started.
- As a Technician, I want to capture customer OTP to complete a gig so that completion is verified.
- As a Technician, I want to upload photos and add notes so that job evidence is recorded.
- As a Technician, I want to receive WhatsApp notifications for new/updated assignments so that I am alerted quickly.
- As a Technician, I want to view my historical gigs so that I can reference past work.
- As a Technician (first-time), I want a guided onboarding on mobile so that I can set up my account and start quickly.

### 3. Requirements & Acceptance Criteria

- [x] Role-gated access: Only `technician` role can access the Technician app area.
- [ ] Mobile-first layout for all screens (min 360px wide), responsive up to desktop.
- [ ] Daily queue view lists today’s assigned gigs (sorted by customer-selected time slot).
- [ ] Each gig card shows: order id, time window, customer name, short address, device + issue, status badge.
- [ ] Gig detail screen shows: full address, phone, device, issue, required parts checklist (read-only for MVP), status timeline.
- [ ] Navigate button opens default map app with destination prefilled.
- [ ] Status transitions: Confirmed → In Progress → Completed; only forward transitions allowed.
- [x] Completion requires valid OTP input to succeed; incorrect OTP is rejected with clear error.
- [x] Photo upload: attach 1–5 images per gig; show thumbnails; allow delete before submission.
- [x] Notes: free-text field (sanitized) saved with the gig.
- [ ] Historical list: past gigs with basic search/filter by date range and status.
- [ ] WhatsApp notification sent on new assignment and status updates (tech-facing alerts only in MVP).
- [ ] Strict 9–5 schedule; no availability UI exposed to technicians.
- [ ] No earnings or payout UI.
- [x] Error states: network failures, invalid OTP, upload failures show actionable messages and retry options.
- [ ] Accessibility: sufficient color contrast, large touch targets, semantic HTML, focus management for dialogs.
- [ ] Performance: LCP < 2.5s on mid-tier devices over 4G for the queue screen.

### 4. UI/UX Flow (Mobile-first)

Screens:

- Login / OTP Verify (tech)
- Onboarding (first login): accept terms, verify phone, set display name (if applicable)
- Today’s Gigs (queue) list
- Gig Detail
  - Navigate (deep links to Maps)
  - Status controls (In Progress, Complete with OTP)
  - Photos uploader
  - Notes
- History

Flow highlights:

1. Login → (if first-time) Onboarding → Today’s Gigs
2. Select gig → Detail → Navigate → Start (In Progress)
3. Perform repair → Add photos + notes → Complete → Enter OTP → Success
4. History available from menu for past gigs

### 5. Technical Considerations

- Authentication & Roles
  - Extend existing OTP auth to technicians; enforce `technician` role checks server-side and at the route level.
  - Sessions limited to Technician scope for app routes under `(technician)`.

- Data Model (DB; indicative)
  - Technician entity (if not already modeled), or role assignment to user.
  - Order fields: `technician_id`, `status`, `scheduled_slot`, `otp_code` (one-time, expiring), `notes`, `photos[]` (object storage URLs), timestamps.

- APIs (Dedicated worker routes)
  - DONE: GET /technicians/me/gigs?day=today
  - DONE: GET /technicians/gigs/:id
  - DONE: POST /technicians/gigs/:id/status { to: "in_progress" }
  - DONE: POST /technicians/gigs/:id/complete { otp, photos[], notes }
  - TODO: POST /technicians/gigs/:id/photos
  - TODO: POST /technicians/gigs/:id/notes

- Notifications
  - WhatsApp alerts for assignment/updates via provider (e.g., WhatsApp Cloud API). Abstract provider to switch later if needed.

- Security
  - Server-side authorization: technician can only access own assigned gigs.
  - OTP completion rate-limited; OTPs short-lived and single-use.
  - Sanitize notes; validate images; virus scan if available; store in bucket with signed URLs.

### 6. Onboarding & Admin Controls (MVP)

- Invitation-based Onboarding (current)
  - DONE: GET /admin/technician-invites
  - DONE: POST /admin/technician-invites
  - DONE: POST /admin/technician-invites/:id/revoke
  - DONE: GET /technicians/invites/:token
  - DONE: POST /technicians/invites/:token/complete
- DONE: Admin UI page and Technician invite page

- Performance
  - Use server-rendered lists; stream details; lazy-load images; keep client JS minimal.

- Accessibility
  - Large touch targets (≥ 44px), labels for inputs, error text announced to screen readers.

- Out of Scope (MVP)
  - Earnings/payouts UI, geofencing, technician-driven availability UI, parts/inventory acknowledgments.

# UX Wireframes \& Hi-Fi Comps Blueprint

_A step-by-step plan that turns the PRD funnel into concrete screens, navigation, and annotated wireframes you can hand to design \& engineering tomorrow._

## 1. Scope of the Deliverable

Primary focus: mobile wireframes (portrait ≤ 390 px) with desktop adaptations secondary
We will produce a complete set of mid-fidelity wireframes (grey-box, annotated) for:

1. Marketing pages
   - Landing (hero + trust badges + USP strip)
   - Dynamic brand selector section
   - “Why PixelPanic” proof module
2. Core 3-step booking wizard
   - Brand → Model → Issue/Pricing
3. Cart \& checkout
   - Cart review
   - Customer info + address auto-complete
   - Service-mode choice (doorstep vs. carry-in)
   - Payment (Razorpay sheet)
4. Post-checkout
   - Confirmation \& live tracking
   - Feedback/NPS micro-flow
5. System pages
   - 404 / error, policy stubs, FAQ index

(The technician PWA and admin console will be wireframed in a later sprint.)

## 2. End-to-End Flow Map

Below is the reference flow every screen must support.

The diagram illustrates the linear funnel (left → right) and optional loops for edits or retries. Key entry and exit points are annotated; dashed arrows indicate secondary actions such as returning to cart from checkout.

![PixelPanic booking flow at a glance](https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/870384dd-c90c-4bb6-aa68-80c34ef5bfc7.png)

PixelPanic booking flow at a glance

## 3. Page-by-Page Wireframe Checklist

### 3.1 Landing / Hero

- Fold-1: Orange gradient hero, animated 3-D phone explode (GSAP + Three.js).
- Primary CTA: “Start My Repair” (auto scrolls to brand grid).
- Secondary CTAs: WhatsApp quick chat, call-now sticky.
- Social proof strip (⭐4.7/5, “27 lakh customers”).
- SEO text block below the fold (≈200 words).

### 3.2 Brand Select

- Grid of 12 brands (logo chips, 44 px).
- Search bar for long-tail brands (type-ahead).
- Sticky “Back to landing” crumb.
- Analytics: fire `brand_select` event.

### 3.3 Model Select

- Header shows chosen brand + back arrow.
- Search \& filters (year, series).
- Lazy-load list (virtualised).
- If model not found → link to manual quote form.

### 3.4 Issue \& Price Select

- Two-column card list: issue description left, price right.
- Tapping reveals part-grade toggle (OEM vs Aftermarket).
- GSAP Flip animates chosen issue into mini-cart bar.
- “Add another issue” keeps wizard open.
- CTA “Review Cart” enabled when ≥1 issue.

### 3.5 Cart Review

- Line items editable (qty, part grade).
- Promo code input; price breakdown.
- Estimated service time badge (pulled from SLA table).
- CTA “Checkout Securely”.

### 3.6 Checkout – Customer Info

- Stepper progress bar (Info → Service → Pay).
- Name, mobile, email, address (Google Places auto-complete).
- Toggle save address.
- Continue button disabled until validation passes.

### 3.7 Service-Mode

- Side-by-side cards: Doorstep vs Carry-in.
- Doorstep opens time-slot picker (4 daily slots).
- Carry-in shows nearest hub map (CF Workers geolookup).
- Optional add-on: Express 60-min, ₹199.

### 3.8 Payment

- Razorpay modal: UPI default, cards, BNPL.
- Loading skeleton \& retry logic.
- Post-pay webhook → success screen.

### 3.9 Confirmation \& Tracking

- Order summary with OTP for technician.
- Live map (Mapbox) once technician assigned.
- Share link via WhatsApp.

### 3.10 Post-Repair Feedback

- Triggered after status=Completed.
- 5-star NPS + text box, skipable.
- If NPS ≤ 6 → route to support chat.

## 4. Interaction Conventions

- Primary colour: Orange \#FF6B27 buttons (48 px height).
- 8 pt spacing grid; tokens exported to Tailwind (`--space-8`).
- Wizard stepper is always visible on mobile (sticky top).
- Animation budget: entry ≤ 200 ms, ScrollTrigger scrub under 1 ms/frame.
- `prefers-reduced-motion` disables parallax and 3-D.

## 5. Navigation Model

- Bottom nav (mobile PWA): Home, Track, FAQ, Account.
- Deep links: `/repair/:brand/:model` shareable.
- Breadcrumbs on desktop only.
- Interstitial save-to-home-screen prompt after second visit.

## 6. Wireframing Tools \& Handoff

1. Figma project `PixelPanic-UX-Sprint01`
   – Component library draws from ShadCN base with PixelPanic tokens.
2. Pages: `00-Flow`, `01-Landing`, `02-Wizard`, `03-Checkout`, `04-Misc`.
3. Annotations layer (`#999 arrows + numbered dots`).
4. Dev mode enabled; Tailwind classes in description.
5. Zeplin not required; Storybook adoption planned after hi-fi.

## 7. Timeline

| Week | Deliverable                             | Owner    | Review               |
| :--- | :-------------------------------------- | :------- | :------------------- |
| W0   | Flow map + checklist (this doc)         | UX       | Stakeholder sign-off |
| W1   | Low-fi wireframes all pages             | UX       | PM + Eng             |
| W2   | Mid-fi grey-box + annotations           | UX       | Eng feasibility      |
| W3   | Hi-fi visual comps (Branding.md styles) | UI       | C-level demo         |
| W4   | Prototype link, usability tests (n=6)   | Research | Iterate              |

This blueprint aligns every screen to the PRD funnel, applies the Branding.md colour/motion rules, and primes engineering for component build-out in Next.js + ShadCN UI.

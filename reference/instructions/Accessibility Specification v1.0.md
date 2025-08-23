# Accessibility Specification v1.0

Ensuring every PixelPanid experience is usable, understandable, and pleasing for all users—including those with disabilities—is both a moral imperative and a legal requirement. This document defines the principles, guidelines, and acceptance criteria that will underpin our WCAG 2.2 AA–level commitment. It guides designers, engineers, and QA through semantic markup, keyboard interactions, color contrast, animation preferences, component-level requirements, and automated/manual testing protocols.

## 1. Accessibility Goals \& Principles

PixelPanid’s accessibility objectives align with the Web Content Accessibility Guidelines (WCAG) 2.2. We aim to create an inclusive end-to-end journey from the landing page through checkout and order tracking. Our first principle is **perceptibility**—all information must be available to the user’s senses. Second is **operability**—interactive elements must be reachable by keyboard or assistive technologies. Third is **understandability**—language, instructions, and feedback must be clear and consistent. Finally, **robustness** ensures support across modern and legacy user agents, as well as assistive technologies. Every design token, component, and animation must be audited against these principles before merging to main.

## 2. WCAG 2.2 Conformance

We commit to achieving Level AA for all public-facing flows. This includes but is not limited to compliance with the following key success criteria: text and image contrast, keyboard access, focus visibility, ARIA labeling, predictable navigation, and sufficient time provisions.
A summary of pertinent criteria appears below.

| Criterion                    | Level | Applicability                           |
| :--------------------------- | :---- | :-------------------------------------- |
| 1.4.3 Contrast (Minimum)     | AA    | All text and non-text elements          |
| 2.1.1 Keyboard               | A     | All interactive components              |
| 2.4.7 Focus Visible          | AA    | All focusable elements                  |
| 3.1.1 Language of Page       | A     | Every document                          |
| 3.3.2 Labels or Instructions | A     | Forms and controls                      |
| 2.2.2 Pause, Stop, Hide      | AA    | All moving, blinking, scrolling content |

Ongoing audits will verify these criteria with tools such as axe-core and manual walkthroughs.

## 3. Semantic HTML \& ARIA Roles

Every page begins with proper document structure: an HTML `<header>` containing navigation landmarks, a `<main>` wrapper, and a `<footer>`. Heading levels must follow a hierarchical sequence, never skipping levels. Interactive regions such as carousels, modals, and accordions must carry ARIA roles (`role="region"`, `aria-labelledby`) and properties (`aria-live`, `aria-expanded`) to inform screen readers. Landmark elements enable quick navigation in NVDA and VoiceOver. Buttons must use `<button>` tags rather than clickable `<div>`s, and links must use `<a href>`. Custom widgets must expose appropriate `tabindex`, `aria-label`, and keyboard event handling to ensure parity with native controls.

## 4. Keyboard Navigation \& Focus Management

All user interfaces must be operable through keyboard alone. The tab order should follow a logical document flow. When a modal dialog (for payment or quick-help chat) opens, focus must shift to the dialog header and remain trapped until the dialog closes, at which point focus returns to the triggering element. Custom components such as the 3-step wizard cards must expose `tabindex="0"` and respond to `Enter` or `Space` to activate. Focus outlines must meet contrast requirements and cannot be removed. A minimalist focus style uses a 2px solid ring of “PixelPanid Orange” around the active element. For keyboard-only users, a “skip to content” link must be the first focusable element, moving to the main content area.

## 5. Visual Contrast \& Color

Using our tokenized palette, all text and interactive elements must satisfy minimum contrast ratios. Primary body copy and UI controls must achieve a contrast ratio of at least 4.5:1. Large text (24px and above) may use a ratio of 3:1. The table below illustrates key token contrasts on Foam White (`#FDFCFB`).

| Token              | Hex      | Contrast Ratio vs. \#FDFCFB | WCAG Level |
| :----------------- | :------- | :-------------------------- | :--------- |
| Primary Orange 500 | \#FF6B27 | 3.6:1                       | Large Text |
| Deep Navy 900      | \#16202C | 14.6:1                      | AAA        |
| Slate-20           | \#ADB5BD | 5.4:1                       | AA         |
| Lime Spark         | \#D3F36B | 2.8:1                       | —          |

Where contrast falls below AA, supplementary visual cues (icons, underlines) and accessible text descriptions must compensate. Designers must verify dynamic states (hover, disabled) for contrast compliance.

## 6. Motion \& Animation Preferences

Animations enrich the PixelPanid experience but can disorient users with vestibular disorders. We adopt a “motion-safe by default” policy: all decorative animations—parallax scrolling, 3-D model rotation, micro-interactions—must be disabled or simplified when `prefers-reduced-motion` is detected. Functional animations (focus transitions, error shakes) remain. GSAP timelines and Three.js loops must query `window.matchMedia('(prefers-reduced-motion)')` and bypass nonessential tweens. Duration budgets cap at 200ms for entry and 120ms for exit. Each decorative element also needs a static fallback, ensuring content remains perceivable.

## 7. Accessible Components Specification

### 7.1 Button Components

Primary and secondary buttons must include `aria-disabled="true"` when inactive, and expose `aria-live="polite"` for dynamic label changes (e.g., loading states). The accessible name derives from button text; icons-only buttons must carry `aria-label`. Buttons must emit `focus` and `blur` events programmatically for automated tests.

### 7.2 Form Controls

Input fields for address, coupon code, and OTP require `<label>` associations. Error messaging must appear in an `aria-live="assertive"` region. Helper text should be linked via `aria-describedby`. Form validation occurs on blur and on submit, providing clear instructions and error prevention.

### 7.3 Interactive Cards

Device and issue selection cards, while visually resembling static boxes, function as radio or checkbox groups. Each card must include `role="option"` within a parent `role="listbox"`, or use native radio inputs visually hidden. Selection states reflected in `aria-selected`. Flip animations rearrange cards; updates to DOM order must maintain focus and accessibility semantics.

### 7.4 Hero 3-D Model Interactions

The WebGL canvas displaying the phone model must include `role="img"` with a descriptive `aria-label` such as “3D model of iPhone rotating to showcase design”. Users unable to perceive motion receive a static fallback image via `<picture>` inside the same container. Interactive controls for rotation must be keyboard-accessible buttons and labeled accordingly.

## 8. Testing \& Acceptance Criteria

To validate compliance, we will integrate automated and manual testing. Automated checks include end-to-end axe-core audits via Playwright, verifying zero violations on critical pages. Manual testing will cover screen readers (NVDA, VoiceOver), keyboard-only navigation, and color contrast validation with tools like Contrast Checker. Acceptance criteria are defined per component: for instance, every focusable element must have a visible focus state, verified in at least two browsers. WCAG success criteria table rows must be greenlit with test results prior to feature sign-off.

| Test Category           | Method                  | Pass Criteria                                                         |
| :---------------------- | :---------------------- | :-------------------------------------------------------------------- |
| Keyboard Navigation     | Manual + Automated      | Full tab cycle without traps; focus visible                           |
| Screen Reader Semantics | Manual with NVDA/VO     | Correct reading order; ARIA roles announced                           |
| Contrast Ratios         | Automated + Manual tool | ≥ WCAG thresholds for all text and controls                           |
| Animation Handling      | Manual + CSS emulate    | Decorative animations disabled under preference                       |
| Form Validation         | Automated + manual      | Error messages accessible; form submission prevented on invalid input |

## 9. Documentation \& Monitoring

All accessibility guidelines and component notes will reside in the Storybook “Accessibility” section. Every new component must include a “How to Test” panel. Accessibility metrics such as automated violation counts, keyboard trap incidents, and focus order anomalies will surface in daily CI reports. Post-launch, we will monitor user feedback channels for accessibility complaints and iterate within our bi-weekly sprint cycle.

## 10. Next Steps

The accessibility specification now provides the blueprint for auditing existing wireframes and informing component implementation. In the upcoming sprint, designers will annotate Figma frames with accessibility notes, while engineers will enrich Storybook stories with knobs to simulate reduced-motion and high-contrast modes. Simultaneously, QA will draft detailed a11y test scripts. Once those artifacts are reviewed and signed off, the team can confidently proceed to feature development, assured that PixelPanid will be both beautiful and accessible to every Mumbaikar.

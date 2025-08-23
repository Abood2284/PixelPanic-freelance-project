# Branding.md

_A Unified Reference for PixelPanic’s Visual \& Verbal Identity_

Before code or copy is written, every contributor needs one source of truth on **how PixelPanic should look, move and sound**. This document codifies those rules so designers, marketers, and engineers can create consistent, memorable experiences that set us apart from competitors Cashify and Ongofix.

## 1. Brand Essence

### 1.1 Core Promise

“See → Click → Fix” – instant clarity, energetic service, zero jargon, Designed mobile-first for the 97% of users who book repairs on their phones.

### 1.2 Personality

| Trait         | Description                                            | Practical Expression                         |
| :------------ | :----------------------------------------------------- | :------------------------------------------- |
| Optimistic    | Orange signals warmth and confidence[^1][^2]           | Up-beat microcopy, lively gradients          |
| Trustworthy   | Navy grounds the palette, implying reliability[^3][^4] | Clean layouts, factual tone, warranty badges |
| Tech-savvy    | Modern type, motion cues, edge hosting                 | Framer Motion interactions, geometric icons  |
| Human-centric | Mumbai-first, multilingual cues                        | Hinglish sub-headers, local imagery          |

### 1.3 Voice \& Tone

1. **Motivational, never pushy.** Calls-to-action use verbs + benefit (“Start repair in 30 s”).
2. **Conversational precision.** Follow chat-app syntax—short sentences, contractions where natural.
3. **Evidence-backed claims.** Cite warranty span, parts grade, NPS metrics (avoid vague superlatives).

## 2. Visual Identity

### 2.1 Color System

| Swatch                      | Hex      | Usage                                     | WCAG AA on White\* |
| :-------------------------- | :------- | :---------------------------------------- | :----------------- |
| PixelPanic Orange (Primary) | \#FF6B27 | CTA buttons, highlights, scroll indicator | 3.6:1              |
| Deep Navy                   | \#16202C | Header text, footers, icon outlines       | 14.5:1             |
| Foam White                  | \#FDFCFB | Backgrounds                               | —                  |
| Slate-20                    | \#ADB5BD | Secondary text, borders                   | 5.4:1              |
| Lime Spark                  | \#D3F36B | Success states, badge accents             | 2.8:1              |

\*Use text-shadow for orange on white to reach 4.5:1 minimum.

**Rationale**

- Orange grabs attention and raises CTA conversions by >32% when tested against blue/green[^5][^6].
- Complementary navy balances vibrancy and is proven to elevate trust cues[^3][^7].

### 2.2 Gradient Recipes

1. **Sunburst:** `linear-gradient(90deg,#FF7A1A 0%,#FFAA33 100%)` – hero backgrounds.
2. **Mango-Navy Overlay:** Orange 60% opacity over Deep Navy card hovers for depth.

### 2.3 Typography

| Role               | Typeface               | Source \& Weight |
| :----------------- | :--------------------- | :--------------- |
| Display / H1-H2    | **Urbanist Bold 900**  | Google Fonts[^8] |
| Body Copy          | **Inter Regular 400**  | Google Fonts[^9] |
| Micro-Label / Code | **JetBrains Mono 400** | JetBrains OSS    |

**Pairing Logic**
Urbanist’s geometric forms echo device silhouettes, while Inter maximizes digital legibility at 16 px base size[^10][^11]. JetBrains Mono reinforces tech credibility in snippets.

### 2.4 Logo Usage

- Clear-space = 2× orange square width.
- Light mode: Orange mark on Foam White; Dark mode: White mark on Deep Navy.
- Never add shadows, gradients, or rotate.

### 2.5 Iconography

- 24 × 24 px line icons, 2 px stroke, rounded joins.
- Line ends match PixelPanic Orange for active, Slate-20 for inactive.

### 3. Motion \& Interaction – **GSAP-First Strategy**

Our animation layer is powered by **GreenSock Animation Platform (GSAP v3+)** with the ScrollTrigger, ScrollSmoother and (optionally) Flip plugins.reiterate performance budgets are benchmarked on low-end Android.
Guiding principles:

| Principle             | Implementation Rule                                                                                                                                     | GSAP API                                        |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------- |
| **Narrative flow**    | Tell one story per scroll segment; never launch more than one independent timeline per viewport height.                                                 | `gsap.timeline({defaults:{ease:"power2.out"}})` |
| **Responsiveness**    | Use `matchMedia` to swap or simplify effects below ∆768 px.                                                                                             | `ScrollTrigger.matchMedia()`                    |
| **Performance first** | Animate only transforms/opacity; set `will-change: transform` on targets and enable GPU with `force3D:true`. Keep each frame < 1 ms on low-end mobiles. | see “Best Practices”                            |
| **Fail gracefully**   | If `prefers-reduced-motion` is true, skip decorative tweens and keep only functional transitions (e.g., step slides, focus rings).                      | CSS `@media` gate + `gsap.context()`            |
| **Accessibility**     | Keyboard focus must never be lost inside pinned sections; provide ARIA live regions when text is revealed by animation.                                 | custom callback in `onEnter` / `onLeave`        |

#### 3.1 ScrollTrigger Patterns We Use

1. **Hero Device Reveal**
   - Phone model slides in from -120% Y while rotating 45° → 0° on X axis.
   - Parallax depth: background gradient moves at 0.7 × scroll.
   - Code sketch:

```js
gsap
  .timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=100%",
      scrub: 1,
      pin: true,
    },
  })
  .fromTo(
    ".hero-model",
    { yPercent: -120, rotationX: 45 },
    { yPercent: 0, rotationX: 0, duration: 1.4 }
  )
  .to(".bg-gradient", { yPercent: 30 }, 0);
```

2. **3-Step Repair Funnel (Device → Model → Issue)**
   - Each card fades + lifts 8 px on hover (`gsap.to` in event handler).
   - When a step is completed, Flip plugin animates the selected card into the breadcrumb header for spatial continuity.
3. **Testimonials Carousel**
   - Auto-plays on timeline with `repeat:-1`, pauses on `onEnter`, resumes on `onLeaveBack`.

#### 3.2 3-D Phone Models in the Hero

| Layer         | Tooling                                                              | Spec                                                          |
| :------------ | :------------------------------------------------------------------- | :------------------------------------------------------------ |
| Loader        | **Three.js r160** (or React Three Fiber if React SPA)                | GLTFLoader + DRACOLoader; fallback to static PNG for ≤ iOS 12 |
| Source format | `.glb` with Draco mesh compression, KTX2 textures, max 3 MB each     | Compress via `gltf-transform draco`                           |
| Interaction   | Passive rotation tied to pointer X (desktop) or device-tilt (mobile) | Throttled `gsap.ticker`                                       |
| Lighting      | HDRI (sunset_studio) + single rim light; compute light maps offline  | Keep shaders to **PBR StandardMaterial**                      |
| Accessibility | Provide static alt image (`picture` tag) if WebGL fails              | Auto-detect with `renderer.capabilities.isWebGL2`             |

_Pseudo-code snippet (React Three Fiber):_

```jsx
<Canvas shadows dpr={[1, 2]}>
  <Suspense fallback={null}>
    <Model url="/models/iphone16.glb" />
  </Suspense>
  <Environment files="/hdr/sunset_studio_2k.hdr" background />
</Canvas>;

useGSAP(() => {
  gsap.to(camera.position, { z: 3.5, duration: 1.2, ease: "power3.out" });
});
```

#### 3.3 GSAP Best-Practice Checklist

1. **Cache selectors** outside loops.
2. Batch similar tweens into a **timeline** to reduce reflows.
3. For heavy scenes, integrate **requestAnimationFrame** only once (GSAP’s ticker).
4. **\***Never** animate layout properties** (e.g., `width`, `top`) during scroll.
5. Measure with Chrome DevTools: keep Main thread ≤ 4 ms under sustained scroll.

### 4. Performance Guardrails (updated)

| KPI                    | Target                                 | Test Method                 |
| :--------------------- | :------------------------------------- | :-------------------------- |
| First Contentful Paint | ≤ 1.8 s                                | Lighthouse → mobile         |
| Scroll jank            | ≤ 1 dropped frame per 10 s on Moto G-4 | `gsap.ticker.add(fpsMeter)` |
| GLB hero load          | < 1 MB zipped, decoded ≤ 600 ms        | `PerformanceObserver`       |
| CPU on idle hero loop  | ≤ 7% on M1 Air                         | Chrome profiler             |

### 5. File Tree Additions

```
/public/models
  iphone16_compressed.glb
  samsung_s24_compressed.glb
/src/animations
  hero.ts
  funnel.ts
  carousel.ts
```

### 3.1 Principles

| Principle              | Guidance                                                                                       | Library                               |
| :--------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------ |
| Micro-interactions     | Hover lift (4 px), tap compress (-8 px) enrich feedback and raise adoption[^12][^13]           | Framer Motion[^14]                    |
| Scroll storytelling    | Parallax device-explode animation (< 400 ms) keeps users engaged[^15][^16]                     | IntersectionObserver + Framer Motion  |
| Prefers-reduced-motion | Detect and disable decorative transitions; preserve transforms essential to comprehension[^17] | CSS `@media (prefers-reduced-motion)` |

### 3.2 Performance Guardrails

- Animation budget ≤ 200 ms on entry, 120 ms on exit (per Google UX).
- GPU-friendly transforms only (`translate`, `scale`, `opacity`).
- Lottie/SVG under 40 KB gzip.

## 4. Layout System

### 4.1 Grid

- 12-column, 72 px max content width on desktop; 4-column on mobile.
- 24 px gutter ensures breathing room for vibrant palette.

### 4.2 Components

1. **Device Selector Card** – 3:4 aspect, icon + label; hover: gradient border.
2. **CTA Button** – 48 px height, 16 px radius, orange fill → navy text; on focus: 2 px white inset ring.
3. **Price Tile** – Navy background, white 24 pt price, orange sub-label.

## 5. Imagery

| Asset Type       | Style Guide                                                                            |
| :--------------- | :------------------------------------------------------------------------------------- |
| Photography      | High-key, flat-lay shots of phones on concrete or plywood; subtle orange gel lighting. |
| Illustration     | Flat, isometric components exploding from phone (inspired by iFixit).                  |
| Customer Avatars | Real Mumbai users, daylight shots, orange accent clothing preferred.                   |

## 6. Accessibility \& Inclusion

1. Maintain 4.5:1 contrast for all text (except large display 3:1).
2. Provide Hindi and Marathi ALT text on device imagery.
3. Ensure keyboard navigability for funnel (WCAG 2.2).

## 7. Tone of Voice Library

| Scenario | Example                                                  |
| :------- | :------------------------------------------------------- |
| Button   | “Book my repair”                                         |
| Error    | “Whoops! That part’s sold out—notify me when restocked.” |
| Success  | “All set. Technician Rakesh arrives at 3 PM.”            |

Use active verbs, Mumbai colloquialisms sparingly (“chalo, let’s go!”) and avoid generics like “Submit”.

## 8. Do’s \& Don’ts

| Do                               | Don’t                                         |
| :------------------------------- | :-------------------------------------------- |
| Use Orange for every primary CTA | Use multiple oranges—stick to \#FF6B27        |
| Animate within 200 ms            | Trigger motion on page load for every element |
| Pair Urbanist with Inter         | Mix in unrelated serif fonts                  |

## 9. Governance \& File Structure

```
/brand
  /logo
    PixelPanic_mark.svg
  /color
    swatches.ase
  /typography
    urbanist.zip
    inter.zip
  /motion
    lottie_json/
  /templates
    hero_banner.fig
```

Version-control updates via Git; raise pull requests tagged **brand-update**.

## 10. References

Color psychology and CTA research[^1][^2][^6][^18][^5]; typography trends[^10][^8][^11]; micro-interaction best practice[^12][^13][^17]; modern animation patterns[^15][^19][^16]; gradient utilities[^20][^21].

### Versioning

_Branding.md_ v 1.1 – added GSAP motion system \& 3-D guidelines
Next review: Oct 2025.

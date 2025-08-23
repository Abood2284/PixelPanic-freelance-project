# PixelPanic Animation System Documentation

_Version 1.0 - January 2025_

This document provides a comprehensive guide to the animation system implemented in the PixelPanic project, covering GSAP ScrollSmoother, ScrollTrigger pinning, and the challenges we faced and solved.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Details](#implementation-details)
4. [Challenges & Solutions](#challenges--solutions)
5. [Best Practices](#best-practices)
6. [File Structure](#file-structure)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The PixelPanic animation system uses **GSAP (GreenSock Animation Platform)** with **ScrollSmoother** and **ScrollTrigger** to create smooth, scroll-driven animations. The system is designed to work seamlessly across all devices, including mobile browsers with dynamic viewport changes.

### Key Technologies

- **GSAP v3+** - Core animation library
- **ScrollSmoother** - Smooth scrolling wrapper
- **ScrollTrigger** - Scroll-based animation triggers
- **Next.js 14 App Router** - React framework
- **TypeScript** - Type safety

---

## Architecture

### 1. ScrollSmoother Wrapper Structure

The entire app is wrapped in a ScrollSmoother context to ensure consistent scroll behavior:

```jsx
// app/page.tsx
<main>
  <div id="smooth-wrapper">
    <div id="smooth-content">{/* All sections go here */}</div>
  </div>
</main>
```

### 2. Global GSAP Provider

A centralized provider manages ScrollSmoother initialization:

```tsx
// components/gsap/GSAPProvider.tsx
export default function GSAPProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useGSAP(() => {
    if (!ScrollSmoother.get()) {
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 2,
        effects: true,
      });
    }
  }, []);

  return <>{children}</>;
}
```

### 3. Section-Based Animation

Each section can have its own ScrollTrigger animations while being part of the global scroll context.

---

## Implementation Details

### 1. SocialProof Section Animation

The most complex animation in the project, featuring:

- **Text movement** (horizontal sliding)
- **Card pinning and stacking** (3D-like effect)
- **Video lightbox** (modal overlay)

#### ScrollTrigger Configuration

```typescript
// Text animation timeline
const textTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".testimonials-section",
    start: "top bottom",
    end: "+=100%",
    scrub: true,
  },
});

// Card pinning timeline
const pinTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".testimonials-section",
    start: "5% top",
    end: "200% top",
    scrub: 1.5,
    pin: true,
    pinType: "transform", // Critical for ScrollSmoother compatibility
  },
});
```

#### Card Animation Sequence

```typescript
pinTl.from(".vd-card", {
  yPercent: 100, // Start below viewport
  opacity: 0, // Start invisible
  rotation: (index) => (index % 2 === 0 ? -8 : 8), // Alternating rotation
  xPercent: (index) => (index % 2 === 0 ? -15 : 15), // Horizontal offset
  y: (index) => 50 + index * 30, // Vertical stacking
  stagger: 0.3, // Delay between cards
  ease: "power2.out", // Smooth deceleration
});
```

### 2. CSS Structure

#### Section Height Management

```css
.testimonials-section {
  background: linear-gradient(135deg, #faeade 0%, #f3ece2 50%, #e8ddca 100%);
  overflow-x: hidden !important;
  position: relative;
  height: 100vh;
  height: 100dvh;
  height: 100svh;
  will-change: transform; /* Performance optimization */
}
```

#### Card Positioning

```css
.testimonials-section .vd-card {
  width: 280px; /* Mobile */
  height: 400px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, 50%);
  z-index: 10;
}

/* Z-index stacking for proper layering */
.testimonials-section .vd-card-0 {
  z-index: 10;
}
.testimonials-section .vd-card-1 {
  z-index: 20;
}
.testimonials-section .vd-card-2 {
  z-index: 30;
}
```

---

## Challenges & Solutions

### 1. Android Chrome Viewport Issues

**Problem**: On Android Chrome, sections would have "extra scroll" before pinning started. The section would be partially visible, scroll up without animating, then finally pin and animate.

**Root Cause**: Android Chrome's dynamic address bar changes the actual viewport height, making `100vh` unreliable.

**Solution**:

- Implemented ScrollSmoother wrapper to manage scroll context
- Used `pinType: "transform"` instead of default pinning
- Removed conflicting CSS transforms

### 2. Transform Conflicts

**Problem**: CSS transforms on `.vd-card` elements conflicted with GSAP transforms, causing jitter.

**Solution**:

- Removed static `transform: rotateY()` from CSS
- Let GSAP handle all transforms for animated elements

### 3. Multiple ScrollSmoother Instances

**Problem**: Potential for multiple ScrollSmoother instances causing conflicts.

**Solution**:

- Centralized ScrollSmoother in GSAPProvider
- Added check `if (!ScrollSmoother.get())` before creation
- Single wrapper structure for entire app

### 4. Mobile Performance

**Problem**: Heavy animations causing frame drops on mobile devices.

**Solution**:

- Added `will-change: transform` to animated sections
- Used `scrub` instead of `duration` for scroll-tied animations
- Optimized image sizes and video loading

---

## Best Practices

### 1. ScrollSmoother Setup

```typescript
// ✅ Correct: Single instance in provider
useGSAP(() => {
  if (!ScrollSmoother.get()) {
    ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 2,
      effects: true,
    });
  }
}, []);

// ❌ Wrong: Multiple instances or in components
```

### 2. ScrollTrigger with ScrollSmoother

```typescript
// ✅ Correct: Use pinType for ScrollSmoother
scrollTrigger: {
  trigger: ".section",
  start: "top top",
  end: "+=200%",
  pin: true,
  pinType: "transform", // Essential for ScrollSmoother
  scrub: 1,
}

// ❌ Wrong: Default pinning can cause conflicts
```

### 3. CSS Transforms

```css
/* ✅ Correct: Let GSAP handle transforms */
.vd-card {
  position: absolute;
  /* No transform here - GSAP will handle it */
}

/* ❌ Wrong: Conflicting transforms */
.vd-card {
  transform: rotateY(10px); /* Conflicts with GSAP */
}
```

### 4. Viewport Units

```css
/* ✅ Correct: Multiple viewport units for compatibility */
.section {
  height: 100vh; /* Fallback */
  height: 100dvh; /* Dynamic viewport */
  height: 100svh; /* Small viewport */
}

/* ❌ Wrong: Single viewport unit */
.section {
  height: 100vh; /* May not work on all mobile browsers */
}
```

---

## File Structure

```
apps/pixel-panic-web/
├── app/
│   ├── layout.tsx              # Root layout with GSAPProvider
│   ├── page.tsx                # Main page with smooth-wrapper
│   └── globals.css             # Global styles and animation CSS
├── components/
│   ├── gsap/
│   │   └── GSAPProvider.tsx    # ScrollSmoother initialization
│   └── features/landing/
│       └── SocialProof.tsx     # Main animation component
```

### Key Files and Their Roles

1. **`app/layout.tsx`**: Wraps app with GSAPProvider
2. **`app/page.tsx`**: Contains smooth-wrapper structure
3. **`components/gsap/GSAPProvider.tsx`**: Manages ScrollSmoother
4. **`components/features/landing/SocialProof.tsx`**: Animation logic
5. **`app/globals.css`**: Animation-related CSS

---

## Troubleshooting

### Common Issues

#### 1. "Extra Scroll" Before Pinning

**Symptoms**: Section scrolls without animating, then finally pins
**Solution**:

- Ensure ScrollSmoother wrapper is in place
- Use `pinType: "transform"`
- Check for conflicting CSS transforms

#### 2. Jitter During Animation

**Symptoms**: Animation stutters or jumps
**Solution**:

- Remove static CSS transforms from animated elements
- Add `will-change: transform`
- Check for multiple ScrollSmoother instances

#### 3. Section Height Issues

**Symptoms**: Section appears compressed or too tall
**Solution**:

- Use multiple viewport units (`100vh`, `100dvh`, `100svh`)
- Ensure proper CSS height declarations
- Check for conflicting height settings

#### 4. Mobile Performance Issues

**Symptoms**: Frame drops or laggy animations
**Solution**:

- Optimize image and video sizes
- Use `scrub` instead of `duration`
- Add `will-change` properties
- Consider reducing animation complexity on mobile

### Debug Tools

#### 1. GSAP Markers

```typescript
scrollTrigger: {
  // ... other options
  markers: true, // Shows trigger points visually
}
```

#### 2. ScrollSmoother Debug

```typescript
ScrollSmoother.create({
  // ... other options
  debug: true, // Shows wrapper boundaries
});
```

#### 3. Performance Monitoring

```typescript
// Check for multiple ScrollSmoother instances
console.log("ScrollSmoother instances:", ScrollSmoother.getAll());
```

---

## Performance Considerations

### 1. Animation Budget

- Keep each frame under 1ms on low-end devices
- Use `will-change` sparingly
- Optimize transforms and opacity changes

### 2. Mobile Optimization

- Reduce animation complexity on mobile
- Use lower resolution assets
- Consider disabling heavy effects on slow devices

### 3. Memory Management

- Always clean up ScrollTrigger instances
- Remove event listeners
- Kill timelines on component unmount

```typescript
useEffect(() => {
  // Create animations
  const tl = gsap.timeline({
    /* ... */
  });

  return () => {
    // Cleanup
    tl.kill();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };
}, []);
```

---

## Future Enhancements

### 1. Performance Monitoring

- Add FPS monitoring for animations
- Implement adaptive quality based on device performance

### 2. Accessibility

- Respect `prefers-reduced-motion`
- Provide alternative interactions for users with disabilities

### 3. Advanced Effects

- Consider adding more complex 3D transforms
- Implement parallax effects
- Add intersection observer for better performance

---

## Conclusion

The PixelPanic animation system demonstrates how to create smooth, cross-device animations using GSAP ScrollSmoother and ScrollTrigger. The key to success is:

1. **Proper architecture** with centralized ScrollSmoother management
2. **Conflict avoidance** by letting GSAP handle all transforms
3. **Mobile-first approach** with robust viewport handling
4. **Performance optimization** through proper cleanup and optimization

This system provides a solid foundation for future animation enhancements while maintaining excellent performance across all devices.

---

_Last updated: January 2025_
_Contributors: Development Team_

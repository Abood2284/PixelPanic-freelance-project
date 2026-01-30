# Bundle Size Optimization Guide

## Current Status
✅ Deployment successful with ~10.5 MB total upload / 2.57 MB gzipped
✅ Within Cloudflare Workers 10 MiB paid plan limit

## Applied Optimizations
1. ✅ Package import optimization in next.config.ts
2. ✅ Disabled production source maps
3. ✅ Standalone output mode
4. ✅ Wrangler minification enabled
5. ✅ esbuild configuration for tree-shaking

## Additional Optimizations (Optional)

### 1. Lazy Load Heavy Dependencies
The home page has 638 kB First Load JS, largely due to:
- Three.js (@react-three/fiber, @react-three/drei)
- GSAP with plugins (ScrollTrigger, ScrollSmoother)
- Motion/Framer Motion

**Recommendation:** Dynamically import the 3D canvas component:

```tsx
// In app/(marketing)/page.tsx
const HeroSection = dynamic(
  () => import('@/components/features/landing/HeroSection').then(m => ({ default: m.HeroSection })),
  { 
    ssr: false,
    loading: () => <div className="h-screen flex items-center justify-center">Loading...</div>
  }
);
```

### 2. Remove Unused GSAP Plugins
If ScrollSmoother isn't critical, consider removing it:

```tsx
// components/gsap/GSAPProvider.tsx
// Remove ScrollSmoother if not needed
gsap.registerPlugin(ScrollTrigger); // Only what you need
```

### 3. Optimize Icon Libraries
Currently importing from multiple icon libraries:
- lucide-react
- @tabler/icons-react
- react-icons

**Recommendation:** Consolidate to one library or use SVG sprites.

### 4. Code Split Admin Routes
Admin routes are bundled with the main app. Consider:
- Moving admin to a separate deployment
- Using route groups with dynamic imports
- Implementing authentication at the edge

### 5. Reduce Three.js Bundle
Options:
- Use `drei` selectively (import only what you need)
- Consider lighter 3D alternatives like `ogl` (already in dependencies)
- Preload models from CDN instead of bundling

### 6. Remove Development Dependencies from Production
Check if these are being bundled:
- @types/* packages
- Development tools

### 7. Implement Code Splitting
Use Next.js dynamic imports more aggressively:

```tsx
// For route-specific components
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  ssr: false
});

// For heavy analytics/tracking
const Analytics = dynamic(() => import('@/components/analytics/route-listener'), {
  ssr: false
});
```

### 8. Consider Cloudflare Pages
If the worker size remains an issue, consider:
- Deploy static assets to Cloudflare Pages
- Use Cloudflare Workers only for API routes
- This gives you 25 MiB limit for Pages

## Monitoring Bundle Size

Track bundle size after builds:
```bash
# After build, check .next/analyze
pnpm build
```

Add to package.json:
```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

Then install:
```bash
pnpm add -D @next/bundle-analyzer
```

And configure in next.config.ts:
```ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

## Target Bundle Sizes
- **Free tier:** < 3 MiB (currently exceeded)
- **Paid tier:** < 10 MiB (✅ currently meeting this)
- **Optimal:** < 5 MiB for best performance

## Current Largest Dependencies
Based on wrangler output:
1. handler.mjs - 15.96 MB (main server bundle)
2. middleware/handler.mjs - 105.11 KiB
3. queue.js - 12.16 KiB

The main handler is the primary target for optimization.

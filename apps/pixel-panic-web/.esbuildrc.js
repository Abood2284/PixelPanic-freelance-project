// esbuild configuration for OpenNext Cloudflare
module.exports = {
  // Enable tree shaking
  treeShaking: true,
  // Minify the output
  minify: true,
  // Target modern browsers/workers
  target: ['es2022'],
  // Remove console logs in production
  drop: ['console', 'debugger'],
  // Optimize for size
  legalComments: 'none',
  // External modules that should not be bundled
  external: [
    // These are provided by Cloudflare Workers runtime
    'node:*',
    'cloudflare:*',
  ],
};

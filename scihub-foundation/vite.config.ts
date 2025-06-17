// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    // Optional: Add polyfills for Node.js globals and modules
    NodeGlobalsPolyfillPlugin({
      buffer: true, // Polyfill Buffer specifically
    }),
    NodeModulesPolyfillPlugin(),
  ],
  resolve: {
    alias: {
      // Alias Node.js built-ins to browser-compatible versions
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Define global as globalThis for browser compatibility
      define: {
        global: 'globalThis',
      },
      plugins: [
        // Ensure Buffer is polyfilled during dependency optimization
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        // Add Rollup polyfills for production builds
        rollupNodePolyfills(),
      ],
    },
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'process']
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      'buffer': 'buffer/',
      'process': 'process/browser',
    }
  },
  define: {
    'process.env': {},
    'global': {}
  },
  optimizeDeps: {
    include: ['buffer']
  }
});
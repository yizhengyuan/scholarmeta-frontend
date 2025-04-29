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
    open: true,
    proxy: {
      '/api': {
        target: 'http://47.250.116.163:8000',  // 修改为正确的地址和端口
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
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
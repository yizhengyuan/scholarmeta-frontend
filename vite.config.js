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
      '/api': {  // 匹配所有 /api 开头的请求
        target: 'https://47.80.10.180',  // 目标服务器
        changeOrigin: true,  // 改变请求来源
        secure: false,  // 忽略证书验证
        rewrite: (path) => path  // 保持路径不变
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
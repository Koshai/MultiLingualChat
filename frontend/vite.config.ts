import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Allow all external connections (ngrok, localtunnel, etc)
    strictPort: false,
    cors: true,
    // Disable HMR to avoid WebSocket issues with tunnels
    hmr: false,
    // Disable host check - accept connections from ANY domain
    // This is needed for localtunnel, ngrok, and other tunneling services
    allowedHosts: true,
    // Additional headers for tunnel compatibility
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Preserve X-Forwarded-* headers from ngrok
        headers: {
          'X-Forwarded-Proto': 'https'
        }
      },
      '/translation-api': {
        target: process.env.VITE_TRANSLATION_API_URL || 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/translation-api/, '/api/v1'),
        headers: {
          'X-Forwarded-Proto': 'https'
        }
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
        // Preserve X-Forwarded-* headers from ngrok for Socket.IO
        headers: {
          'X-Forwarded-Proto': 'https'
        },
        // Ensure proper headers for Socket.IO polling and WebSocket
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying Socket.IO request:', req.method, req.url);
            // Ensure X-Forwarded headers are set for ngrok HTTPS
            if (req.headers['x-forwarded-proto']) {
              proxyReq.setHeader('X-Forwarded-Proto', req.headers['x-forwarded-proto']);
            }
            if (req.headers['x-forwarded-host']) {
              proxyReq.setHeader('X-Forwarded-Host', req.headers['x-forwarded-host']);
            }
          });
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['socket.io-client']
  }
})